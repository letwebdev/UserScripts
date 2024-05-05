export function nearlyScrolledToBottom(offset: number = 1): boolean {
  return window.innerHeight + Math.ceil(window.scrollY) + offset >= document.body.scrollHeight
}
export function awayFromBottom(offset: number = 1): boolean {
  return window.innerHeight + Math.ceil(window.scrollY) + offset < document.body.scrollHeight
}

export async function scrollToBottomAndScrollBack(delay: number = 0) {
  const currentY = window.scrollY
  scrollToBottom()
  // Have to await even for 0ms
  await wait(delay)
  window.scrollTo({
    top: currentY,
    behavior: "instant",
  })
}
export function scrollToBottom() {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "instant",
  })
}

export function onNearlyScrolledToBottom(
  callback: (cooldown: number) => void,
  options?: {
    offset?: number
    cooldown?: number
  }
) {
  const { offset = 1, cooldown = 100 } = { ...options }
  let cooledDown = true
  window.addEventListener("scroll", async () => {
    if (cooledDown && nearlyScrolledToBottom(offset)) {
      if (cooldown) {
        cooledDown = false
        callback(cooldown)
        await wait(cooldown)
        cooledDown = true
      } else {
        callback(cooldown)
      }
    }
  })
}

/**
 * @example
 * ```html
 * <parent>
 *   <child class="w-10000px" />
 * </parent>
 * ```
 * ```js
 * enableHorizontalScroll(parent)
 * ```
 */
export function enableHorizontalScroll<T extends HTMLElement>(
  parentOfOverflownElement: T,
  step: number = 288
) {
  parentOfOverflownElement.addEventListener("wheel", (wheelEvent) => {
    wheelEvent.preventDefault()
    if (wheelEvent.deltaY > 0) {
      parentOfOverflownElement.scrollLeft += step
    } else {
      parentOfOverflownElement.scrollLeft -= step
    }
  })
}
