using System;
using System.Diagnostics;


var plr = new GreedyPLR(0.1);
var segs = plr.ProcessMany((0,0),(1,1),(2,0)).ToList();

var x=2;