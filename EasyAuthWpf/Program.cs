using System;
using System.Windows;
using System.Windows.Controls;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]
namespace EasyAuthWpf
{
    class Program
    {
        [STAThread]
        public static void Main(string[] args)
        {
            var win = new Window
            {
                Left = 0,
                Top = 0,
                Width = 1200,
                Height = 1200,
            };
            var sp = new StackPanel();
            var login = new Button() {Content = "Login"};
            var logout = new Button() {Content = "Logout"};
            var appServiceName = "<enter appservice name here>"; //i.e. https://<appServiceName>.azurewbsites.net/
            login.Click += (sender, eventArgs) =>
            {
                Helper.EasyAuthLogin(appServiceName,o => {},() => {}, exception => {});
            };
            logout.Click += (sender, eventArgs) =>
            {
                Helper.EasyAuthLogout(appServiceName);
            };
            sp.Children.Add(login);
            sp.Children.Add(logout);
            win.Content = sp;
            var app = new Application();
            app.Run(win);
        }

    }
}
