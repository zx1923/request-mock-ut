
function _is(obj: any, type: string): boolean {
  return getTypeOf(obj) === type;
}

/**
 * 获取数据类型
 * 
 * @param obj 
 * @returns string 
 */
function getTypeOf(obj: any): string {
  let type = Object.prototype.toString.call(obj);
  return type.replace(/\[object\s|\]/g, '');
}

/**
 * 是否为对象
 * 
 * @param obj 被检测值
 * @returns true/false
 */
function isObject(obj: any): boolean {
  return _is(obj, 'Object');
}

/**
 * 是否为a array
 * 
 * @param obj 被检测值
 * @returns true/false
 */
function isArray(obj: any): boolean {
  return _is(obj, 'Array');
}

/**
 * 是否为 function
 * 
 * @param obj 被检测值
 * @returns true/false
 */
function isFunction(obj: any): boolean {
  return _is(obj, 'Function') || _is(obj, 'AsyncFunction');
}

/**
 * 是否为正则
 * 
 * @param obj 被检测对象
 * @returns 
 */
function isRegExp(obj: any): boolean {
  return _is(obj, 'RegExp');
}

/**
 * 是否在字符串
 * 
 * @param obj 被检测对象
 */
function isString(obj: any): boolean {
  return _is(obj, 'String');
}

export {
  getTypeOf,
  isObject,
  isArray,
  isFunction,
  isRegExp,
  isString,
}