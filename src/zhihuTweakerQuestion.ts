// ==UserScript==
// @name         Zhihu tweaker for question
// @version      0.0.3
// @match        https://www.zhihu.com/question/*
// @exclude      https://www.zhihu.com/question/*/log
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// ==/UserScript==
const relativeUrlToLog = getRelativeUrlToLog()
const anchorToLog = createAnchorToLog(relativeUrlToLog)
const elemenForTimeCreated = createElementForTimeCreated()

;(async function supplementQuestionHeader() {
  const container = createContainerForContentToBeSupplemented()
  container.append(anchorToLog)
  container.append(await elemenForTimeCreated)
  const logElement = await getLogElement()
  const [elementForQuestioner, elementForTimeLastModified] =
    await getQuestionerAndTimeGroups(logElement)
  if (elementForTimeLastModified.dateTime !== (await elemenForTimeCreated).dateTime) {
    container.append(elementForTimeLastModified)
  }
  container.append(elementForQuestioner)

  const logMain: HTMLElement = logElement.querySelector("[role='main']")!
  anchorToLog.after(logMain)
  logMain.style.display = "none"
  anchorToLog.addEventListener("click", (event) => {
    event.preventDefault()
    logMain.style.display = logMain.style.display === "none" ? "" : "none"
  })
})()

/** @example "/question/123456789/log" */
function getRelativeUrlToLog() {
  /** @example "/question/123456789/answer/1234567890" */
  const currentPathname = window.location.pathname
  const validInfixOfQuestionPage = new RegExp("^/question/\\d+")
  /** @example "/question/123456789" */
  const urlInfixOfLogPage = currentPathname.match(validInfixOfQuestionPage)![0]
  return `${urlInfixOfLogPage}/log`
}
function createAnchorToLog(relativeUrlToLog: string) {
  const anchorToLog = document.createElement("a")
  anchorToLog.textContent = "View log"
  anchorToLog.classList.add("Button--grey", "Button")
  anchorToLog.href = relativeUrlToLog
  return anchorToLog
}
async function createElementForTimeCreated() {
  const timeCreated = (
    (await selectElementAsync("meta[itemprop='dateCreated']")) as HTMLMetaElement
  ).content
    .replace(/.000Z$/, "")
    .replace("T", " ")
  const elemenForTimeCreated = document.createElement("time")
  elemenForTimeCreated.textContent = timeCreated
  elemenForTimeCreated.dateTime = timeCreated
  return elemenForTimeCreated
}
async function getLogElement() {
  const logHtml = await fetch(relativeUrlToLog, {
    headers: { "Content-Type": "text/html" },
  }).then((response) => {
    return response.text()
  })
  const logElement = document.createElement("section")
  logElement.innerHTML = logHtml
  return logElement
}
async function getQuestionerAndTimeGroups(logElement: HTMLElement) {
  const logList = logElement.querySelector("#zh-question-log-list-wrap")!
  const logListItems = logList.querySelectorAll(".zm-item")
  const timeLastModified = logListItems[0].querySelector("time")!
  const earliestLogListItem = [...logListItems].at(-1)!
  const anchorToQuestioner: HTMLAnchorElement =
    earliestLogListItem.querySelector("& > div:nth-child(1) a")!
  anchorToQuestioner.style.fontWeight = "bold"
  return [anchorToQuestioner, timeLastModified] as const
}
function createContainerForContentToBeSupplemented() {
  const elementOfContentOfQuestionHeader = document.querySelector("main .QuestionHeader-content")!
  const container = document.createElement("span")
  elementOfContentOfQuestionHeader.append(container)
  return container
}
