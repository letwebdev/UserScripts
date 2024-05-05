// ==UserScript==
// @name         Zhihu tweaker for consult
// @version      0.0.1
// @description  tweak zhihu functionalities
// @match        https://www.zhihu.com/consult/people/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// ==/UserScript==
enableAppendingAnchorsToCards()
enableAutomaticallyShowingMore()

async function enableAppendingAnchorsToCards() {
  const listOfConsultCards = await selectElementAsync(".PublicConsultation-list")
  appendAnchorsToExistingCards(
    listOfConsultCards.querySelectorAll(":scope > .ConsultCard-container")
  )
  automaticallyAppendAnchorsToNewCards(listOfConsultCards)
}
async function enableAutomaticallyShowingMore() {
  const buttonForShowingMore = await selectElementAsync(".PublicConsultation-layerContent")
  onNearlyScrolledToBottom(
    async () => {
      buttonForShowingMore.click()
    },
    { offset: 1000, cooldown: 200 }
  )
}

// Require target as argument here as the target must be declared first
async function automaticallyAppendAnchorsToNewCards(target: HTMLElement) {
  const observer = new MutationObserver(appendAnchorsToNewCard)
  observer.observe(target, { childList: true })
}
function appendAnchorsToNewCard(recordList: MutationRecord[]) {
  recordList.forEach((record) => {
    appendAnchorsToExistingCards(record.addedNodes as NodeListOf<HTMLElement>)
  })
}

function appendAnchorsToExistingCards(containersOfConsultCards: NodeListOf<HTMLElement>) {
  ;[...containersOfConsultCards]
    .map((containerOfConsultCard): HTMLElement => {
      return containerOfConsultCard.querySelector(".ConsultCard")!
    })
    .forEach((consultCard) => {
      appendAnchor(consultCard)
    })
}
function appendAnchor(target: HTMLElement) {
  const anchorToConversation = document.createElement("a")
  const relativeUrlToConversation = target.dataset.to!
  anchorToConversation.href = relativeUrlToConversation
  anchorToConversation.textContent = "View detail"
  anchorToConversation.classList.add("Button") // Use Zhihu's built-in style
  target.append(anchorToConversation)
}
