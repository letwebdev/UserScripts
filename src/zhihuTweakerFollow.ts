// ==UserScript==
// @name         Zhihu tweaker for follow
// @version      0.0.3
// @match        https://www.zhihu.com/follow
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// ==/UserScript==
// Can't run-at document.body as the list is(may be) substituted after idle
// debug.enable()
const SELECTOR_TITLE_OF_ITEM =
  ".ContentItem-title meta[itemprop='name'], .ContentItem meta[itemprop='headline']"

const keywordsToBlockUniversal = new UserScriptStorage("keywordsToBlockUniversal", [""])
const keywordsToBlockZhihu = new UserScriptStorage("keywordsToBlockZhihu", [""])
const keywordsToBlockZhihuCache = keywordsToBlockZhihu.value!
const keywordsToBlockUniversalCache = keywordsToBlockUniversal.value!
const keywords = [keywordsToBlockZhihuCache, keywordsToBlockUniversalCache].flat()
// console.log(keywords)

const list = await selectElementAsync("[role='list']")
_debugger.log(list)

initItemRemover()
appendKeywordInput(keywordsToBlockZhihu)
supplementHeader()

async function initItemRemover() {
  // For items fetched directly from server
  ;[...list.children].forEach((item) => {
    tryRemovingItem(item as HTMLElement)
  })
  tryRemovingItems(list)
}

async function tryRemovingItems(targetOfObserver: HTMLElement) {
  _debugger.log("start observe")
  mutationObserver.initialize(
    (item) => {
      _debugger.log(item)
      _debugger.log(list)
      tryRemovingItem(item)
    },
    {
      manipulatingOnSingleAddedHTMLElement: true,
      observerOptions: { childList: true },
      target: targetOfObserver,
    }
  )
}
async function tryRemovingItem(item: HTMLElement) {
  const titleOfItem = (
    (await selectElementAsync(SELECTOR_TITLE_OF_ITEM, {
      parent: item,
      expectingTheElementToExist: false,
    })) as HTMLMetaElement
  ).content

  if (
    keywords.some((keyword) => {
      return titleOfItem.includes(keyword)
    })
  ) {
    item.remove()
  }
}

function appendKeywordInput(storage: typeof keywordsToBlockZhihu) {
  const form = document.createElement("form")
  const textInput = document.createElement("input")
  const submitButton = document.createElement("input")

  form.addEventListener("submit", (event) => {
    event.preventDefault()
    if (textInput.value === "") {
      return
    } else {
      storage.unshift(textInput.value)
      removeItem(textInput.value)
      textInput.value = ""
    }
  })

  form.style.position = "fixed"
  form.style.bottom = "1%"
  form.style.right = "1%"
  form.style.zIndex = "99999"
  form.style.display = "flex"
  textInput.placeholder = "Add a keyword to Block"
  submitButton.type = "submit"
  submitButton.value = "Add"
  form.append(textInput, submitButton)
  document.body.append(form)
}
async function removeItem(keyword: string) {
  _debugger.log(list)
  ;[...list.children]
    .filter((item) => {
      const meta: HTMLMetaElement | null = item.querySelector(SELECTOR_TITLE_OF_ITEM)
      return meta?.content?.includes(keyword)
    })
    .forEach((item) => {
      item.remove()
    })
}

function supplementHeader() {
  const header = document.querySelector(".AppHeader-userInfo")!
  const favorites = document.querySelector(".GlobalSideBar-starItem")!
  const followingQuestions = document.querySelector(".GlobalSideBar-questionListItem")!
  const ul = document.createElement("ul")
  ul.style.display = "flex"
  ul.append(favorites, followingQuestions)
  header.append(ul)
}
