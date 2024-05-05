// ==UserScript==
// @name         Zhihu tweaker for consult
// @version      0.0.1
// @description  tweak zhihu functionalities
// @match        https://www.zhihu.com/consult/people/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
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

enableAppendingAnchorsToCards();
enableAutomaticallyShowingMore();
async function enableAppendingAnchorsToCards() {
    const listOfConsultCards = await selectElementAsync(".PublicConsultation-list");
    appendAnchorsToExistingCards(listOfConsultCards.querySelectorAll(":scope > .ConsultCard-container"));
    automaticallyAppendAnchorsToNewCards(listOfConsultCards);
}
async function enableAutomaticallyShowingMore() {
    const buttonForShowingMore = await selectElementAsync(".PublicConsultation-layerContent");
    onNearlyScrolledToBottom(async () => {
        buttonForShowingMore.click();
    }, { offset: 1000, cooldown: 200 });
}
// Require target as argument here as the target must be declared first
async function automaticallyAppendAnchorsToNewCards(target) {
    const observer = new MutationObserver(appendAnchorsToNewCard);
    observer.observe(target, { childList: true });
}
function appendAnchorsToNewCard(recordList) {
    recordList.forEach((record) => {
        appendAnchorsToExistingCards(record.addedNodes);
    });
}
function appendAnchorsToExistingCards(containersOfConsultCards) {
    [...containersOfConsultCards]
        .map((containerOfConsultCard) => {
        return containerOfConsultCard.querySelector(".ConsultCard");
    })
        .forEach((consultCard) => {
        appendAnchor(consultCard);
    });
}
function appendAnchor(target) {
    const anchorToConversation = document.createElement("a");
    const relativeUrlToConversation = target.dataset.to;
    anchorToConversation.href = relativeUrlToConversation;
    anchorToConversation.textContent = "View detail";
    anchorToConversation.classList.add("Button"); // Use Zhihu's built-in style
    target.append(anchorToConversation);
}
