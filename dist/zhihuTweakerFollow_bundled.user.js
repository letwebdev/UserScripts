// ==UserScript==
// @name         Zhihu tweaker for follow
// @version      0.0.3
// @match        https://www.zhihu.com/follow
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        GM_setValue
// @grant        GM_getValue
// @description
// ==/UserScript==
"use strict";
class UserScriptStorage {
    get value() {
        return GM_getValue(this.key, this.#defaultValue);
    }
    set value(value) {
        GM_setValue(this.key, value);
    }
    key;
    #defaultValue;
    constructor(key, defaultValue) {
        this.key = key;
        this.#defaultValue = defaultValue;
    }
    push(element) {
        if (Array.isArray(this.value)) {
            this.value = [...this.value, element];
        }
    }
    unshift(element) {
        if (Array.isArray(this.value)) {
            this.value = [element, ...this.value];
        }
    }
    static get keyList() {
        return GM_listValues();
    }
}

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

const mutationObserver = {
    initialize(callback, options) {
        const { target, observerOptions, manipulatingOnSingleAddedHTMLElement = false } = { ...options };
        let observerTemp;
        if (!isMutationCallbackInnerForAtLeastOneAddedHTMLElement(callback, manipulatingOnSingleAddedHTMLElement)) {
            observerTemp = new MutationObserver(callback);
        }
        else {
            observerTemp = new MutationObserver((...[mutations, observer]) => {
                mutations
                    .filter(isRecordWithAtLeastOneAddedHTMLElement)
                    .map((recordWithAtLeastOneAddedHTMLElement) => {
                    return recordWithAtLeastOneAddedHTMLElement.addedNodes[0];
                })
                    .forEach((addedElement) => {
                    callback(addedElement, observer);
                });
            });
        }
        const observer = observerTemp;
        this.enable(observer, target, observerOptions);
        return observer;
        function isMutationCallbackInnerForAtLeastOneAddedHTMLElement(callback, manipulatingOnSingleAddedHTMLElement) {
            return manipulatingOnSingleAddedHTMLElement === true;
        }
    },
    enable(observer, target = document.body, options = { subtree: true, childList: true }) {
        observer.observe(target, options);
    },
    /**
     * Prevent deadlock when creating new nodes
     */
    temporarilyDisableAndDoSomething(observer, callback) {
        observer.disconnect();
        callback();
        this.enable(observer);
    },
};
function isRecordWithAtLeastOneAddedHTMLElement(record) {
    return record.addedNodes[0] instanceof HTMLElement;
}

// Can't run-at document.body as the list is(may be) substituted after idle
// debug.enable()
const SELECTOR_TITLE_OF_ITEM = ".ContentItem-title meta[itemprop='name'], .ContentItem meta[itemprop='headline']";
const keywordsToBlockUniversal = new UserScriptStorage("keywordsToBlockUniversal", [""]);
const keywordsToBlockZhihu = new UserScriptStorage("keywordsToBlockZhihu", [""]);
const keywordsToBlockZhihuCache = keywordsToBlockZhihu.value;
const keywordsToBlockUniversalCache = keywordsToBlockUniversal.value;
const keywords = [keywordsToBlockZhihuCache, keywordsToBlockUniversalCache].flat();
// console.log(keywords)
const list = await selectElementAsync("[role='list']");
_debugger.log(list);
initItemRemover();
appendKeywordInput(keywordsToBlockZhihu);
supplementHeader();
async function initItemRemover() {
    [...list.children].forEach((item) => {
        tryRemovingItem(item);
    });
    tryRemovingItems(list);
}
async function tryRemovingItems(targetOfObserver) {
    _debugger.log("start observe");
    mutationObserver.initialize((item) => {
        _debugger.log(item);
        _debugger.log(list);
        tryRemovingItem(item);
    }, {
        manipulatingOnSingleAddedHTMLElement: true,
        observerOptions: { childList: true },
        target: targetOfObserver,
    });
}
async function tryRemovingItem(item) {
    const titleOfItem = (await selectElementAsync(SELECTOR_TITLE_OF_ITEM, {
        parent: item,
        expectingTheElementToExist: false,
    })).content;
    if (keywords.some((keyword) => {
        return titleOfItem.includes(keyword);
    })) {
        item.remove();
    }
}
function appendKeywordInput(storage) {
    const form = document.createElement("form");
    const textInput = document.createElement("input");
    const submitButton = document.createElement("input");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (textInput.value === "") {
            return;
        }
        else {
            storage.unshift(textInput.value);
            removeItem(textInput.value);
            textInput.value = "";
        }
    });
    form.style.position = "fixed";
    form.style.bottom = "1%";
    form.style.right = "1%";
    form.style.zIndex = "99999";
    form.style.display = "flex";
    textInput.placeholder = "Add a keyword to Block";
    submitButton.type = "submit";
    submitButton.value = "Add";
    form.append(textInput, submitButton);
    document.body.append(form);
}
async function removeItem(keyword) {
    _debugger.log(list);
    [...list.children]
        .filter((item) => {
        const meta = item.querySelector(SELECTOR_TITLE_OF_ITEM);
        return meta?.content?.includes(keyword);
    })
        .forEach((item) => {
        item.remove();
    });
}
function supplementHeader() {
    const header = document.querySelector(".AppHeader-userInfo");
    const favorites = document.querySelector(".GlobalSideBar-starItem");
    const followingQuestions = document.querySelector(".GlobalSideBar-questionListItem");
    const ul = document.createElement("ul");
    ul.style.display = "flex";
    ul.append(favorites, followingQuestions);
    header.append(ul);
}
