using System.Diagnostics;

//this program opens VLC and starts recording for a user-supplied number of minutes
//intended to be used with the windows task scheduler
//example arguments (numMinutes recordPath muxType streamUrl):
//1 c:\recordings ts http://somestream.foo:80/whatever

var commandLineArgs = Environment.GetCommandLineArgs();

var numMinutes = int.Parse(commandLineArgs[1]);
var recordPath = commandLineArgs[2];
var mux = commandLineArgs[3];
var streamUrl = commandLineArgs[4];

var vlmPath = Path.Combine(recordPath, "my.vlm");

static string formatDate(DateTime t)
{
    var yyyy = t.ToString("yyyy");
    var mm = t.ToString("MM");
    var dd = t.ToString("dd");
    var hh = t.ToString("HH");
    var min = t.ToString("mm");
    var sec = t.ToString("ss");
    return $@"{yyyy}/{mm}/{dd}-{hh}:{min}:{sec}";
} 

void generateVlcConfig(DateTime from, DateTime to)
{
    var start = formatDate(from);
    var end = formatDate(to);
    
    var fileName = from.ToString("yyyy.MM.dd-hh.mm.ss")+"."+mux;
    var filePath = Path.Combine(recordPath, fileName);
    var std = $@"access=file,mux={mux},dst='{filePath}'";
    
    var dest = "#std{" + std + "}";
    var vlm = $@"
new record broadcast enabled input {streamUrl} output {dest}
new start schedule enabled date {start} append control record play
new end schedule enabled date {end} append control record stop
".Trim();
    
    File.WriteAllText(vlmPath,vlm);
    Console.WriteLine(vlm);
}

var currentTime = DateTime.Now;

var startTime = currentTime.AddSeconds(10);
var endTime = startTime.AddMinutes(numMinutes);

generateVlcConfig(startTime, endTime);

var p = new Process();
p.StartInfo = new ProcessStartInfo();
p.StartInfo.FileName = @"C:\Program Files\VideoLAN\VLC\vlc.exe";
p.StartInfo.Arguments = $@"--vlm-conf ""{vlmPath}""";
p.StartInfo.WorkingDirectory = recordPath;
p.StartInfo.UseShellExecute = true;
Console.WriteLine("launching vlc");
p.Start();
var waitSpan = new TimeSpan(0, 0, numMinutes, 10);
var waitMs = (int)waitSpan.TotalMilliseconds;
Console.WriteLine("waiting "+waitSpan);
Thread.Sleep(waitMs);

p.Kill();

Environment.Exit(0);