---
title: 'ILE build tool'
excerpt: 'Build an ILE build tool for development and production deployment. Integrate it with RDi and gitlab CI.'
coverImage: '/assets/blog/preview/cover.jpg'
date: '2018-12-13T05:35:07.322Z'
author:
  name: Eli Rivera
ogImage:
  url: '/assets/blog/preview/cover.jpg'
---

Now that we have our [IBMi source in git](/posts/ibmi-source-with-git), what's next?

### Options
* [IBM Rational ClearCase](https://www.ibm.com/products/rational-clearcase)
* [ARCAD for DevOps suite](https://www.arcadsoftware.com/products/arcad-for-devops/)
* [Better Object Builder (Bob)](https://github.com/s4isystems/Bob)

ClearCase and ARCAD were overkill for our use case. We would have gone with Bob but a hard requirement to only build source members that changed wasn't on its features. Moreover, there's a reference table that we have to consider when building program dependencies.

### DIY build tool
I convinced myself to make a custom build tool to solve this so I can uniquely tailor it to what we need and to the team's existing workflow. Since I'm on a .NET shop, I used C# to write the tool. This would be a `CLI` tool so we can easily integrate it in our gitlab CI.

#### Detecting source members that changed
We are already using git, so this should be straightforward. I used [LibGit2Sharp](https://github.com/libgit2/libgit2sharp/) to check what was changed between the working branch and master.

```csharp
public IEnumerable<string> CurrentBranchChanges()
{
    Branch master = Repository.Branches["master"];

    // `git merge-base master current-branch`
    //  merge-base is the point where branch diverged from master
    Commit mergeBase = Repository
        .ObjectDatabase
        .FindMergeBase(
            master.Tip,
            Repository.Head.Tip
        );

    return Repository.Diff.Compare<TreeChanges>(
        mergeBase.Tree,
        Repository.Head.Tip.Tree
    )
    .Where(FileChangeFilter)
    .Select(c => c.Path);
}

public IEnumerable<string> WorkingChanges()
{
    return Repository.Diff.Compare<TreeChanges>(
        Repository.Head.Tip.Tree,
        DiffTargets.Index | DiffTargets.WorkingDirectory
    )
    .Where(FileChangeFilter)
    .Select(c => c.Path);
  }
```

These two functions would give me all the files that changed after branching off from master, staged files, and files in the working directory.

#### Pushing source members back to IBMi
We can either use `FTP` or `SSH` to push files back to IBMi. I went with `FTP` since the `SSH` server wasn't turned on at that time for some reason. The solid `FTP` library, [FluentFTP](https://github.com/robinrodricks/FluentFTP) provided all that I need for this requirement.

```csharp
public bool UploadMember(string local, string lib, string obj, string mbr)
{
    lib = lib.ToUpper();
    obj = obj.ToUpper();
    mbr = mbr.ToUpper();

    bool isConnected = IBMi.IsConnected();

    if (!isConnected) return false;

    return IBMi.UploadFile(local, $"/QSYS.lib/{lib}.lib/{obj}.file/{mbr}.mbr");
}
```

#### Compiling source members
Fortunately, IBMi provides handy tools to execute `CL` commands remotely! 

* [RCMD for FTP](https://www.ibm.com/docs/en/i/7.3?topic=ssw_ibm_i_73/rzaiq/rzaiqrcmd.htm)
* [IBM PASE for i system utility for SSH](https://www.ibm.com/docs/en/i/7.2?topic=utilities-pase-i-system-utility)

I already went with `FTP`, so `RCMD` it is.

Here's a list of the `CL` commands I used for the whole process:

1. Compiling
  * [`CRTBNDCL`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/crtbndcl.htm)
  * [`CRTCLPGM`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/crtclpgm.htm)
  * [`CRTBNDRPG`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/crtbndrpg.htm)
  * [`CRTRPGPGM`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/crtrpgpgm.htm)
  * [`CRTSQLRPGI`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/crtsqlrpgi.htm)
  * [`CRTBNDC`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/crtbndc.htm)
  * [`CRTCMD`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/crtcmd.htm)
  * [`CRTDSPF`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/crtdspf.htm)
  * [`CRTPRTF`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/crtprtf.htm)

2. Miscellaneous
  * [`CRTLIB`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/crtlib.htm)
  * [`CRTSRCPF`](https://www.ibm.com/docs/en/i/7.4?topic=considerations-create-source-physical-file-crtsrcpf-command)
  * [`DLTOBJ`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/dltobj.htm)
  * [`CHGCURLIB`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/chgcurlib.htm)
  * [`CALL`](https://www.ibm.com/docs/en/i/7.4?topic=programs-using-call-call-command#clcallc)
  * [`ADDLIBLE`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/addlible.htm)
  * [`CHGPFM`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/chgpfm.htm)
  * [`DSPOBJD`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/dspobjd.htm)
  * [`RUNSQL`](https://www.ibm.com/docs/en/i/7.4?topic=ssw_ibm_i_74/cl/runsql.htm)

Lots of `RUNSQL` has been used to get information about the different objects in IBMi, including the table that contains the program dependencies.

#### RDi integration
Inspired by [Bob](https://github.com/s4isystems/Bob), this `CLI` tool can easily be integrated in RDi with the [same steps here](https://github.com/s4isystems/Bob/wiki/Integrate-RDi#import-the-external-tools-definitions-into-rdi). ✨

#### Production build
A couple of tweaks were put in place so we can integrate it with gitlab CI. First, a table for storing the commit that was deployed which would be fetched on the next build as a reference starting point for the `git diff`. Second, a rollback mechanism that stores copies of programs before they were changed and a handy command to execute immediate rollback if the deployment fails. Lastly, a pre-compile command(any `CL` command) which can be passed in as an argument to the tool – useful for creating work files, temporary tables or any other process that a program needs that's only relevant during compilation.

### Conclusion
At this point, I would say I am knee deep into IBMi. Learned a lot of the IBMi concepts, as well as interacting with it and its system APIs. All in all, I had fun building this tool – particularly from how I was able to cater to all the existing build, and workflow requirements, and integrating it with our existing tools.<br><br><br>

---
Credits to [ILEditor](https://github.com/worksofbarry/ILEditor) for showing me the way! 🙇