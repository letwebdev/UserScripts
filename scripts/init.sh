#!/usr/bin/env bash

if [[ "$1" != "" ]]; then
	if [[ -f "./src/$1" ]]; then
		echo "file exists"
		exit 1
	else
		fileName="$1"
	fi
else
	read -r -p "Input fileName: " fileName
	if [[ "${fileName}" == "" ]]; then
		echo "please input file name"
		exit 1
	fi
fi

if [[ "$2" != "" ]]; then
	match="$2"
fi

cat << _EOF_ > "./src/${fileName}"
// ==UserScript==
// @name         newUserscript
// @version      0.0.1
// @match        ${match}
// ==/UserScript==

_EOF_
