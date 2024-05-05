#!/bin/bash
set -eo pipefail
DIR_SOURCE="src/"
DIR_TARGET="dist/"
main() {
	declare files="$*"

	compile "${files}"

	# if [[ $2 == "" ]]; then
	# 	if [[ "$(uname --kernel-release)" =~ .*WSL2$ ]]; then
	# 		clip.exe < "${DIR_TARGET}/${TARGET}" | iconv
	# 		echo "file content copied to clipboard"
	# 	fi
	# fi

}

compile() {
	declare files="$1"
	for file in ${files}; do
		SOURCE="$(basename "${file}")"
		declare SOURCE_WITHOUT_EXTENSION="${SOURCE%.*}"
		TARGET="${SOURCE_WITHOUT_EXTENSION}_bundled.user.js"
		PATH_TO_SOURCE="${DIR_SOURCE}/${SOURCE}"
		PATH_TO_TARGET="${DIR_TARGET}/${TARGET}"
		declare LINE_NUMBER_USER_SCRIPT_HEADER_START
		LINE_NUMBER_USER_SCRIPT_HEADER_START="$(awk '/\/\/ ==UserScript==/ { print NR }' "${PATH_TO_SOURCE}")"
		LINE_NUMBER_USER_SCRIPT_HEADER_END="$(awk '/\/\/ ==\/UserScript==/ { print NR }' "${PATH_TO_SOURCE}")"
		USER_SCRIPT_HEADER="$(awk "NR>=${LINE_NUMBER_USER_SCRIPT_HEADER_START} && NR<=${LINE_NUMBER_USER_SCRIPT_HEADER_END}" "${PATH_TO_SOURCE}")"
		bundle && prepend &
	done
	wait
}

bundle() {
	npx rollup --forceExit --config "./rollup.config.js" \
		--input "${PATH_TO_SOURCE}" \
		--file "${PATH_TO_TARGET}"
	# --forceExit
	# `unplugin-auto-import` hang the rollup
	# Force exit the process when done. In some cases plugins or their dependencies might not cleanup properly and prevent the CLI process from exiting. The root cause can be hard to diagnose and this flag provides an escape hatch until it can be identified and resolved.
	# Note that this might break certain workflows and won't always work properly.
}
prepend() {
	declare TARGET_LINE_NUMBER_USER_SCRIPT_HEADER_START
	declare targetUserScriptHeaderLineNumberEnd
	declare TARGET_WITHOUT_USERSCRIPT_HEADER

	TARGET_LINE_NUMBER_USER_SCRIPT_HEADER_START="$(awk '/\/\/ ==UserScript==/ { print NR }' "${PATH_TO_TARGET}")"

	if [[ "${TARGET_LINE_NUMBER_USER_SCRIPT_HEADER_START}" != "" ]]; then
		targetUserScriptHeaderLineNumberEnd="$(awk '/\/\/ ==\/UserScript==/ { print NR }' "${PATH_TO_TARGET}")"
		TARGET_WITHOUT_USERSCRIPT_HEADER="$(awk "NR<${TARGET_LINE_NUMBER_USER_SCRIPT_HEADER_START} || NR>${targetUserScriptHeaderLineNumberEnd}" "${PATH_TO_TARGET}")"
	else
		# USER_SCRIPT_HEADER may be incorrectly treeshaken by Rollup
		TARGET_WITHOUT_USERSCRIPT_HEADER="$(cat "${PATH_TO_TARGET}")"
	fi

	cat <(echo "${USER_SCRIPT_HEADER}") \
		<(echo '"use strict";') \
		<(echo "${TARGET_WITHOUT_USERSCRIPT_HEADER}") |
		sponge "${PATH_TO_TARGET}"

	# Auto-insert @grant directives to TARGET
	declare USER_SCRIPT_APIS=(download setValue getValue openInTab)
	for USER_SCRIPT_API in "${USER_SCRIPT_APIS[@]}"; do
		if [[ 
			"$(awk "!/(\/\/ @grant        GM_${USER_SCRIPT_API})/ && /GM_${USER_SCRIPT_API}/" \
				"${PATH_TO_TARGET}")" != "" ]]; then
			targetUserScriptHeaderLineNumberEnd="$(awk '/\/\/ ==\/UserScript==/ { print NR }' "${PATH_TO_TARGET}")"
			sed --in-place "${targetUserScriptHeaderLineNumberEnd}i\\// @grant        GM_${USER_SCRIPT_API}\\" "${PATH_TO_TARGET}"
		fi
	done

	# Auto-insert `@grant none` if no @grant directives exists
	if [[ "$(awk "/(\/\/ @grant        )/" "${PATH_TO_TARGET}")" == "" ]]; then
		targetUserScriptHeaderLineNumberEnd="$(awk '/\/\/ ==\/UserScript==/ { print NR }' "${PATH_TO_TARGET}")"
		sed --in-place "${targetUserScriptHeaderLineNumberEnd}i\\// @grant        none\\" "${PATH_TO_TARGET}"
	fi
	# Auto-insert mandatory `@decription`
	if [[ "$(awk "/(\/\/ @description)/" <(echo "${USER_SCRIPT_HEADER}"))" == "" ]]; then
		targetUserScriptHeaderLineNumberEnd="$(awk '/\/\/ ==\/UserScript==/ { print NR }' "${PATH_TO_TARGET}")"
		sed --in-place "${targetUserScriptHeaderLineNumberEnd}i\\// @description\\" "${PATH_TO_TARGET}"
	fi
}

main "$@"
