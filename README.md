## Replication Bench

There are 2 scripts in here, which should load your servers. Currently this assumes your server is in admin party, or that you put basic auth in the url files: `shared_dbs.txt` and `multi_dbs.txt`.

To kick it off, you'll need node.js version 0.6 or newer. Then run `node shared_runner.js` or `node multi_runner.js`

### Shared Runner

The shared runner has a master database, and then "device" databases. It sets up bi direction replication between the master and all the devices. Then it applies load by writing to the devices. 

The `shared_dbs.txt` file should have the master database on the first line and any number of device dbs on subsequent lines. To get realistic benchmarks, the device dbs should be on different physical hardware from the master database.

It measures and reports on the time it takes for:

* a document to be saved on a device
* the document to replicate to the cloud
* the document to show up on all of the devices which should receive it

Currently it is fully meshed, but there is a TODO item to add a replication filter, so that a given document will go to a maximum of N devices.

### Multi Runner

The multi runner is much simpler, it just creates pairs of databases. One is on the "device", the other is on the master. Load is applied to the devices, and we measure how long before it shows up on the master.

The `multi_dbs.txt` should have the first line be the URL of the master server (eg `http://mycouch.com:5984/`), and the rest of the lines should be urls to device databases.

The multi runner measures the time for:

* a document to save to a device
* the document to be available on the master

