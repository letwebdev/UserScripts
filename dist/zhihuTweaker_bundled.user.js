// ==UserScript==
// @name         Zhihu tweaker
// @version      0.1.5
// @match        https://*.zhihu.com/*
// @exclude      https://www.zhihu.com/consult/*
// @exclude      https://www.zhihu.com/question/*/log
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// @description
// ==/UserScript==
"use strict";
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

/**
 * Promise-based `setTimeout`
 */
async function wait(time) {
    function execute(resolve) {
        setTimeout(resolve, time);
    }
    return new Promise(execute);
}

function trySupplementingItemTime(element, observerToTemporarilyDisable) {
    if (isAnswerContentWithTimeElements(element)) {
        mutationObserver.temporarilyDisableAndDoSomething(observerToTemporarilyDisable, () => {
            supplementItemTime(element);
        });
        return true;
    }
    else {
        return false;
    }
}
function isAnswerContentWithTimeElements(element) {
    return (element.parentElement instanceof HTMLDivElement &&
        element.parentElement.classList.contains("RichContent") &&
        element.parentElement.querySelectorAll(".ContentItem-time").length === 1);
}
function supplementItemTime(element) {
    const answerContent = element.parentElement;
    const wrapperOfTimeElements = answerContent.querySelector(".ContentItem-time");
    const spanWithtimeOfItem = wrapperOfTimeElements.querySelector("span[data-tooltip]");
    if (edited(spanWithtimeOfItem)) {
        const timeCreated = spanWithtimeOfItem.dataset.tooltip;
        const containerOfTimeCreated = wrapperOfTimeElements.cloneNode(true);
        containerOfTimeCreated.querySelector("span[data-tooltip]").textContent = timeCreated;
        answerContent.append(containerOfTimeCreated);
        if (answerLongEnough()) {
            const containerOfTimeCreated2 = containerOfTimeCreated.cloneNode(true);
            answerContent.prepend(containerOfTimeCreated2);
        }
    }
    if (answerLongEnough()) {
        const containerOfTime = wrapperOfTimeElements.cloneNode(true);
        answerContent.prepend(containerOfTime);
    }
    function answerLongEnough() {
        return answerContent.offsetHeight > 700;
    }
}
function edited(spanWithtimeOfItem) {
    return spanWithtimeOfItem.textContent !== spanWithtimeOfItem.dataset.tooltip;
}
function inlayExtraButtonForCloseWhenOpeningModal() {
    const extraButtonForClose = document.createElement("button");
    extraButtonForClose.style.zIndex = "99999";
    extraButtonForClose.style.position = "fixed";
    extraButtonForClose.style.top = "33%";
    extraButtonForClose.style.left = "42%";
    extraButtonForClose.textContent = "close";
    extraButtonForClose.style.width = "300px";
    extraButtonForClose.style.height = "400px";
    extraButtonForClose.style.opacity = "0.8";
    extraButtonForClose.classList.add("Button");
    window.addEventListener("click", () => {
        tryInlayingExtraButtonForClose();
    });
    async function tryInlayingExtraButtonForClose() {
        await wait(200);
        const buttonForClosingModal = document.querySelector("button.css-169m58j");
        if (buttonForClosingModal) {
            const modal = document.querySelector(".css-19q29v6").parentElement.parentElement;
            modal.appendChild(extraButtonForClose);
            buttonForClosingModal.addEventListener("click", () => {
                removeModal(modal);
            });
            extraButtonForClose.addEventListener("click", () => {
                removeModal(modal, buttonForClosingModal);
            });
        }
    }
}
function removeModal(modal, buttonForClosingModal) {
    // Improve (visual) performance
    modal.style.display = "none";
    buttonForClosingModal?.click();
}

function tryCoveringAutoGeneratedKeywordLink(element) {
    if (isAutoGeneratedKeywordAnchor(element)) {
        coverAutoGeneratedKeywordLink(element);
        return true;
    }
    else {
        return false;
    }
}
function coverAutoGeneratedKeywordLink(element) {
    const keywordText = document.createTextNode(element.textContent);
    element.after(keywordText);
    element.style.display = "none";
    /**
     * Can't replace(delete) children(`a` included), which will cause React(zhihu) to throw errors
     * So simply hide it visually
     * @deprecated
     */
    // container.replaceChildren(anchor.textContent as string)
}
function isAutoGeneratedKeywordAnchor(element) {
    return (element instanceof HTMLAnchorElement &&
        element.parentElement instanceof HTMLElement &&
        element.href.startsWith("https://www.zhihu.com/search?q="));
}
function trySubstitutingRedirectionLink(container) {
    const selected = container.querySelector("a[href^='http://link.zhihu.com/?target='], a[href^='https://link.zhihu.com/?target=']");
    if (selected instanceof HTMLAnchorElement) {
        selected.href = removeRedirection(selected.href);
        return true;
    }
    else {
        return false;
    }
}
function removeRedirection(url) {
    const validRedirectionLinkPrefix = new RegExp("^https?://link.zhihu.com/\\?target=");
    const urlRemovingRedirection = url.replace(validRedirectionLinkPrefix, "");
    return decodeURIComponent(urlRemovingRedirection);
}

const zhihu = {
    validFollowUrl: new RegExp("^https://www.zhihu.com/follow*"),
    validQuestionUrl: new RegExp("^https://www.zhihu.com/question(?!.*/log$).*"),
    validPeoPleUrl: new RegExp("^https://www.zhihu.com/people/*"),
    validArticleUrl: new RegExp("^https://zhuanlan.zhihu.com/p/*"),
    validConsultUrl: new RegExp("^https://www.zhihu.com/consult/people/*"),
    get inArticlePage() {
        return this.validArticleUrl.test(window.location.href);
    },
};

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

await init();
mutationObserver.initialize((addedElement, observer) => {
    tryCoveringAutoGeneratedKeywordLink(addedElement) ||
        trySubstitutingRedirectionLink(addedElement) ||
        trySupplementingItemTime(addedElement, observer);
}, {
    manipulatingOnSingleAddedHTMLElement: true,
});
inlayExtraButtonForCloseWhenOpeningModal();
async function init() {
    // Delay execution of the script
    const main = await selectElementAsync("main");
    if (zhihu.inArticlePage) {
        //  `main` of Article pages are not observed
        main.querySelectorAll("a").forEach((anchor) => {
            tryCoveringAutoGeneratedKeywordLink(anchor);
        });
    }
}
