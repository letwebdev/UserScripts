export const mutationObserver = {
  initialize<
    T extends B extends false
      ? MutationCallback
      : MutationCallbackInnerForEachSingleAddedHTMLElement,
    B extends boolean = false,
  >(
    callback: T,
    options?: {
      target?: HTMLElement
      observerOptions?: MutationObserverInit
      manipulatingOnSingleAddedHTMLElement?: B
    }
  ) {
    const { target, observerOptions, manipulatingOnSingleAddedHTMLElement = false } = { ...options }
    let observerTemp
    if (
      !isMutationCallbackInnerForAtLeastOneAddedHTMLElement(
        callback,
        manipulatingOnSingleAddedHTMLElement
      )
    ) {
      observerTemp = new MutationObserver(callback)
    } else {
      observerTemp = new MutationObserver(
        (...[mutations, observer]: Parameters<MutationCallback>) => {
          mutations
            .filter(isRecordWithAtLeastOneAddedHTMLElement)
            .map((recordWithAtLeastOneAddedHTMLElement) => {
              return recordWithAtLeastOneAddedHTMLElement.addedNodes[0]
            })
            .forEach((addedElement) => {
              callback(addedElement, observer)
            })
        }
      )
    }
    const observer = observerTemp
    this.enable(observer, target, observerOptions)
    return observer

    function isMutationCallbackInnerForAtLeastOneAddedHTMLElement(
      callback: MutationCallback | MutationCallbackInnerForEachSingleAddedHTMLElement,
      manipulatingOnSingleAddedHTMLElement: boolean
    ): callback is MutationCallbackInnerForEachSingleAddedHTMLElement {
      return manipulatingOnSingleAddedHTMLElement === true
    }
  },

  enable(
    observer: MutationObserver,
    target: HTMLElement = document.body,
    options: MutationObserverInit = { subtree: true, childList: true }
  ) {
    observer.observe(target, options)
  },

  /**
   * Prevent deadlock when creating new nodes
   */
  temporarilyDisableAndDoSomething(observer: MutationObserver, callback: () => void) {
    observer.disconnect()
    callback()
    this.enable(observer)
  },
}

export interface MutationCallbackInnerForEachSingleAddedHTMLElement {
  (addedElement: HTMLElement, observer: MutationObserver): void
}
export function isRecordWithAtLeastOneAddedHTMLElement(
  record: MutationRecord
): record is RecordWithAtLeastOneAddedHTMLElement {
  return record.addedNodes[0] instanceof HTMLElement
}
interface RecordWithAtLeastOneAddedHTMLElement extends MutationRecord {
  addedNodes: AddedNodesWithAtLeastOneHTMLElement
}
interface AddedNodesWithAtLeastOneHTMLElement extends NodeList {
  0: HTMLElement
}
