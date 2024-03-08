export function supplementFooterOfQuestionHeader() {
  const footer = document.querySelector(".QuestionHeader-footer-main") as HTMLDivElement
  const buttonForViewingLogBeingAppended: HTMLAnchorElement | null = footer.querySelector(
    ".buttonForViewingLogBeingAppended"
  )
  if (buttonForViewingLogBeingAppended) {
    return
  } else {
    appendButtonForViewingLog(footer)
    appendTimeGroups(footer)

    function appendButtonForViewingLog(target: HTMLElement) {
      const linkToLog = document.createElement("a")
      linkToLog.textContent = "查看问题日志"
      linkToLog.classList.add("Button--grey", "Button", "buttonForViewingLogBeingAppended")

      linkToLog.href = getUrlToLog()
      target.append(linkToLog)
    }
  }

  async function appendTimeGroups(target: HTMLElement) {
    const logHtml = await fetch(getUrlToLog(), {
      headers: {
        "Content-Type": "text/html",
      },
    }).then((response) => {
      return response.text()
    })
    const sectionOfLog = document.createElement("section")
    sectionOfLog.innerHTML = logHtml

    const logList = sectionOfLog.querySelector("#zh-question-log-list-wrap") as HTMLDivElement
    const logListItems: NodeListOf<HTMLDivElement> = logList.querySelectorAll("div.zm-item")
    const timeLastModified = logListItems[0].querySelector("time")!

    const earliestLogListItem = [...logListItems].at(-1)!
    const timeCreated = earliestLogListItem.querySelector("time")!
    const questioner: HTMLAnchorElement =
      earliestLogListItem.querySelector("& > div:nth-child(1) a")!
    target.append(questioner, timeCreated, timeLastModified)
  }

  function getUrlToLog() {
    const currentUrl = window.location.href
    const validUrlInfixOfLinkToLog = new RegExp("/question/\\d+")
    const urlInfixOfLinkToLog = (currentUrl.match(validUrlInfixOfLinkToLog) as RegExpMatchArray)[0]
    return `${urlInfixOfLinkToLog}/log`
  }
}
