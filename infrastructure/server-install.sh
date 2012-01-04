# Boot Script

# Install additional packages we require
sudo yum -y install gcc gcc-c++ openssl-devel sysstat libidn

# Get and Install Couchbase Single Server
wget http://files.couchbase.org/developer-previews/couchbase-single-server-2.0.0-dev-preview/couchbase-single-server-community_x86_64_2.0.0-dev-preview-5.rpm
sudo rpm -Uvh couchbase-single-server-community_x86_64_2.0.0-dev-preview-5.rpm

# Up the file descriptor limit
sudo sh -c "echo '' >> /etc/sysctl.conf"
sudo sh -c "echo '# Increase maximum open file descriptors' >> /etc/sysctl.conf"
sudo sh -c "echo 'fs.file-max = 65536' >> /etc/sysctl.conf"
sudo /sbin/sysctl -p
sudo sh -c "echo '* hard nofile 65536' >> /etc/security/limits.conf"
sudo sh -c "echo '* soft nofile 16384' >> /etc/security/limits.conf"

# Add additional parameters to CouchDB startup
sudo cp /opt/couchbase/bin/couchdb /opt/couchbase/bin/couchdb.orig
sudo sh -c "sed -e 's/A 4/A 4 -env ERL_MAX_PORTS 100000 -env ERL_MAX_ETS_TABLES 100000 +P 1000000/g' /opt/couchbase/bin/couchdb.orig > /opt/couchbase/bin/couchdb.updated"
sudo cp /opt/couchbase/bin/couchdb.updated /opt/couchbase/bin/couchdb

# Update CouchDB Settings
sleep 5
curl -X PUT -d '"0.0.0.0"' http://127.0.0.1:5984/_config/httpd/bind_address
sleep 5
curl -X PUT -d '"10000"' http://127.0.0.1:5984/_config/couchdb/max_dbs_open
sleep 5
curl -X PUT -d '"1000000"' http://127.0.0.1:5984/_config/replicator/retries_per_request
sleep 5

# Restart CouchDB to ensure all changes take effect
sudo /etc/init.d/couchbase-server restart

# Add Webtatic repo and install git
sudo rpm -Uvh http://repo.webtatic.com/yum/centos/5/latest.rpm
sudo yum -y install --enablerepo=webtatic git-core

# Install NVM
git clone git://github.com/creationix/nvm.git ~/.nvm

# Source nvm.sh and add to bashrc
. ~/.nvm/nvm.sh
echo ". ~/.nvm/nvm.sh" >> ~/.bashrc

# Install Node
nvm install v0.6.6

# Install replication-bench
git clone git://github.com/couchbaselabs/replication-bench.git
