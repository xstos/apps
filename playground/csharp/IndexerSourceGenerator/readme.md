# C# Source generator boilerplate to eventually create an index of class names to be loaded dynamically

To debug, open the solution, clean, build IndexerSourceGenerator, then build GeneratorUsageExample. A prompt will appear to attach to visual studio to debug it. 

Couldn't figure out a way to get the csproj location and output path from the generator, so I hacked in a coarse method to crawl the source tree to find the .git folder.
