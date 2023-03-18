export async function request(url, method, data) {
  let config = {
    method: method,
    body: data,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    data: data,
  };

  useFetch(url, config);
}

export function fetchWrapper(data) {
  if (!data._rawValue) return ref([]);
  return data;
}
