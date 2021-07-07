---
title: 'XmlService'
excerpt: 'Replacing ASNA Datagate pt. 1: Use XmlService to access DB2, system API, RPG programs, PASE, and more in the IBMi system'
coverImage: '/assets/blog/preview/cover.jpg'
date: '2019-06-10T05:35:07.322Z'
author:
  name: Eli Rivera
ogImage:
  url: '/assets/blog/preview/cover.jpg'
---

My journey with IBMi continues. This time, I checked out [XmlService](https://github.com/IBM/xmlservice) and how I used it to replace an ASNA Datagate-dependent system.

### ASNA Datagate

[ASNA Datagate](https://asna.com/us/products/datagate) is an enterprise product that provides DB2 native I/O access and `RPG` program calls from windows machines to the IBMi system. It's probably one of the go-to products for IBMi shops that want to extend their legacy system by leveraging the .NET ecosystem.

Together with `AVR`([Visual `RPG` for .NET](https://asna.com/us/products/visual-rpg)), `RPG` developers can transition smoothly to .NET. It offers the familiar `RPG` syntax and some OOP concepts that compiles into a .NET assembly. I find the syntax quite similar to [Visual Basic](https://docs.microsoft.com/en-us/dotnet/visual-basic/).

Here's an example code calling an `RPG` program.

```c:ZzCall.vr
BegClass ZzCall Extends(ProgramCall) Implements(IZzCall) Access(*Public)
    DclFld _conn Type(DgConnection) Access(*Private)
    DclFld _err Type(*Boolean) Access(*Private)

    BegProp Error Type(*Boolean) Access(*Public)
      BegGet
        LeaveSr _err
      EndGet
    EndProp

    BegConstructor Base(conn) Access(*Public)
      DclSrParm conn Type(DgConnection)
      DclSrParm inCharA Type(*Char) Len(1)
      DclSrParm inCharB Type(*Char) Len(1)
      DclSrParm inDec1 Type(*Zoned) Len(7, 4)
      DclSrParm inDec2 Type(*Zoned) Len(12, 2)

      _conn = conn
      _conn.Open()

      Call Pgm("*LIBL/ZZCALL") Db(_conn.Db) Err(_err)
        DclParm charA Type(*Char) Len(1) CpyFrom(inCharA)
        DclParm charB Type(*Char) Len(1) CpyFrom(inCharB)
        DclParm dec1 Type(*Zoned) Len(7, 4) CpyFrom(inDec1)
        DclParm dec2 Type(*Zoned) Len(12, 2) CpyFrom(inDec2)
    EndConstructor
EndClass
```

The decision to replace this became more evident as Microsoft continued to improve the .NET ecosystem - making it open source and multi-platform. We also ran into some inconvenience using it like:

* Poor intellisense support
* Case insensitive
* Lack of testing framework
* LINQ
* Generics

The list goes on as new language features for `C#` get released.

### XmlService

A couple of months of research led me to `XmlService`. It's the perfect tool for one of the functionality that ASNA Datagate offers – `RPG` program calls. 🎉

From its GitHub repo:

> XMLSERVICE is a set of procedures written in ILE RPG that allows you to interact with IBMi resources such as programs and commands using a plain XML protocol. XMLSERVICE can be called directly or via high-level language toolkit.

![](https://raw.githubusercontent.com/IBM/xmlservice/master/xmlservice.png)

It allows us to access almost any IBMi resource through a stored procedure or HTTP.

#### Proposal + Demo

Here are the [slides](https://firebasestorage.googleapis.com/v0/b/frive-f158f.appspot.com/o/assets%2Fimg%2Fblog%2Fxmlservice%2Fxmlservice.pdf?alt=media&token=72323fb0-6372-467b-adff-3ac5a077df67) I used for the proposal. At first, I used the example programs included in the `XmlService` repo for the demo and used our own `RPG` programs later on after the approval.

#### Setup

It was a breeze setting it up. It's exactly as what the [instructions](http://yips.idevcloud.com/wiki/index.php/XMLService/XMLSERVICEInstall) say. I had one of the devs on the IBMi team check for the commands in the instructions before I ran them, making sure they're safe.

#### Integration

We used the stored procedure interface over HTTP for optimality and created a [serializer/deserializer library](https://github.com/frive/dotnet-itoolkit) to convert the `RPG` programs declaratively in `C#`.

Now the above `AVR` code looks like this when converted:

```csharp:ZzCall.cs
[XmlServiceProgram(Name = "ZZCALL", Library = "*LIBL")]
public class ZzCall: IxmlServiceCall
{
  [XmlServiceData(DataType = "1a", Order = 0)]
  public string InCharA { get; set; }

  [XmlServiceData(DataType = "1a", Order = 1)]
  public string InCharB { get; set; }

  [XmlServiceData(DataType = "7p4", Order = 2)]
  public string InDec1 { get; set; }

  [XmlServiceData(DataType = "12p2", Order = 3)]
  public string InDec2 { get; set; }
}
```

And call it like so:

```csharp
using (var conn = new Connection())
{
  var zzCall = new ZzCall {
    InCharA = "A",
    InCharB = "B",
    InDec1 = "10",
    InDec2 = "20"
  };

  var xmlService = new XmlServiceI(conn);
  xmlService.Call(zzCall);
}
```

`XmlServiceI` is the class that takes care of serializing `ZzCall.cs`, passing it to the stored procedure as input, then deserialize the result of the stored procedure call back to the class's properties.

### Gotchas 😲
Most of the issues I encountered when calling the programs through `XmlService` are due to [`Db2 Connect`](https://www.ibm.com/docs/en/db2/11.5?topic=db2-connect-overview), the .NET connectivity provider by IBM. 

#### Spooled Files
[Spooled files](https://www.ibm.com/docs/en/i/7.4?topic=queues-spooled-file) are data saved for later processing or printing. Using [`OVRPRTF`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/ovrprtf.htm#OVRPRTF.SPLFOWN) puts the spooled file to the [`QPRTJOB`](https://www.ibm.com/docs/en/i/7.4?topic=queues-qprtjob-job) of the current user profile by default. We need to set the parameter [`SPLFOWN(*JOB)`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/ovrprtf.htm#OVRPRTF.SPLFOWN) so that it goes to the `QPRTJOB` of [`QRWTSRVR`](https://www.ibm.com/docs/en/i/7.4?topic=jobs-prestart).

#### User profiles
This is more of a [common mistake](https://www.itjungle.com/2015/05/19/fhg051915-story03/) developers make when retrieving the user profile. It makes the issue more apparent when called through `XmlService`.

#### CCSID
One `RPG` program changes the [`CCSID`](https://www.ibm.com/docs/en/i/7.4?topic=information-ccsid-reference) calling a `Java` program. It throws an error when called through `XmlService` because the client connection sets its own `CCSID` by default and needs it to be the same when the handle comes back to it.

#### Commitment control 
[Commitment control](https://www.ibm.com/docs/en/i/7.4?topic=control-commitment-concepts) is another thing that the connection sets by default. If the `RPG` program uses this, ensure that it runs in its own [activation group](https://www.ibm.com/docs/en/i/7.4?topic=concepts-activation-group), so it wouldn't mess up with the default commitment control set by the connection. Otherwise, we'll get [`CPF8350`](https://www.ibm.com/docs/en/i/7.3?topic=ssw_ibm_i_73/cl/endcmtctl.htm) error.


#### Exclusive locks
[`DLTF`](https://www.ibm.com/docs/en/i/7.4?topic=considerations-delete-file-dltf-command) and [`CLRPFM`](https://www.ibm.com/docs/en/i/7.4?topic=considerations-clear-physical-file-member-clrpfm) requires [exclusive locks](https://www.ibm.com/docs/en/i/7.4?topic=data-database-lock-considerations) to files when executed. Switching to `Db2 Connection` leaves shared locks to files because of [pseudo closed cursor](https://www.ibm.com/support/pages/pseudo-closed-cursor-faq) causing the above commands to throw a `CPF3220` error. [Workaround](https://stackoverflow.com/a/23548392) can either be:

```c
ALCOBJ OBJ((ZSCHEMA/ZTABLE *FILE *EXCL)) WAIT(1) CONFLICT(*RQSRLS)
```

or issue a SQL command equivalent:

```sql
delete from zschema.ztable
```

### Bonus 🎁
Converting all those `AVR` code to `C#` is a daunting task, so I whipped up a quick and dirty script to automate the work. Details on my [next post](/posts/code-generation-with-t4).