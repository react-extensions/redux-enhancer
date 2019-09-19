/**
 * 判断一个给定的值是不是普通的对象 => {}
 */
export default function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto;
}
