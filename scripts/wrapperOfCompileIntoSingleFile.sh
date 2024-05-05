#!/usr/bin/env bash
compile() {
	if hash "parallel" 2> /dev/null; then
		parallel bash "./scripts/compileIntoSingleFile.sh" ::: "$@"
	else
		bash "./scripts/compileIntoSingleFile.sh" "$@"
	fi
}
declare checkSumOfAutoImportDeclarationBeforeTheBundling
declare checkSumOfAutoImportDeclarationAfterTheBundling
checkSumOfAutoImportDeclarationBeforeTheBundling="$(sha512sum "./auto-imports.d.ts")"
compile "$@"

checkSumOfAutoImportDeclarationAfterTheBundling="$(sha512sum "./auto-imports.d.ts")"
if [[ "${checkSumOfAutoImportDeclarationAfterTheBundling}" != "${checkSumOfAutoImportDeclarationBeforeTheBundling}" ]]; then
	echo "Declaration file of auto-import changed after bundling, will rebundle"
	compile "$@"
fi
