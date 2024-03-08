export function nearlyScrolledToBottom(offset: number = 1): boolean {
  return window.innerHeight + Math.ceil(window.scrollY) + offset >= document.body.scrollHeight
}
export function scrollToBottomAndScrollBack() {
  const currentY = window.screenY
  window.screenY = document.body.scrollHeight
  window.screenY = currentY
}
