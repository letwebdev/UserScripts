import selectElementAsync from "../utils/selectElementAsync"

export function supplementItemTime() {
  const itemsToPendTime: NodeListOf<HTMLElement> = document.querySelectorAll(
    ".AnswerItem .RichContent:not(.itemTimeAlreadySupplemented)"
  )
  pendTimeToItems(itemsToPendTime)
}

function pendTimeToItems(items: NodeListOf<HTMLElement>) {
  items.forEach(async (item) => {
    item.classList.add("itemTimeAlreadySupplemented")
    const containerOfTime = await selectElementAsync(".ContentItem-time", { parent: item })
    pendTime(item, containerOfTime)
  })
}

function pendTime(target: HTMLElement, containerOfTime: HTMLElement) {
  const spanWithtimeOfItem = containerOfTime.querySelector("span[data-tooltip]") as HTMLSpanElement
  if (itemWasEdited(spanWithtimeOfItem)) {
    const containerOfTimeEdited = containerOfTime.cloneNode(true)
    target.prepend(containerOfTimeEdited)

    const containerOfTimeCreated = containerOfTime.cloneNode(true)
    const timeCreated = spanWithtimeOfItem.dataset.tooltip as string
    containerOfTimeCreated.textContent = timeCreated
    target.prepend(containerOfTimeCreated)

    const containerOfTimeCreatedToAppend = containerOfTimeCreated.cloneNode(true)
    target.append(containerOfTimeCreatedToAppend)
  } else {
    const containerOfTimeCreated = containerOfTime.cloneNode(true)
    target.prepend(containerOfTimeCreated)
  }
}

function itemWasEdited(spanWithtimeOfItem: HTMLElement) {
  return (spanWithtimeOfItem.textContent as string).includes("编辑于")
}
