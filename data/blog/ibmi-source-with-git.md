---
title: 'Manage IBMi source with git'
excerpt: 'Learn how to manage IBMi source code with git.'
date: '2018-11-01T05:35:07.322Z'
author:
  name: frive
ogImage:
  url: ''
---

There's a lot of advantages on why you would want to work on a codebase using git. IBMi source code is not an exception. Unfortunately, for some reason, there aren't seemed to be any official resource from IBM that let companies use git. Most of the time, a software suite or a consulting firm(may or may not have a software suite) are the only options – and these come with a premium.

### Prerequisite
* git
* [Rational Developer for i (RDi)](https://www.ibm.com/products/rational-developer-for-i)

### Exporting IBMi source
1. Using RDi, create a new `i Project`
  * Change the `Location`. This is where the source will be exported into files.
  * Point the `Connection` to your IBMi server.
  * Fill in the `Associated Library` with the library containing the source code you want to export.
  
2. In the `Remote System Explorer`
  * Select the file(`Q*SRC`) you would like to export.
  * Right click, then select `Add To i Project`. Do the same for the rest of the files that you would like to export.

### Git
Now that the IBMi source has been exported in your local file system, all we have to do is to go to the source root folder and do:

```bash
$ git init
$ git add .
$ git commit
```

Make sure to include these files/folders in git:
* `.project` - this marks the folder as an `i Project` in RDi.
* `.ibmi` - folder containing the source member properties.

You can now push the source to [Github](https://github.com/), [Gitlab](https://gitlab.com/), or any other code hosting solution out there.

### Conclusion
This solution allows us to make use of git's distributed design just like any other source that we know of. Devs can use their favorite git GUI clients without the connection latency.

We ultimately preferred this approach instead of using the more common one – using IBM's `Integrated File System (IFS)` together with git, due to connection issues specially when using a VPN.<br><br><br>

---
> .NET and (hopefully someday) RPG/CL repositories.

This was the description of the gitlab group housing the repositories I currently work on and inspired me to dip my toes in the world of IBMi.