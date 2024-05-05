// ==UserScript==
// @name         Zhihu tweaker for peopple
// @version      0.0.1
// @match        https://www.zhihu.com/people/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// @description
// ==/UserScript==
"use strict";
/**
 * Promise-based `setTimeout`
 */
async function wait(time) {
    function execute(resolve) {
        setTimeout(resolve, time);
    }
    return new Promise(execute);
}

/**
 * @param options.intervalOfRetry * Will retry at `a later time` if the element is null(e.g. not loaded in page yet)
 * @warn This may cause an observer relying on the element to not work properly
 * @default 1000
 */
async function selectElementAsync(selectors, options) {
    const { intervalOfRetry = 1000, parent = document, expectingTheElementToExist = true, patient = false, } = { ...options };
    let timesTried = 0;
    while (true) {
        if (expectingTheElementToExist && timesTried === 10) {
            const prompt = `\`selectElementAsync\` for "${selectors}" failed ${timesTried} times`;
            if (patient) {
                console.info(prompt);
            }
            else {
                console.warn(prompt);
            }
        }
        timesTried += 1;
        const element = parent.querySelector(selectors);
        if (element === null) {
            await wait(intervalOfRetry);
        }
        else {
            return element;
        }
    }
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

function enableAutoTurningToNextPage(selectorForButtonToNextPage, options) {
    const { elementToAddPadding = document.body, offsetTop } = { ...options };
    onNearlyScrolledToBottom(() => {
        tryTurningToNextPage() && scrollTo({ top: offsetTop });
    });
    elementToAddPadding.style.paddingBottom = "700px";
    function tryTurningToNextPage() {
        const buttonToNextPage = document.querySelector(selectorForButtonToNextPage);
        if (buttonToNextPage !== null) {
            buttonToNextPage.click();
            return true;
        }
        else {
            return false;
        }
    }
}

(async function () {
    const profileMain = await selectElementAsync(".Profile-main");
    enableAutoTurningToNextPage(".PaginationButton-next", { offsetTop: profileMain.offsetTop });
})();
