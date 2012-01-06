if [ -z "$1" ]; then
    echo "Usage: build_shared_dbs.sh <master database> <number of device dbs> <list of device servers>"
    exit 1
fi

ARGV=( $@ )
let num_servers=$#-2

echo $1 > shared_dbs.txt

for (( c=0; c<$2; c++ ))
do
        let servi=$c%$num_servers
        let servi+=2
        database=${ARGV[$servi]}/device$c

        echo $database >> shared_dbs.txt
done
