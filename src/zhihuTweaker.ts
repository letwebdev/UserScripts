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
import { supplementFooterOfQuestionHeader } from "./zhihu/question"
import { removeAutoGenerantedKeywordLinks, substituteRedirectionLinks } from "./zhihu/links"
import { supplementItemTime } from "./zhihu/timeGroups"
import { supplementHeader } from "./zhihu/indexFollow"
import { supplementConsultPage } from "./zhihu/consult"
;(async function () {
  const currentUrl = window.location.href
  const validFollowUrl = new RegExp("https://www.zhihu.com/follow*")
  const validQuestionUrl = new RegExp("https://www.zhihu.com/question(?!.*/log$).*")
  // const validPeoPleUrl = new RegExp("https://www.zhihu.com/people/*")
  // const validArticleUrl = new RegExp("https://zhuanlan.zhihu.com/p/*")
  const validConsultUrl = new RegExp("https://www.zhihu.com/consult/people/*")

  setInterval(() => {
    supplementItemTime()
    removeAutoGenerantedKeywordLinks()
    substituteRedirectionLinks()
  }, 2000)

  switch (true) {
    case inUrl(validFollowUrl): {
      supplementHeader()
      break
    }
    case inUrl(validQuestionUrl): {
      setInterval(() => {
        supplementFooterOfQuestionHeader()
      }, 2000)
      break
    }
    case inUrl(validConsultUrl): {
      supplementConsultPage()
      break
    }

    default:
  }

  function inUrl(type: RegExp) {
    return type.test(currentUrl)
  }
})()
