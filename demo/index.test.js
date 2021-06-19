const axios = require('axios');
const RequestMock = require('../dist').default;

const resSuccess = {
  code: 0,
  msg: 'ok',
};

const resError = {
  code: 403,
  msg: 'error',
};

// 定义模拟数据
const mockData = {
  userList: {
    url: '/app/user/list?code=123456',
    response: {
      data: [
        {
          name: 'Tom',
          age: 18
        },
        {
          name: 'Jack',
          age: 20
        }
      ]
    }
  }
}

describe('Sinple demo', () => {
  
  const reqMock = new RequestMock(axios, 'get');

  afterAll(() => {
    reqMock.unmount();
  });

  it('[GET] should return user list', async () => {
    const { userList } = mockData;
    reqMock.mock(userList.url, userList.response, { ...resSuccess });
    const result = await axios.get(userList.url);
    
    expect(result.code).toBe(0);
    expect(result.data.length).toBe(2);
  });

  
  it('[GET] should return error code', async () => {
    const { userList } = mockData;
    reqMock.mock(userList.url, userList.response, { ...resError, data: null });
    const result = await axios.get(userList.url);
    
    expect(result.code).not.toBe(0);
    expect(result.data).toBeNull();
  });

});