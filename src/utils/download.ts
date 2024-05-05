// eslint-disable-next-line @typescript-eslint/ban-types
interface String2 extends String {}
export type DownloadUrl = string & String2
export type FileName = string & String2
export type MetadataForDownloadGroup = readonly [DownloadUrl, FileName]
export function download(link: string, fileName?: string, headers?: Headers) {
  if (isOnTheSameOrigin(link)) {
    const tempLink = document.createElement("a")
    tempLink.target = "_blank"
    tempLink.href = link
    tempLink.download = fileName ?? ""
    tempLink.click()
  } else {
    const downloadConfig: DownloadConfig = {
      url: link,
      name: fileName ?? link,
      onerror: (error) => {
        const errorReason = error.error
        console.error(
          `Tampermonkey download error for the reason: ${errorReason}, see details below`
        )
        console.error(error.details)
      },
    }
    if (headers !== undefined) {
      const headerObject: { [key: string]: any } = {}
      headers?.forEach((value, key) => {
        headerObject[key] = value
      })
      downloadConfig.headers = headerObject
    }

    GM_download(downloadConfig)
  }
}

export function enableMiddleClickToDownload(
  element: HTMLElement,
  link: string,
  fileName: string,
  headers?: Headers
) {
  element.addEventListener("auxclick", (event) => {
    if (isMiddleclick(event)) {
      event.stopPropagation()
      event.preventDefault()
      download(link, fileName, headers)
    }
  })
}
export function isMiddleclick(event: MouseEvent) {
  return event.button === 1
}
export function isLeftclick(event: MouseEvent) {
  return event.button === 0
}

function isOnTheSameOrigin(link: string) {
  const originOfCurrentLocation = new URL(window.location.href).origin
  const originOfTheLink = new URL(link).origin
  return originOfCurrentLocation === originOfTheLink
}
interface DownloadError {
  /**
   * @example
   * ```js
   * "a1b1c11c-11bd-1111-11f1-1111b111ae11"
   * ```
   */
  id: string
  /** Error reason */
  error: "not_whitelisted" | "not_permitted" | "not_succeeded" | "unknown"
  details: {
    current: string | "USER_CANCELED"
  }
}
interface DownloadConfig {
  url: string
  name: string
  headers?: object
  onerror: (error: DownloadError) => void
}
// TODO
// class DownloadConfig2 {
//   url
//   name
//   headers?: object
//   onerror(error: DownloadError) {
//     const errorReason = error.error
//     console.error(`Tampermonkey download error for the reason: ${errorReason}, see details below`)
//     console.error(error.details)
//   }
//   constructor(link: string, name: string, headers?: object) {
//     this.url = link
//     this.name = name
//     this.headers = headers
//   }
// }
declare function GM_download(config: DownloadConfig): void
