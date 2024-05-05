// ==UserScript==
// @name         Zhihu tweaker for peopple
// @version      0.0.1
// @match        https://www.zhihu.com/people/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// ==/UserScript==

;(async function () {
  const profileMain = await selectElementAsync(".Profile-main")
  enableAutoTurningToNextPage(".PaginationButton-next", { offsetTop: profileMain.offsetTop })
})()
