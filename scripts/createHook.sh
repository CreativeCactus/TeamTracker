if [[ $# -lt 2 ]] ; then
	echo './createHook.sh "User/Repo" "hookUrl"'
	echo './createHook.sh "CreativeCactus/BoBot" "http://`hostname -I`:7777/webhook"'
	exit 1
fi

curl -X POST "https://api.github.com/repos/${0}/hooks" -H "Content-Type: application/json" -d \
	'{"name":"web", "active": true, "events": ["push","pull_request"], "config": {"url": "'${1}'","content_type": "json"}}'
