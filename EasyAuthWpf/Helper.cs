using System;
using System.Windows;
using Microsoft.Web.WebView2.Core;
using Newtonsoft.Json;

namespace EasyAuthWpf
{
    public class Helper
    {
        
        public static void EasyAuthLogout(string appServiceName)
        {
            try
            {
                var win = new Window();
                var webView = new Microsoft.Web.WebView2.Wpf.WebView2();

                async void OnWebViewOnLoaded(object sender, RoutedEventArgs e)
                {
                    await webView.EnsureCoreWebView2Async();
                    webView.Source = new System.Uri($"https://{appServiceName}.azurewebsites.net/.auth/logout");

                    void OnWebViewOnNavigationCompleted(object o, CoreWebView2NavigationCompletedEventArgs eventArgs)
                    {
                        if (webView.Source.AbsolutePath.EndsWith("/authorize", StringComparison.InvariantCultureIgnoreCase))
                        {
                            webView.Source = new System.Uri($"https://{appServiceName}.azurewebsites.net/.auth/logout/complete");
                        }
                        //if (webView.Source)//win.DialogResult = true;
                        //win.Close();
                    }

                    webView.NavigationCompleted += OnWebViewOnNavigationCompleted;
                }

                webView.Loaded += OnWebViewOnLoaded;
                win.Content = webView;
                win.ShowDialog();
            }
            catch (Exception e)
            {
                
            }
        }
        public static void EasyAuthLogin(string appServiceName, Action<object> onSuccess, Action onCancel = null,
            Action<Exception> onError = null)
        {
            try
            {
                var win = new Window();
                var webView = new Microsoft.Web.WebView2.Wpf.WebView2();
                //https://github.com/MicrosoftEdge/WebView2Feedback/issues/911#issuecomment-775910990
                async void OnWebViewOnLoaded(object sender, RoutedEventArgs e)
                {
                    await webView.EnsureCoreWebView2Async();
                    webView.Source = new System.Uri($"https://{appServiceName}.azurewebsites.net/.auth/me");

                    async void OnWebViewOnNavigationCompleted(object o, CoreWebView2NavigationCompletedEventArgs eventArgs)
                    {
                        const string script = @"
if (!window.tokenLoginInterval) {
    function checkForToken() {
        var txt = document.body.innerText;
        var o = JSON.parse(txt);
        if (o[0].id_token) {
            console.log('clear');
            clearInterval(window.tokenLoginInterval);
            var msg = {
                event: 'TokenLoaded',
                data: o
            };
            console.log('post');
            window.chrome.webview.postMessage(msg);
        }
    }

    window.tokenLoginInterval=setInterval(checkForToken, 50);
    console.log('setInterval',window.tokenLoginInterval);
}
";
                        await webView.ExecuteScriptAsync(script);
                    }

                    webView.NavigationCompleted += OnWebViewOnNavigationCompleted;
                    //https://github.com/MicrosoftEdge/WebView2Feedback/issues/253
                    void OnWebMessageReceived(object o, CoreWebView2WebMessageReceivedEventArgs eventArgs)
                    {
                        dynamic d = JsonConvert.DeserializeObject(eventArgs.WebMessageAsJson);
                        if (d.@event != "TokenLoaded") return;
                        //var token = d.data[0].id_token;
                        win.DialogResult = true;
                        win.Close();
                        onSuccess?.Invoke(d.data);
                    }

                    webView.CoreWebView2.WebMessageReceived += OnWebMessageReceived;
                }

                webView.Loaded += OnWebViewOnLoaded;
                win.Content = webView;
                var res = win.ShowDialog() ?? false;
                if (!res)
                {
                    onCancel?.Invoke();
                }
            }
            catch (Exception e)
            {
                onError?.Invoke(e);
            }
            
        }
    }
}