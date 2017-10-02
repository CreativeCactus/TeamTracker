if [[ $# -lt 5 ]] ; then
	echo './createHook.sh "User" "Repo" "Token" "Secret" "hookUrl"'
	echo './createHook.sh "CreativeCactus" "TeamTracker" "..." "Secret" "http://$(hostname -I):7777/webhook"'
	echo 'User must have access to the repo and API token. To generate a token go here, and be sure to allow repo hook access: https://github.com/settings/tokens'
	exit 1
fi

set -x
curl -X POST -u "${1}:${3}" "https://api.github.com/repos/${1}/${2}/hooks" -H "Content-Type: application/json" -d \
	'{"name":"web", "active": true, "events": ["push","pull_request"], "config": {"secret": "${4}", "url": "'${5}'","content_type": "json"}}'
