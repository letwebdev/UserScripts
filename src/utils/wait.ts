/**
 * Promise-based `setTimeout`
 */
export default async function wait(time: number): Promise<void> {
  function execute(resolve: (value: any) => void) {
    setTimeout(resolve, time)
  }
  return new Promise(execute)
}
