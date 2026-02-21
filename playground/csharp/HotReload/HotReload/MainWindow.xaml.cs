using System;
using System.IO;
using System.Reflection;
using System.Windows;
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
        static string LoadFile(string path)
        {
            try
            {
                using(FileStream fileStream = new FileStream(
                          path,
                          FileMode.Open,
                          FileAccess.Read,
                          FileShare.ReadWrite))
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
        public MainWindow()
        {
            InitializeComponent();
            this.Loaded += (sender, args) =>
            {
                Win = this;
                Mono = new Mono.CSharp.Evaluator(new CompilerContext(new CompilerSettings(), new ConsoleReportPrinter()));
                Mono.ReferenceAssembly(Assembly.GetExecutingAssembly());
                void reload()
                {
                    try
                    {
                        var name = "X"+DateTime.Now.Ticks;
                        var src = LoadFile(@"C:\repos\xstos\apps\playground\csharp\HotReload\HotReload\src\Hot.cs");
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
                var fsw = new FileSystemWatcher(@"C:\repos\xstos\apps\playground\csharp\HotReload\HotReload\src\");
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