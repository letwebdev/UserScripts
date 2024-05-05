export const _debugger = {
  on: false,
  enable() {
    this.on = true
  },
  disable() {
    this.on = false
  },
  log<T = any>(...data: T[]) {
    this.on && console.log(data)
  },
  logForce<T = any>(...data: T[]) {
    console.log(data)
  },
}
