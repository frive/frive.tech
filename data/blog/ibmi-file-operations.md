---
title: 'IBMi native I/O file operations'
excerpt: 'Replacing ASNA Datagate pt. 2: Convert native I/O file operations to SQL'
coverImage: '/assets/blog/preview/cover.jpg'
date: '2019-08-19T05:35:07.322Z'
author:
  name: frive
ogImage:
  url: '/assets/blog/preview/cover.jpg'
---

![](https://storage.googleapis.com/frive-f158f.appspot.com/assets/img/blog/ibmi-file-operations/legacy-dragon.png)

We are finally at the last stride in modernizing our .NET stack. The final feature of ASNA Datagate that we need to port is its native I/O access to `Db2 for i`.

The following table shows the IBMi system objects and their equivalent SQL. This map is essential in transitioning from native I/O to `SQL`.

| System | SQL |
| - | - |
| `Library`. Groups related objects and allows you to find the objects by name. | `Schema`. Consists of a library, a journal, a journal receiver, an SQL catalog, and optionally a data dictionary. A schema groups related objects and allows you to find the objects by name. |
| `Physical file`. A set of records. | `Table`. A set of columns and rows. |
| `Record`. A set of fields. |  `Row`. The horizontal part of a table containing a serial set of columns. |
| `Field`. One or more characters of related information of one data type. | `Column`. The vertical part of a table of one data type. |
| `Logical file`. A subset of fields and records of one or more physical files. | `View`. A subset of columns and rows of one or more tables. |

### Native I/O

Native I/O is the traditional method for accessing data for [DDS](https://www.ibm.com/docs/en/i/7.4?topic=programming-dds)-described logical and physical files in a predefined sequence.

A sample code taken from ASNA's documentation:

```c
DclDiskFile CMASTNEWL1 +
  Type(*Input) +
  Org(*indexed) +
  DB(DB400) +
  NetBlockFactor(100) +
  Impopen(*No) +
  File ("TestLib/CMASTNEWL1")

Chain CMASTNEWL1 CustNumber NotFnd(*In60)

If *In60 = *ON
  Subfile1AgentName = *Blanks
Else
  Subfile1AgentName = CustName
Endif
```

### SQL (Structured Query Language)

[Db2 for i](https://www.ibm.com/docs/en/i/7.4?topic=concepts-db2-i) has `SQL` processing capability integrated into the system. This is what we'll utilize to translate native I/O data access.

#### File Operations

These are the native I/O file operations that we will be converting.

**Positioning operation:**
* [`SETLL`](https://www.ibm.com/docs/en/i/7.4?topic=codes-setll-set-lower-limit)
* [`SETGT`](https://www.ibm.com/docs/en/i/7.4?topic=codes-setgt-set-greater-than)

**Read operation:**
* [`READ`](https://www.ibm.com/docs/en/i/7.4?topic=codes-read-read-record)
* [`READP`](https://www.ibm.com/docs/en/i/7.4?topic=codes-readp-read-prior-record)
* [`READE`](https://www.ibm.com/docs/en/i/7.4?topic=codes-reade-read-equal-key)
* [`READPE`](https://www.ibm.com/docs/en/i/7.4?topic=codes-readpe-read-prior-equal)
* [`CHAIN`](https://www.ibm.com/docs/en/i/7.4?topic=codes-chain-random-retrieval-from-file)

**Create operation:**
* [`WRITE`](https://www.ibm.com/docs/en/i/7.4?topic=codes-write-create-new-records)

**Update operation:**
* [`UPDATE`](https://www.ibm.com/docs/en/i/7.4?topic=codes-update-modify-existing-record)

**Delete operation:**
* [`DELETE`](https://www.ibm.com/docs/en/i/7.4?topic=codes-delete-delete-record)

Create, update and delete operations are direct translations of [`INSERT`](https://www.ibm.com/docs/en/i/7.4?topic=statements-insert), [`UPDATE`](https://www.ibm.com/docs/en/i/7.4?topic=statements-update), and [`DELETE`](https://www.ibm.com/docs/en/i/7.4?topic=statements-delete) `SQL` statements respectively. Note that `UPDATE` and `DELETE` operations need to do a read operation first before being used.

The positioning and read operations are quite tricky since they are used in conjunction with one another. For instance, `SETLL` and `SETGT` are usually used first to specify the file's position before allowing reading using any of the read operations. We'll be playing a lot with the [`where clause`](https://www.ibm.com/docs/en/i/7.4?topic=subselect-where-clause) and a bit of [`order by clause`](https://www.ibm.com/docs/en/i/7.4?topic=subselect-order-by-clause).

The [`SELECT`](https://www.ibm.com/docs/en/i/7.4?topic=queries-subselect) statement is the easiest – we specify all the columns of the table. The table's sorting is critical as this sets how we read each row. We need to sort it by the [key field name](https://www.ibm.com/docs/en/i/7.4?topic=28-key-field-name) for `DDS` and primary or index keys for [`DDL`](https://www.ibm.com/docs/en/i/7.4?topic=programming-data-definition-language). The `where clause` should also be based on the same keys when a `search argument` is specified.

#### File/Record Lock
Read operations have the option of locking the entire file or a record. 

Locking a file is as easy as running this command:

```sql
lock table zschema.ztable in exclusive mode
```

For record locks, adding this at the end of the `select` statement would do the trick:

```sql
with rs use and keep exclusive locks
```

`ASNA` throws an exception whenever another process wants to access a locked file. To do the same, we can check the lock status of a file using this query:

```sql
select * from qsys2.record_lock_info
where system_table_name = 'ztable'
and system_table_schema = 'zschema'
```

We throw an exception when we found a record.

#### Temporary Tables
Some `RPG` programs create and insert data into a table in [`QTEMP`](https://www.rpgpgm.com/2014/09/use-qtemp-for-your-work-files.html). This table is then read by some other programs for display or as a parameter for a separate program. This works as long as all of these programs run on the same job. The same is true when we call this program in `.NET`. We can still access `QTEMP` during the connection's lifetime. Accessing data in `QTEMP` is the same as with a regular library:

```sql
select * from qtemp.ztable
```

#### File Members
Files can have multiple members. Fortunately, IBMi does have a [sql way](https://www.ibm.com/support/pages/accessing-files-multiple-members-using-sql) to achieve the same.

```sql
create or replace alias qtemp.ztable_zmember for zschema.ztable(zmember)
```

The alias is created in `QTEMP` library, so we don't have to remove it. `QTEMP` only lives for the duration of the job. 

#### Journal
[Transactions](https://www.ibm.com/docs/en/i/7.4?topic=control-transactions) can't be used for non-journaled files. We have to enable journaling for some files so we can [lock the records](#filerecord-lock) using a transaction.

#### Isolation Levels
Set isolation level to `NC` or `NONE` during insert or update operations on non-journaled files. Otherwise, we'll get a [`SQL7008N`](https://www.ibm.com/docs/en/db2/11.5?topic=errors-sql7008n) error.

```sql
insert into zschema.ztable values ('a', 'b') with nc
```

#### RRN
The [Relative Record Number](https://www.ibm.com/docs/en/i/7.4?topic=functions-rrn) identifies which position in a file the record is. I used this to update and delete data for tables that didn't have a primary key.

```sql
select rrn(employee), lastname
from employee
where deptno = 20
```

### Conclusion
We've made our .NET stack simpler by removing ASNA's server and client components and writing full .NET code(`C#`) instead of `AVR`. This brought pure joy and happiness with the developers and system administrators maintaining its server component. 

There's also an 80%-90% decrease in compile time for the projects.
![](https://imgs.xkcd.com/comics/compiling.png)

---
This concludes the series of replacing [ASNA Datagate](https://asna.com/us/products/datagate). To ASNA, thank you for your service. 🙇🏽‍♂️