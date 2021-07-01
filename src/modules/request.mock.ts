
import { isObject, isRegExp, isArray, isFunction, isString } from "../utils/helper";

/**
 * 生成一个返回值对象
 * @param baseRep 基础响应
 * @param mixed 混入的对象
 */
function createResponse<T>(baseRep: T, mixed?: JSON): T {
  if (!isObject(mixed) || !mixed) {
    return baseRep;
  }
  let baseCopy = { ...baseRep };
  for (let key in mixed) {
    mixin(baseCopy, key, mixed[key]);
  }
  return baseCopy;
}

/**
 * 将数据混入到原对象中
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
 * @param url 地址或正则
 */
function createUrlRegExp(url: string | RegExp): RegExp {
  if (typeof url === 'string') {
    url = url.toString().replace('/', '\\/');
    url = url.replace('?', '\\?');
    return new RegExp(`(.*)?${url}`, 'i');
  }
  return url;
}

class RequestMock {

  /** response mocked map */
  _mockMap: object
  /** mounted Function */
  _source: Function
  /** bound object */
  _markObj: object
  /** property method of bound object */
  _markMethod: string

  constructor(obj: object, method: string) {
    this._mockMap = {};
    this._source = null;

    if (obj && method) {
      this.mount(obj, method);
    }
  }

  /**
   * 添加一个对传入 URL 的 mock 
   * @param url 地址
   * @param response 响应值
   * @param mixinData 混入值
   */
  mock(url: RegExp | string, response: any, mixinData?: JSON) {
    const regUrl = createUrlRegExp(url);
    this._mockMap[regUrl.toString()] = createResponse(response, mixinData);
  }

  /**
   * 移除对某个url的mock
   * @param url 要移除的监听地址
   */
  unmock(url: RegExp | string) {
    const regUrlKey = createUrlRegExp(url).toString();
    if (this._mockMap[regUrlKey]) {
      delete this._mockMap[regUrlKey];
    }
  }

  /**
   * 移除对传入 URL 的 mock
   * @param url 地址
   */
  remove(url: string | RegExp) {
    const regUrl = createUrlRegExp(url);
    try {
      delete this._mockMap[regUrl.toString()];
    }
    catch (err) {}
  }

  /**
   * 模拟发送请求
   * @param url 地址
   * @returns 
   */
  request(url: string): Promise<any> {
    for (let key in this._mockMap) {
      const response = this._mockMap[key];
      key = key.replace(/^\/|\/i$|\/$/g, '');
      const regUrl = new RegExp(key);
      if (regUrl.test(url)) {
        return Promise.resolve(response);
      }
    }
    return Promise.resolve();
  }

  /**
   * 绑定mock到指定对象的方法上
   * @param obj 需绑定的对象
   * @param method 需绑定的方法
   */
  mount(obj: object, method: string) {
    if (!obj || !method || !obj[method] || !isFunction(obj[method])) {
      throw new Error(`The bound object must have a property method that exists`);
    }

    this._markObj = obj;
    this._markMethod = method;
    this._source = obj[method];

    obj[method] = this.request.bind(this);
  }

  /**
   * 解除绑定
   */
  unmount() {
    this._markObj[this._markMethod] = this._source;
    this._source = null;
  }

  /**
   * 移除设定的mock
   */
  clear() {
    this._mockMap = {};
  }

};

export default RequestMock;