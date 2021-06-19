
import { isObject, isRegExp, getTypeOf, isArray, isFunction } from "../utils/helper";

declare function MountFunction(url: string, params?: object): Promise<any>;

/**
 * 生成一个返回值对象
 * 
 * @param baseRep 基础响应
 * @param mixed 混入的对象
 */
function createResponse<T>(baseRep: T, mixed?: object): T {
  if (!isObject(mixed) || !mixed) {
    return baseRep;
  }
  for (let key in mixed) {
    baseRep = mixin(baseRep, key, mixed[key]);
  }
  return baseRep;
}

/**
 * 将数据混入到原对象中
 * 
 * @param obj 原对象
 * @param position 混入的位置
 * @param mixdata 需要混入的值
 * @returns 
 */
function mixin<T>(obj: T, position: string, mixdata: any): T {
  if (!isObject(obj) || !position) {
    return obj;
  }

  if (!/\./.test(position)) {
    obj[position] = obj[position] ? assignIn(obj[position], mixdata) : mixdata;
    return obj;
  }

  const key = position.split('.')[0];
  const newPos = position.replace(new RegExp(`^${key}\.`), '');
  obj[key] = obj[key] ? mixin(obj[key], newPos, mixdata) : mixdata;

  return obj;
}

/**
 * 合入
 * 
 * @param obj 原对象
 * @param data 合人值
 */
function assignIn(obj: any, data: any) {
  if (isArray(obj) && isArray(data)) {
    obj = obj.concat(data);
    return obj;
  }

  if (isObject(obj) && isObject(data)) {
    obj = Object.assign(obj, data);
    return obj;
  }

  return obj = data;
}

/**
 * 生成一个URL的正则匹配
 * 
 * @param url 地址
 */
function createUrlRegExp(url: any): RegExp {
  if (!isRegExp(url)) {
    let u = url.toString().replace('/\//', '\\/');
    u = u.replace('?', '\\?');
    return new RegExp(`(.*)?${u}`, 'i');
  }
  return url;
}

class RequestMock {

  /** response mocked map */
  reqMap: Map<RegExp, Function | string | object>
  /** mounted Function */
  _source: Function

  constructor() {
    this.reqMap = new Map();
    this._source = null;
  }

  /**
   * 添加一个对传入 URL 的 mock 
   * 
   * @param url 地址
   * @param response 响应值
   * @param mixinData 混入值
   */
  mock(url: RegExp | string, response: any, mixinData?: object) {
    const regUrl = createUrlRegExp(url);
    this.reqMap.set(regUrl, createResponse(response, mixinData));
  }

  /**
   * 移除对传入 URL 的 mock
   * 
   * @param url 地址
   */
  remove(url: string | RegExp) {
    const regUrl = createUrlRegExp(url);
    this.reqMap.delete(regUrl);
  }

  /**
   * 使用当前的Mock对象包装传入的方法
   * 
   * @param fn 被包装的方法
   */
   decorate(fn: typeof MountFunction): Function {
    if (isFunction(fn)) {
      this._source = fn;
    }

    return (url: string, params?: object): Promise<any> => {
      for (let [regUrl, response] of this.reqMap) {
        if (regUrl.test(url)) {
          return Promise.resolve(response);
        }
      }
      return Promise.resolve();
    };
  }

  /**
   * 回滚恢复
   * 
   * @param obj 需移除的被挂载对象
   */
  rollback(): Function {
    return this._source;
  }

  /**
   * 移除设定的mock
   */
  clear() {
    this.reqMap.clear();
  }

};

export default RequestMock;