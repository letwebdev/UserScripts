declare function GM_getValue<T>(key: string, defaultValue: T): T
declare function GM_setValue<T>(key: string, value: T): void
declare function GM_listValues(): string[]

export class UserScriptStorage<T> {
  get value() {
    return GM_getValue(this.key, this.#defaultValue)
  }
  set value(value) {
    GM_setValue(this.key, value)
  }
  key: string
  #defaultValue
  constructor(key: string, defaultValue?: T) {
    this.key = key
    this.#defaultValue = defaultValue
  }

  push<E>(element: E) {
    if (Array.isArray(this.value)) {
      ;(this.value as any[]) = [...this.value, element]
    }
  }
  unshift<E>(element: E) {
    if (Array.isArray(this.value)) {
      ;(this.value as any[]) = [element, ...this.value]
    }
  }

  static get keyList() {
    return GM_listValues()
  }
}
