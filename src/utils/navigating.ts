declare function GM_openInTab(
  url: string,
  options?: { loadInBackground: boolean }
): {
  close: () => void
  onclose: () => any
  closed: boolean
}
export function openInTab(url: string) {
  return GM_openInTab(url)
}

export function enableAutoTurningToNextPage(
  selectorForButtonToNextPage: string,
  options?: {
    elementToAddPadding?: HTMLElement
    offsetTop?: number
  }
) {
  const { elementToAddPadding = document.body, offsetTop } = { ...options }

  onNearlyScrolledToBottom(() => {
    tryTurningToNextPage() && scrollTo({ top: offsetTop })
  })
  elementToAddPadding.style.paddingBottom = "700px"

  function tryTurningToNextPage() {
    const buttonToNextPage: HTMLElement | null = document.querySelector(selectorForButtonToNextPage)
    if (buttonToNextPage !== null) {
      buttonToNextPage.click()
      return true
    } else {
      return false
    }
  }
}

export function inPage(regExp: RegExp) {
  return regExp.test(window.location.href)
}

export function redirectedFromAnotherTab() {
  return window.history.length > 1
}
export function getPathname(href: string) {
  return new URL(href).pathname
}
