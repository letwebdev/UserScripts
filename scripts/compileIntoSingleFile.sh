#!/bin/bash
DIR_SOURCE="src/"
DIR_TARGET="dist/"

files="$*"
for file in ${files}; do
	SOURCE="$(basename "${file}")"
	SOURCE_WITHOUT_EXTENSION="${SOURCE%.*}"
	TARGET="${SOURCE_WITHOUT_EXTENSION}_bundled.js"
	npx rollup --format "es" --config "./rollup.config.js" --inlineDynamicImports \
		--input "${DIR_SOURCE}/${SOURCE}" --file "${DIR_TARGET}/${TARGET}" &&
		# Append "use strict"
		cat <(echo '"use strict"') <(cat "${DIR_TARGET}/${TARGET}") | sponge "${DIR_TARGET}/${TARGET}" \
		&
done
wait
