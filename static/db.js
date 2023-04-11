import { request } from './request.js';
import { deepClone } from './utils.js';

export const upsert = async function (url, data) {
  data = deepClone(data);
  delete data.state;
  let response = await request(url, 'POST', JSON.stringify(data));
  return response;
};
