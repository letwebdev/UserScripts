/**
 * Can't be used CORS-ly
 */
export function download(link: string) {
  const tempLink = document.createElement("a")
  tempLink.target = "_blank"
  tempLink.href = link
  tempLink.download = ""
  document.body.appendChild(tempLink)
  tempLink.click()
  document.body.removeChild(tempLink)
}
