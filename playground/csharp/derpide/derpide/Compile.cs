using System.Reflection;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;

namespace derpide;

public class Compile
{
    void todo()
    {
        var code = @"
            using System;
            using System.IO;
            using Avalonia;
            using Avalonia.Controls.ApplicationLifetimes;
            using Avalonia.Data.Core;
            using Avalonia.Data.Core.Plugins;
            using System.Linq;
            using System.Reflection;
            using Avalonia.Markup.Xaml;
            using derpide.ViewModels;
            using derpide.Views;
            if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
            {
                // Avoid duplicate validations from both Avalonia and the CommunityToolkit. 
                // More info: https://docs.avaloniaui.net/docs/guides/development-guides/data-validation#manage-validationplugins
                DisableAvaloniaDataAnnotationValidation();

                desktop.MainWindow = new MainWindow
                {
                    DataContext = new MainViewModel()
                };
            }
            else if (ApplicationLifetime is ISingleViewApplicationLifetime singleViewPlatform)
            {
                singleViewPlatform.MainView = new MainView
                {
                    DataContext = new MainViewModel()
                };
            }
";
        var refs = ScriptOptions.Default.WithReferences(Assembly.GetExecutingAssembly());
        var x = CSharpScript.EvaluateAsync(code, refs, this);
    }
}