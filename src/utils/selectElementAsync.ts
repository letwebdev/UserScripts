import wait from "./wait"
/**
 * Will retry at a later time if the element is null(not loaded in page yet)
 */
interface Options {
  intervalOfRetry?: number
  parent?: Document | HTMLElement
}
export default async function selectElementAsync(
  querySelector: string,
  options: Options = {
    intervalOfRetry: 1000,
    parent: document,
  }
) {
  const intervalOfRetry = options.intervalOfRetry || 1000
  const parent = options.parent || document
  const element: HTMLElement | null = parent.querySelector(querySelector)
  if (element === null) {
    await wait(intervalOfRetry)
    return selectElementAsync(querySelector, options)
  } else {
    return element
  }
}
