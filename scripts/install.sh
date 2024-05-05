#!/usr/bin/env bash
set -eo pipefail
DIR_TARGET="dist/"
install() {
	declare scripts="$*"
	for script in "${scripts[@]}"; do
		SOURCE="$(basename "${script}")"
		if [[ "${SOURCE}" == *"user.js" ]]; then
			PATH_TO_BUNDLED="${DIR_TARGET}/${SOURCE}"
		else
			declare SOURCE_WITHOUT_EXTENSION="${SOURCE%.*}"
			BUNDLED="${SOURCE_WITHOUT_EXTENSION}_bundled.user.js"
			PATH_TO_BUNDLED="${DIR_TARGET}/${BUNDLED}"
		fi
		declare URL
		if [[ "$(uname --kernel-release)" =~ .*WSL2$ ]]; then
			URL="file:$(wslpath -m "${PATH_TO_BUNDLED}")"
		else
			URL="file://${PATH_TO_BUNDLED}"
		fi
		sensible-browser "${URL}"
	done
}
install "$@"
