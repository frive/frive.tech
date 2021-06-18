---
title: 'IBMi FTP exit program'
excerpt: 'TIL: IBMi exit programs'
date: '2018-11-27T05:35:07.322Z'
author:
  name: Eli Rivera
ogImage:
  url: ''
---

Before I was able to build an [ILE build tool](/posts/ile-build-tool), I ran into this issue while trying out [`RCMD`](https://www.ibm.com/docs/en/i/7.3?topic=ssw_ibm_i_73/rzaiq/rzaiqrcmd.htm).

```shell
331 Enter Password.
230 **** logged on.
250 Now using naming format "1"
257 "/home/user/" is current directory.
> cd /qsys.lib/user.lib
550 Request rejected.
```

The system administrator confirmed that I had the right permissions to use `FTP`. I thought I had no access to `qsys.lib/user.lib` because that's the command I ran before I got the error. I tried to create a file to confirm this... and it worked! Stumbled with a [similar issue on the web](https://www.mcpressonline.com/forum/forum/networking/general-ae/9253-ftp-error-550-request-rejected) and that led me to the culprit.

I'm very new to IBMi and had no idea what [exit programs](https://www.ibm.com/docs/en/i/7.4?topic=concepts-exit-programs) are. Based from what they do, I find them synonymous to [webhooks](https://en.wikipedia.org/wiki/Webhook) and [ASP.NET middleware](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-5.0).

I followed the command used on the link, [`WRKREGINF`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/wrkreginf.htm) and got a long list of exit points. I scrolled down on the pages until I saw `FTP` on the `Text` column, then checked the exit programs for each using option 8. 

![](https://storage.googleapis.com/frive-f158f.appspot.com/assets/img/blog/ibmi-ftp-exit-program/wrkreginf.jpg)

`QIBM_QTMF_SERVER_REQ` is the only exit point related to `FTP` that had an exit program set to it. And there it is! The exit program has a list of users that's allowed `FTP` requests to pass through. Adding myself on that list solved the issue. 🎉

It turns out the system administrator added me to the list of the previous `FTP` exit program that's why it was not working. They decided to clean up that old program to not cause any more confusion in the future.

