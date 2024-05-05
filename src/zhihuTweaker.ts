// ==UserScript==
// @name         Zhihu tweaker
// @version      0.1.5
// @match        https://*.zhihu.com/*
// @exclude      https://www.zhihu.com/consult/*
// @exclude      https://www.zhihu.com/question/*/log
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// ==/UserScript==
import {
  inlayExtraButtonForCloseWhenOpeningModal,
  trySupplementingItemTime,
} from "./zhihu/supplement"
import { tryCoveringAutoGeneratedKeywordLink, trySubstitutingRedirectionLink } from "./zhihu/links"
import { zhihu } from "./zhihu/basic"

await init()
mutationObserver.initialize(
  (addedElement, observer) => {
    tryCoveringAutoGeneratedKeywordLink(addedElement) ||
      trySubstitutingRedirectionLink(addedElement) ||
      trySupplementingItemTime(addedElement, observer)
  },
  {
    manipulatingOnSingleAddedHTMLElement: true,
  }
)
inlayExtraButtonForCloseWhenOpeningModal()

async function init() {
  // Delay execution of the script
  const main = await selectElementAsync("main")
  if (zhihu.inArticlePage) {
    //  `main` of Article pages are not observed
    main.querySelectorAll("a").forEach((anchor) => {
      tryCoveringAutoGeneratedKeywordLink(anchor)
    })
  }
}
