using System.Drawing.Imaging;
using System.Reflection;

public class DemoViewer
{
    private static TrackBar headingSlider, pitchSlider, rollSlider;

    //converted from http://blog.rogach.org/2015/08/how-to-create-your-own-simple-3d-render.html
    //dotnet publish -r win-x64 --self-contained
    public static void Main(string[] args)
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);

        Form frame = new Form();
        
        frame.Size = new Size(400, 400);

        // Panel to display render results
        Panel renderPanel = new Panel();
        renderPanel.Dock = DockStyle.Fill;
        typeof(Panel).InvokeMember("DoubleBuffered", BindingFlags.SetProperty | BindingFlags.Instance | BindingFlags.NonPublic, null,
            renderPanel, new object[] { true }); 
        renderPanel.Paint += (sender, e) =>
        {
            RenderPanel_Paint(e.Graphics, renderPanel.Width, renderPanel.Height);
        };
        frame.Controls.Add(renderPanel);

        // Slider to control horizontal rotation
        headingSlider = new TrackBar();
        headingSlider.Minimum = -180;
        headingSlider.Maximum = 180;
        headingSlider.Value = 0;
        headingSlider.Dock = DockStyle.Bottom;
        headingSlider.Scroll += (sender, e) => renderPanel.Invalidate();
        frame.Controls.Add(headingSlider);

        // Slider to control vertical rotation
        pitchSlider = new TrackBar();
        pitchSlider.Minimum = -90;
        pitchSlider.Maximum = 90;
        pitchSlider.Value = 0;
        pitchSlider.Orientation = Orientation.Vertical;
        pitchSlider.Dock = DockStyle.Right;
        pitchSlider.Scroll += (sender, e) => renderPanel.Invalidate();
        frame.Controls.Add(pitchSlider);

        // Slider to control roll
        rollSlider = new TrackBar();
        rollSlider.Minimum = -90;
        rollSlider.Maximum = 90;
        rollSlider.Value = 0;
        rollSlider.Orientation = Orientation.Vertical;
        rollSlider.Dock = DockStyle.Left;
        rollSlider.Scroll += (sender, e) => renderPanel.Invalidate();
        frame.Controls.Add(rollSlider);

        Application.Run(frame);
    }

    private static void RenderPanel_Paint(Graphics g, int width, int height)
    {
        List<Triangle> tris = new List<Triangle>
        {
            new Triangle(new Vertex(100, 100, 100), new Vertex(-100, -100, 100), new Vertex(-100, 100, -100), Color.White),
            new Triangle(new Vertex(100, 100, 100), new Vertex(-100, -100, 100), new Vertex(100, -100, -100), Color.Red),
            new Triangle(new Vertex(-100, 100, -100), new Vertex(100, -100, -100), new Vertex(100, 100, 100), Color.Green),
            new Triangle(new Vertex(-100, 100, -100), new Vertex(100, -100, -100), new Vertex(-100, -100, 100), Color.Blue)
        };

        for (int i = 0; i < 4; i++)
        {
            tris = Inflate(tris);
        }

        // Apply transformations based on sliders
        double heading = Math.PI * headingSlider.Value / 180.0;
        Matrix3 headingTransform = new Matrix3(new double[] {
            Math.Cos(heading), 0, -Math.Sin(heading),
            0, 1, 0,
            Math.Sin(heading), 0, Math.Cos(heading)
        });

        double pitch = Math.PI * pitchSlider.Value / 180.0;
        Matrix3 pitchTransform = new Matrix3(new double[] {
            1, 0, 0,
            0, Math.Cos(pitch), Math.Sin(pitch),
            0, -Math.Sin(pitch), Math.Cos(pitch)
        });

        double roll = Math.PI * rollSlider.Value / 180.0;
        Matrix3 rollTransform = new Matrix3(new double[] {
            Math.Cos(roll), -Math.Sin(roll), 0,
            Math.Sin(roll), Math.Cos(roll), 0,
            0, 0, 1
        });

        Matrix3 transform = headingTransform.Multiply(pitchTransform).Multiply(rollTransform);

        Bitmap img = new Bitmap(width, height, PixelFormat.Format32bppArgb);
        double[] zBuffer = new double[img.Width * img.Height];
        for (int i = 0; i < zBuffer.Length; i++)
        {
            zBuffer[i] = double.NegativeInfinity;
        }

        foreach (Triangle t in tris)
        {
            Vertex v1 = transform.Transform(t.v1);
            v1.x += width / 2.0;
            v1.y += height / 2.0;
            Vertex v2 = transform.Transform(t.v2);
            v2.x += width / 2.0;
            v2.y += height / 2.0;
            Vertex v3 = transform.Transform(t.v3);
            v3.x += width / 2.0;
            v3.y += height / 2.0;

            Vertex ab = new Vertex(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
            Vertex ac = new Vertex(v3.x - v1.x, v3.y - v1.y, v3.z - v1.z);
            Vertex norm = new Vertex(
                ab.y * ac.z - ab.z * ac.y,
                ab.z * ac.x - ab.x * ac.z,
                ab.x * ac.y - ab.y * ac.x
            );
            double normalLength = Math.Sqrt(norm.x * norm.x + norm.y * norm.y + norm.z * norm.z);
            norm.x /= normalLength;
            norm.y /= normalLength;
            norm.z /= normalLength;

            double angleCos = Math.Abs(norm.z);

            int minX = (int)Math.Max(0, Math.Ceiling(Math.Min(v1.x, Math.Min(v2.x, v3.x))));
            int maxX = (int)Math.Min(img.Width - 1, Math.Floor(Math.Max(v1.x, Math.Max(v2.x, v3.x))));
            int minY = (int)Math.Max(0, Math.Ceiling(Math.Min(v1.y, Math.Min(v2.y, v3.y))));
            int maxY = (int)Math.Min(img.Height - 1, Math.Floor(Math.Max(v1.y, Math.Max(v2.y, v3.y))));

            double triangleArea = (v1.y - v3.y) * (v2.x - v3.x) + (v2.y - v3.y) * (v3.x - v1.x);
            double taRecip = 1.0 / triangleArea;
            for (int y = minY; y <= maxY; y++)
            {
                for (int x = minX; x <= maxX; x++)
                {
                    double b1 = ((y - v3.y) * (v2.x - v3.x) + (v2.y - v3.y) * (v3.x - x)) * taRecip;
                    double b2 = ((y - v1.y) * (v3.x - v1.x) + (v3.y - v1.y) * (v1.x - x)) * taRecip;
                    double b3 = ((y - v2.y) * (v1.x - v2.x) + (v1.y - v2.y) * (v2.x - x)) * taRecip;
                    if (b1 >= 0 && b1 <= 1 && b2 >= 0 && b2 <= 1 && b3 >= 0 && b3 <= 1)
                    {
                        double depth = b1 * v1.z + b2 * v2.z + b3 * v3.z;
                        int zIndex = y * img.Width + x;
                        if (zBuffer[zIndex] < depth)
                        {
                            img.SetPixel(x, y, GetShade(t.color, angleCos));
                            zBuffer[zIndex] = depth;
                        }
                    }
                }
            }
        }

        g.DrawImage(img, 0, 0);
    }

    public static Color GetShade(Color color, double shade)
    {
        double redLinear = Math.Pow(color.R, 2.4) * shade;
        double greenLinear = Math.Pow(color.G, 2.4) * shade;
        double blueLinear = Math.Pow(color.B, 2.4) * shade;

        int red = (int)Math.Pow(redLinear, 1 / 2.4);
        int green = (int)Math.Pow(greenLinear, 1 / 2.4);
        int blue = (int)Math.Pow(blueLinear, 1 / 2.4);

        return Color.FromArgb(red, green, blue);
    }

    public static List<Triangle> Inflate(List<Triangle> tris)
    {
        List<Triangle> result = new List<Triangle>();
        foreach (Triangle t in tris)
        {
            Vertex m1 = new Vertex((t.v1.x + t.v2.x) / 2, (t.v1.y + t.v2.y) / 2, (t.v1.z + t.v2.z) / 2);
            Vertex m2 = new Vertex((t.v2.x + t.v3.x) / 2, (t.v2.y + t.v3.y) / 2, (t.v2.z + t.v3.z) / 2);
            Vertex m3 = new Vertex((t.v1.x + t.v3.x) / 2, (t.v1.y + t.v3.y) / 2, (t.v1.z + t.v3.z) / 2);
            result.Add(new Triangle(t.v1, m1, m3, t.color));
            result.Add(new Triangle(t.v2, m1, m2, t.color));
            result.Add(new Triangle(t.v3, m2, m3, t.color));
            result.Add(new Triangle(m1, m2, m3, t.color));
        }

        foreach (Triangle t in result)
        {
            foreach (Vertex v in new[] { t.v1, t.v2, t.v3 })
            {
                double l = Math.Sqrt(v.x * v.x + v.y * v.y + v.z * v.z) / Math.Sqrt(30000);
                v.x /= l;
                v.y /= l;
                v.z /= l;
            }
        }

        return result;
    }
}

public class Vertex
{
    public double x, y, z;
    public Vertex(double x, double y, double z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

public class Triangle
{
    public Vertex v1, v2, v3;
    public Color color;
    public Triangle(Vertex v1, Vertex v2, Vertex v3, Color color)
    {
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
        this.color = color;
    }
}

public class Matrix3
{
    public double[] values;
    public Matrix3(double[] values)
    {
        this.values = values;
    }

    public Matrix3 Multiply(Matrix3 other)
    {
        double[] result = new double[9];
        for (int row = 0; row < 3; row++)
        {
            for (int col = 0; col < 3; col++)
            {
                for (int i = 0; i < 3; i++)
                {
                    result[row * 3 + col] += this.values[row * 3 + i] * other.values[i * 3 + col];
                }
            }
        }
        return new Matrix3(result);
    }

    public Vertex Transform(Vertex input)
    {
        return new Vertex(
            input.x * values[0] + input.y * values[3] + input.z * values[6],
            input.x * values[1] + input.y * values[4] + input.z * values[7],
            input.x * values[2] + input.y * values[5] + input.z * values[8]
        );
    }
}
