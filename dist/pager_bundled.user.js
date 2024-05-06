// ==UserScript==
// @name         Pager
// @version      0.0.1
// @match        https://cn.bing.com/search*
// @match        https://www.bing.com/search*
// @grant        none
// @description
// ==/UserScript==
"use strict";
const _debugger = {
    on: false,
    enable() {
        this.on = true;
    },
    disable() {
        this.on = false;
    },
    log(...data) {
        this.on && console.log(data);
    },
    logForce(...data) {
        console.log(data);
    },
};

/**
 * Promise-based `setTimeout`
 */
async function wait(time) {
    function execute(resolve) {
        setTimeout(resolve, time);
    }
    return new Promise(execute);
}

function nearlyScrolledToBottom(offset = 1) {
    return window.innerHeight + Math.ceil(window.scrollY) + offset >= document.body.scrollHeight;
}
function onNearlyScrolledToBottom(callback, options) {
    const { offset = 1, cooldown = 100 } = { ...options };
    let cooledDown = true;
    window.addEventListener("scroll", async () => {
        if (cooledDown && nearlyScrolledToBottom(offset)) {
            if (cooldown) {
                cooledDown = false;
                callback(cooldown);
                await wait(cooldown);
                cooledDown = true;
            }
            else {
                callback(cooldown);
            }
        }
    });
}

_debugger.enable();
onNearlyScrolledToBottom(() => {
    getNextPage();
}, { offset: 400 });
async function getNextPage() {
    const anchorToNextPage = [...document.querySelectorAll("a.sb_pagN")].at(-1);
    const response = await fetch(anchorToNextPage.href);
    const contentOfNextPage = await response.text();
    const elementForNextPage = document.createElement("div");
    elementForNextPage.innerHTML = contentOfNextPage;
    const resultList = elementForNextPage.querySelector("#b_results");
    const relativeSearches = resultList.querySelector(".b_ans");
    _debugger.log(relativeSearches);
    if (relativeSearches) {
        resultList.removeChild(relativeSearches);
    }
    document.body.append(resultList);
}
