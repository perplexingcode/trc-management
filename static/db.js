import { request } from "./request.js";
import { deepClone } from "./utils.js";

function rename(name) {
  return name.includes("*") ? name.replace("*", "") : "management_" + name;
}

export const upsert = async function (table, data) {
  const { backendUrl } = useRuntimeConfig();
  table = rename(table);
  data = deepClone(data);
  delete data.state;
  let response = await request(
    backendUrl + "/upsert/" + table,
    "POST",
    JSON.stringify(data),
  );
  return response;
};

export const getAll = async function (table) {
  const { backendUrl } = useRuntimeConfig();
  table = rename(table);
  let response = await request("all" + "/" + table, "GET");
  return response;
};

export const query = async function (table, queryName, queryValue) {
  table = rename(table);
  if (typeof queryValue === "object") {
    let response = await request(
      "query" + "/" + table + "/" + queryName,
      "POST",
      JSON.stringify(queryValue),
    );
    return response;
  }
  let response = await request(
    "query" + "/" + table + "/" + queryName + "/" + queryValue,
    "GET",
  );

  return response;
};

export const getById = async function (table, id) {
  table = rename(table);
  return await request("id" + "/" + table + "/" + id, "GET");
};

export const dbDelete = async function (table, list) {
  table = rename(table);
  request("delete" + "/" + table, "post", list);
};
