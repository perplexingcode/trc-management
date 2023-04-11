export async function request(url, method, data, header) {
  let config = {
    method: method,
    body: data,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    data: data,
  };
  if (header) {
    config.headers = { ...config.headers, ...header };
  }
  useFetch(url, config);
}

export function fetchWrapper(data) {
  if (!data._rawValue) return ref([]);
  return data;
}
