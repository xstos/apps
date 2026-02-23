using System;
using System.IO;
using System.Reflection;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using Mono.CSharp;

namespace HotReload
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public static Evaluator Mono;
        public static MainWindow Win { get; set; }
        static int Count=0;
        static string LoadFile(string path)
        {
            try
            {
                using(FileStream fileStream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                {
                    using(StreamReader streamReader = new StreamReader(fileStream))
                    {
                        return streamReader.ReadToEnd();
                    }
                }

            }
            catch(Exception ex)
            {
                Console.WriteLine("Error loading log file: " + ex.Message);
            }

            return "";
        }

        static string GetSrcPath()
        {
            var location = Assembly.GetEntryAssembly().Location;
            var fi = new FileInfo(location);
            var dir = fi.DirectoryName+"../../../../src";
            return Path.GetFullPath(dir);
        }
        public MainWindow()
        {
            InitializeComponent();
            this.Loaded += (sender, args) =>
            {
                Win = this;
                Mono = new Evaluator(new CompilerContext(new CompilerSettings(), new ConsoleReportPrinter()));
                Mono.ReferenceAssembly(Assembly.GetExecutingAssembly());
                Mono.ReferenceAssembly(typeof(DockPanel).Assembly);
                Mono.ReferenceAssembly(typeof(SolidColorBrush).Assembly);
                var srcPath = GetSrcPath();
                var hotPath = Path.Combine(srcPath, "Hot.cs");
                void reload()
                {
                    try
                    {
                        var name = "X"+Count++;
                        var src = LoadFile(hotPath);
                        src = src.Replace("RENAME_ME", name);
                        Mono.Run(src);
                        Mono.Run($"{name}.Hot.Run();");
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                    }
                    
                }
                reload();
                var fsw = new FileSystemWatcher(srcPath);
                fsw.EnableRaisingEvents = true;
                
                fsw.Changed += (o, eventArgs) =>
                {
                    var path = eventArgs.FullPath.ToLower();
                    if (path.EndsWith("~")) return;
                    if (!path.EndsWith("hot.cs"))
                    {
                        var src = LoadFile(path);
                        try
                        {
                            Mono.Run(src);
                        }
                        catch (Exception e)
                        {
                            Console.WriteLine(e);
                        }
                    }

                    reload();
                };
            };
        }
    }
}