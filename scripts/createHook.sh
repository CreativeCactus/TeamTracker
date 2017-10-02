if [[ $# -lt 2 ]] ; then
	echo './createHook.sh "User/Repo" "hookUrl"'
	echo './createHook.sh "CreativeCactus/BoBot" "http://$(hostname -I):7777/webhook"'
	exit 1
fi

set -x
curl -X POST "https://api.github.com/repos/${1}/hooks" -H "Content-Type: application/json" -d \
	'{"name":"web", "active": true, "events": ["push","pull_request"], "config": {"url": "'${2}'","content_type": "json"}}'
