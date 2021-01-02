---
title: "Create a NuGet package that targets both .NET Standard and PCL"
date: "2019-09-01"
---

Recently when migrating a library to .NET Standard, I needed to keep it compatible as a Portable Class Library (PCL) for a Xamarin project.

I was able to accomplish this without duplicating any code by using a Shared Project. All of the code lives in the Shared Project, and then there are projects for each target framework that reference the Shared Project.

The solution has this structure:

- Example.sln
  - Example.Shared.csproj (Shared Project)
  - Example.NetStandard.csproj (.NET Standard)
  - Example.Pcl.csproj (Legacy Portable)
  - Example.nuspec

The Example.NetStandard and Example.Pcl projects both reference the Example.Shared project. All of the dependencies are added to the NetStandard and PCL projects.

The Example.nuspec file would look similar to this:

```xml
<?xml version="1.0"?>
<package >
  <metadata>
    <id>Example</id>
    <version>1.0.0</version>
    <title></title>
    <dependencies>
      <group targetFramework=".NETStandard2.0">
        <!-- .NET Standard dependencies here if any -->
      </group>
      <group targetFramework="portable-net45+win+wpa81+wp8">
        <!-- PCL dependencies here if any -->
      </group>
    </dependencies>
  </metadata>
  <files>
    <file src="Example.NetStandard\bin\Release\netstandard2.0\Example.dll" target="lib\netstandard2.0" />
    <file src="Example.Pcl\bin\Release\Example.dll" target="lib\portable-net45+win+wpa81+wp8" />
    </files>
</package>
```