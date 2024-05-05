export function trySupplementingItemTime(
  element: HTMLElement,
  observerToTemporarilyDisable: MutationObserver
) {
  if (isAnswerContentWithTimeElements(element)) {
    mutationObserver.temporarilyDisableAndDoSomething(observerToTemporarilyDisable, () => {
      supplementItemTime(element)
    })
    return true
  } else {
    return false
  }
}
function isAnswerContentWithTimeElements(
  element: HTMLElement
): element is AnswerContentWithTimeElements {
  return (
    element.parentElement instanceof HTMLDivElement &&
    element.parentElement.classList.contains("RichContent") &&
    element.parentElement.querySelectorAll(".ContentItem-time").length === 1
  )
}
interface AnswerContentWithTimeElements extends HTMLElement {
  parentElement: HTMLDivElement
}
function supplementItemTime(element: AnswerContentWithTimeElements) {
  const answerContent = element.parentElement
  const wrapperOfTimeElements = answerContent.querySelector(".ContentItem-time")!
  const spanWithtimeOfItem = wrapperOfTimeElements.querySelector(
    "span[data-tooltip]"
  ) as HTMLSpanElement
  if (edited(spanWithtimeOfItem)) {
    const timeCreated = spanWithtimeOfItem.dataset.tooltip!
    const containerOfTimeCreated = wrapperOfTimeElements.cloneNode(true) as HTMLElement
    containerOfTimeCreated.querySelector("span[data-tooltip]")!.textContent = timeCreated
    answerContent.append(containerOfTimeCreated)
    if (answerLongEnough()) {
      const containerOfTimeCreated2 = containerOfTimeCreated.cloneNode(true) as HTMLElement
      answerContent.prepend(containerOfTimeCreated2)
    }
  }
  if (answerLongEnough()) {
    const containerOfTime = wrapperOfTimeElements.cloneNode(true)
    answerContent.prepend(containerOfTime)
  }

  function answerLongEnough() {
    return answerContent.offsetHeight > 700
  }
}
function edited(spanWithtimeOfItem: HTMLElement) {
  return spanWithtimeOfItem.textContent! !== spanWithtimeOfItem.dataset.tooltip!
}

export function inlayExtraButtonForCloseWhenOpeningModal() {
  const extraButtonForClose = document.createElement("button")
  extraButtonForClose.style.zIndex = "99999"
  extraButtonForClose.style.position = "fixed"
  extraButtonForClose.style.top = "33%"
  extraButtonForClose.style.left = "42%"
  extraButtonForClose.textContent = "close"
  extraButtonForClose.style.width = "300px"
  extraButtonForClose.style.height = "400px"
  extraButtonForClose.style.opacity = "0.8"
  extraButtonForClose.classList.add("Button")

  window.addEventListener("click", () => {
    tryInlayingExtraButtonForClose()
  })
  async function tryInlayingExtraButtonForClose() {
    await wait(200)
    const buttonForClosingModal: HTMLButtonElement | null =
      document.querySelector("button.css-169m58j")
    if (buttonForClosingModal) {
      const modal = document.querySelector(".css-19q29v6")!.parentElement!.parentElement!
      modal.appendChild(extraButtonForClose)
      buttonForClosingModal.addEventListener("click", () => {
        removeModal(modal)
      })
      extraButtonForClose.addEventListener("click", () => {
        removeModal(modal, buttonForClosingModal)
      })
    }
  }
}

function removeModal(modal: HTMLElement, buttonForClosingModal?: HTMLButtonElement) {
  // Improve (visual) performance
  modal.style.display = "none"
  buttonForClosingModal?.click()
}
