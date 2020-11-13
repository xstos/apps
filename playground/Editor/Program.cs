using System;
using System.Collections.Generic;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using WpfPlus;

namespace Cells
{
    public static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            var app = App.BuildApp();
            app.Run(app.MainWindow);
        }
    }
}
