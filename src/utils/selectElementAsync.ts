/**
 * @param options.intervalOfRetry * Will retry at `a later time` if the element is null(e.g. not loaded in page yet)
 * @warn This may cause an observer relying on the element to not work properly
 * @default 1000
 */
export default async function selectElementAsync<E extends HTMLElement>(
  selectors: string,
  options?: {
    intervalOfRetry?: number
    parent?: Document | HTMLElement
    expectingTheElementToExist?: boolean
    patient?: boolean
  }
) {
  const {
    intervalOfRetry = 1000,
    parent = document,
    expectingTheElementToExist = true,
    patient = false,
  } = { ...options }
  let timesTried = 0
  while (true) {
    if (expectingTheElementToExist && timesTried === 10) {
      const prompt = `\`selectElementAsync\` for "${selectors}" failed ${timesTried} times`
      if (patient) {
        console.info(prompt)
      } else {
        console.warn(prompt)
      }
    }
    timesTried += 1
    const element: E | null = parent.querySelector(selectors)
    if (element === null) {
      await wait(intervalOfRetry)
    } else {
      return element
    }
  }
}
