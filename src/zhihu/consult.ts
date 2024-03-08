import selectElementAsync from "../utils/selectElementAsync"

export async function supplementConsultPage() {
  repeatlyAppendAnchors()
  const buttonForShowingMore = (await selectElementAsync(
    ".PublicConsultation-layerContent"
  )) as HTMLDivElement
  buttonForShowingMore.addEventListener("click", repeatlyAppendAnchors)
}

function repeatlyAppendAnchors() {
  appendAnchors()
  setTimeout(appendAnchors, 200)
  setTimeout(appendAnchors, 500)
}

function appendAnchors() {
  const consultCards: NodeListOf<HTMLElement> = document.querySelectorAll(
    ".ConsultCard:not(.linkToConversationAppended)"
  )
  consultCards.forEach((consultCard) => {
    appendAnchor(consultCard)
    consultCard.classList.add("linkToConversationAppended")
  })
}

function appendAnchor(target: HTMLElement) {
  const linkToConversation = document.createElement("a")
  const relativeUrlToConversation = target.dataset.to as string
  linkToConversation.href = relativeUrlToConversation
  linkToConversation.textContent = "打开对话页面"
  linkToConversation.classList.add("Button")
  target.append(linkToConversation)
}
