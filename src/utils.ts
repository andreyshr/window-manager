export function uuid() {
  return Math.floor(Math.random() * Date.now()).toString();
}
