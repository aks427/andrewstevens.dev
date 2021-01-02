---
title: "Stream Files to Zip File in Azure Blob Storage using C#"
date: "2020-03-24"
---

Here's a neat way to write multiple files to a zip file in Azure Blob Storage using C#. Only a single file will be in memory at once, so you can create very large zip files without any memory issues.

This only works with `ZipArchiveMode` set to Create, so you won't be able to add files to an existing zip file.

This example is using the `WindowsAzure.Storage` nuget.

```csharp
var account = CloudStorageAccount.Parse("connectionstring");
var blobClient = account.CreateCloudBlobClient();
var container = blobClient.GetContainerReference("containername");

var blob = container.GetBlockBlobReference("zipname.zip");
using (var stream = await blob.OpenWriteAsync())
using (var zip = new ZipArchive(stream, ZipArchiveMode.Create))
{
    var files = new string[] { "file1.pdf", "file2.pdf", "file3.pdf", "file4.pdf" };
    foreach (var fileName in files)
    {
        using (var fileStream = File.OpenRead(fileName))
        {
            var entry = zip.CreateEntry(fileName, CompressionLevel.Optimal);
            using (var innerFile = entry.Open())
            {
                await fileStream.CopyToAsync(innerFile);
            }
        }
    }
}
```