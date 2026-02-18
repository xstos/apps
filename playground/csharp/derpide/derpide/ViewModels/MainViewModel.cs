using CommunityToolkit.Mvvm.ComponentModel;

namespace derpide.ViewModels;

public partial class MainViewModel : ViewModelBase
{
    [ObservableProperty] string _greeting = "Welcome to Avalonia!";
}