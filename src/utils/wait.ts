/**
 * Promise-based `setTimeout`
 */
export default async function wait(time: number) {
  function execute(resolve: <T>(value: T) => void) {
    setTimeout(resolve, time);
  }
  return new Promise(execute);
}
