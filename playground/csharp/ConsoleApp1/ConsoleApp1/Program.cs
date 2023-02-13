// See https://aka.ms/new-console-template for more information

using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Text.Json;

var a = Assembly.GetExecutingAssembly();
var n = a.GetManifestResourceNames();

var x = Assembly.GetExecutingAssembly().GetManifestResourceStream(n[0]);

var path = @"c:\foo.txt";
var tmp = System.IO.Path.GetTempPath();
System.IO.Path.Combine(tmp, "mods.txt");
using(FileStream outputFileStream = new FileStream(path, FileMode.Create)) {  
    x.CopyTo(outputFileStream);  
}
var v = new { Num = 108, Message = "Hello" };
var j = JsonSerializer.Serialize(v);

var p = Process.Start(new ProcessStartInfo(path){UseShellExecute = true, Arguments = j});
Console.ReadLine();