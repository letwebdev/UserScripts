"use strict"
function supplementFooterOfQuestionHeader() {
    const footer = document.querySelector(".QuestionHeader-footer-main");
    const buttonForViewingLogBeingAppended = footer.querySelector(".buttonForViewingLogBeingAppended");
    if (buttonForViewingLogBeingAppended) {
        return;
    }
    else {
        appendButtonForViewingLog(footer);
        appendTimeGroups(footer);
        function appendButtonForViewingLog(target) {
            const linkToLog = document.createElement("a");
            linkToLog.textContent = "查看问题日志";
            linkToLog.classList.add("Button--grey", "Button", "buttonForViewingLogBeingAppended");
            linkToLog.href = getUrlToLog();
            target.append(linkToLog);
        }
    }
    async function appendTimeGroups(target) {
        const logHtml = await fetch(getUrlToLog(), {
            headers: {
                "Content-Type": "text/html",
            },
        }).then((response) => {
            return response.text();
        });
        const sectionOfLog = document.createElement("section");
        sectionOfLog.innerHTML = logHtml;
        const logList = sectionOfLog.querySelector("#zh-question-log-list-wrap");
        const logListItems = logList.querySelectorAll("div.zm-item");
        const timeLastModified = logListItems[0].querySelector("time");
        const earliestLogListItem = [...logListItems].at(-1);
        const timeCreated = earliestLogListItem.querySelector("time");
        const questioner = earliestLogListItem.querySelector("& > div:nth-child(1) a");
        target.append(questioner, timeCreated, timeLastModified);
    }
    function getUrlToLog() {
        const currentUrl = window.location.href;
        const validUrlInfixOfLinkToLog = new RegExp("/question/\\d+");
        const urlInfixOfLinkToLog = currentUrl.match(validUrlInfixOfLinkToLog)[0];
        return `${urlInfixOfLinkToLog}/log`;
    }
}

function removeAutoGenerantedKeywordLinks() {
    const autoGeneratedKeywordLinks = document.querySelectorAll("a.RichContent-EntityWord:not(.autoGeneratedKeywordLinksRemoved)");
    autoGeneratedKeywordLinks.forEach((anchor) => {
        anchor.style.display = "none";
        const container = anchor.parentElement;
        const newSpan = document.createTextNode(anchor.textContent);
        container.append(newSpan);
        anchor.classList.add("autoGeneratedKeywordLinksRemoved");
        /**
         * Can't replace(delete) children(`a` included), which will cause React(zhihu) to throw errors
         * @deprecated
         */
        // container.replaceChildren(anchor.textContent as string)
    });
}
function substituteRedirectionLinks() {
    const linksToRemoveRedirection = document.querySelectorAll("a[href^='https://link.zhihu.com/?target='], a[href^='http://link.zhihu.com/?target=']");
    linksToRemoveRedirection.forEach((linkToRemoveRedirection) => {
        const urlWithRedirection = linkToRemoveRedirection.href;
        linkToRemoveRedirection.href = removeRedirection(urlWithRedirection);
    });
    function removeRedirection(url) {
        const urlRemovingRedirection = url
            .replace("https://link.zhihu.com/?target=", "")
            .replace("http://link.zhihu.com/?target=", "");
        return decodeURIComponent(urlRemovingRedirection);
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

async function selectElementAsync(querySelector, options = {
    intervalOfRetry: 1000,
    parent: document,
}) {
    const intervalOfRetry = options.intervalOfRetry || 1000;
    const parent = options.parent || document;
    const element = parent.querySelector(querySelector);
    if (element === null) {
        await wait(intervalOfRetry);
        return selectElementAsync(querySelector, options);
    }
    else {
        return element;
    }
}

function supplementItemTime() {
    const itemsToPendTime = document.querySelectorAll(".AnswerItem .RichContent:not(.itemTimeAlreadySupplemented)");
    pendTimeToItems(itemsToPendTime);
}
function pendTimeToItems(items) {
    items.forEach(async (item) => {
        item.classList.add("itemTimeAlreadySupplemented");
        const containerOfTime = await selectElementAsync(".ContentItem-time", { parent: item });
        pendTime(item, containerOfTime);
    });
}
function pendTime(target, containerOfTime) {
    const spanWithtimeOfItem = containerOfTime.querySelector("span[data-tooltip]");
    if (itemWasEdited(spanWithtimeOfItem)) {
        const containerOfTimeEdited = containerOfTime.cloneNode(true);
        target.prepend(containerOfTimeEdited);
        const containerOfTimeCreated = containerOfTime.cloneNode(true);
        const timeCreated = spanWithtimeOfItem.dataset.tooltip;
        containerOfTimeCreated.textContent = timeCreated;
        target.prepend(containerOfTimeCreated);
        const containerOfTimeCreatedToAppend = containerOfTimeCreated.cloneNode(true);
        target.append(containerOfTimeCreatedToAppend);
    }
    else {
        const containerOfTimeCreated = containerOfTime.cloneNode(true);
        target.prepend(containerOfTimeCreated);
    }
}
function itemWasEdited(spanWithtimeOfItem) {
    return spanWithtimeOfItem.textContent.includes("编辑于");
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

async function supplementConsultPage() {
    repeatlyAppendAnchors();
    const buttonForShowingMore = (await selectElementAsync(".PublicConsultation-layerContent"));
    buttonForShowingMore.addEventListener("click", repeatlyAppendAnchors);
}
function repeatlyAppendAnchors() {
    appendAnchors();
    setTimeout(appendAnchors, 200);
    setTimeout(appendAnchors, 500);
}
function appendAnchors() {
    const consultCards = document.querySelectorAll(".ConsultCard:not(.linkToConversationAppended)");
    consultCards.forEach((consultCard) => {
        appendAnchor(consultCard);
        consultCard.classList.add("linkToConversationAppended");
    });
}
function appendAnchor(target) {
    const linkToConversation = document.createElement("a");
    const relativeUrlToConversation = target.dataset.to;
    linkToConversation.href = relativeUrlToConversation;
    linkToConversation.textContent = "打开对话页面";
    linkToConversation.classList.add("Button");
    target.append(linkToConversation);
}

// ==UserScript==
// @name         Zhihu tweaker
// @namespace    http://tampermonkey.net/
// @version      0.1.2
// @description  tweak zhihu functionalities.
// @author       You
// @match        *://*.zhihu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==
(async function () {
    const currentUrl = window.location.href;
    const validFollowUrl = new RegExp("https://www.zhihu.com/follow*");
    const validQuestionUrl = new RegExp("https://www.zhihu.com/question(?!.*/log$).*");
    // const validPeoPleUrl = new RegExp("https://www.zhihu.com/people/*")
    // const validArticleUrl = new RegExp("https://zhuanlan.zhihu.com/p/*")
    const validConsultUrl = new RegExp("https://www.zhihu.com/consult/people/*");
    setInterval(() => {
        supplementItemTime();
        removeAutoGenerantedKeywordLinks();
        substituteRedirectionLinks();
    }, 2000);
    switch (true) {
        case inUrl(validFollowUrl): {
            supplementHeader();
            break;
        }
        case inUrl(validQuestionUrl): {
            setInterval(() => {
                supplementFooterOfQuestionHeader();
            }, 2000);
            break;
        }
        case inUrl(validConsultUrl): {
            supplementConsultPage();
            break;
        }
    }
    function inUrl(type) {
        return type.test(currentUrl);
    }
})();
