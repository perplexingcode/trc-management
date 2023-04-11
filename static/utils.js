import { v4 } from 'uuid';

export const unwrap = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};
export const deepClone = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};
export const dir = function (path) {
  const config = useRuntimeConfig();
  const rootDir = config.rootDir;
  return rootDir + '/' + path;
};

export const newId = function () {
  return v4().replace(/-/g, '').slice(0, 12);
};
