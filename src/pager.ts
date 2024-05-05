// ==UserScript==
// @name         Pager
// @version      0.0.1
// @match        https://cn.bing.com/search*
// @match        https://www.bing.com/search*
// ==/UserScript==

_debugger.enable()
onNearlyScrolledToBottom(
  () => {
    getNextPage()
  },
  { offset: 400 }
)
async function getNextPage() {
  const anchorToNextPage = [...document.querySelectorAll("a.sb_pagN")].at(-1) as HTMLAnchorElement
  const response = await fetch(anchorToNextPage.href)
  const contentOfNextPage = await response.text()
  const elementForNextPage = document.createElement("div")
  elementForNextPage.innerHTML = contentOfNextPage
  const resultList = elementForNextPage.querySelector("#b_results")!
  const relativeSearches = resultList.querySelector(".b_ans")!
  _debugger.log(relativeSearches)
  resultList.removeChild(relativeSearches)

  document.body.append(resultList)
}
