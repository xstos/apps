using System;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]
namespace EasyAuthWpf
{
    class Program
    {
        static async Task<string> GetHttpContentWithToken(string url, string token)
        {
            var httpClient = new System.Net.Http.HttpClient();
            try
            {
                var request = new System.Net.Http.HttpRequestMessage(System.Net.Http.HttpMethod.Get, url);
                //Add the token in Authorization header
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                var response = await httpClient.SendAsync(request);
                var content = await response.Content.ReadAsStringAsync();
                return content;
            }
            catch (Exception ex)
            {
                return ex.ToString();
            }
        }

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
            var appServiceName = "<enter appservice name here>"; //i.e. https://<appServiceName>.azurewebsites.net/
            login.Click += (sender, eventArgs) =>
            {
                Helper.EasyAuthLogin(appServiceName, async o =>
                {
                    dynamic d = o;
                    var id_token = d[0].id_token;
                    var response = await GetHttpContentWithToken($"https://{appServiceName}.azurewebsites.net", (string) id_token);
                },() => {}, exception => {});
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
