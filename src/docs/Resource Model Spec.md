## Why do we need this.
Three words SAS (Shared access Signatures)
Resources were developed as a quick way to add a bit of security to our system. Before, we exposed several api keys to our webapp in order to give our front end developers the power to create resources at will. For example, exposing our keys to the front end, let us create Blobs and Containers in Azure easily in javascript. However, were anyone smart enough to look at our source code, they would be able to find the key and gain unfiltered acess through a not insignificant amount of data.

Resources prevent this. They are define as
```json
{
    "type": "upload_image",
    "url": "https://secured_get.com"
}
```
When one of our authorized servers fetch this structure, our backend automatically unlocks this resource through the [SAS](https://docs.microsoft.com/en-us/azure/storage/common/storage-dotnet-shared-access-signature-part-1) pipeline. SAS automatically generates a url preventing attackers from just inspecting our source code to find customer data.