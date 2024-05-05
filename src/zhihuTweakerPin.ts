// ==UserScript==
// @name         Zhihu tweaker for pins
// @version      0.0.1
// @match        https://www.zhihu.com/people/*/pins*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// ==/UserScript==
const button = createFixedButton()
const range: (number | undefined)[] = [0, 10]

button.addEventListener("click", openItemsInNewTab)

async function openItemsInNewTab() {
  const anchors: NodeListOf<HTMLAnchorElement> = document.querySelectorAll(".ContentItem-time > a")
  const links = [...anchors]
    .map((anchor) => {
      return anchor.href
    })
    .reverse()
  // links.slice(range[0], range[1]).forEach((link) => {
  //   openInTab(link)
  // })
  for (const link of links.slice(range[0], range[1]).toReversed()) {
    openInTab(link)
    await wait(2000)
  }
  range[0] = range[0] === 0 ? 10 : 0
  range[1] = range[1] === 10 ? undefined : 10
}

function createFixedButton() {
  const button = document.createElement("button")
  button.textContent = "Open pins"
  button.style.position = "fixed"
  button.style.top = "25%"
  button.style.left = "2%"
  button.style.zIndex = "9"
  button.classList.add("Button")
  document.body.append(button)
  return button
}
