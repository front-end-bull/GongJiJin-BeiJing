redis-cli del phonenumber
redis-cli del password
redis-cli keys "accesstoken_*" | awk '{ print $1 }' | xargs redis-cli del
