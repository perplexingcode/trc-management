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
  let response = await request(backendUrl + "/all/" + table, "GET");
  return response;
};

export const query = async function (table, queryName, queryValue) {
  const { backendUrl } = useRuntimeConfig();
  table = rename(table);
  if (typeof queryValue === "object") {
    let response = await request(
      backendUrl + "/query/" + table + "/" + queryName,
      "POST",
      JSON.stringify(queryValue),
    );
    return response;
  }
  let response = await request(
    backendUrl + "/query/" + table + "/" + queryName + "/" + queryValue,
    "GET",
  );

  return response;
};

export const getById = async function (table, id) {
  table = rename(table);
  return await request("/id/" + table + "/" + id, "GET");
};

// export const deleteItems = async function (id, itemArray, hasState) {
//   let deleteRowList = [];
//   if (id) {
//     deleteRowList.push(id);
//     const index = rows.value.findIndex((row) => row.id === id);
//     rows.value.splice(index, 1);
//   } else {
//     for (let i = 0; i < rows.value.length; i++) {
//       if (rows.value[i].state.isSelected) {
//         deleteRowList.push(rows.value[i].id);
//         rows.value.splice(i, 1);
//         i--;
//       }
//     }
//   }
//   request(
//     backendUrl + '/' + itemName + '/delete',
//     'post',
//     deleteRowList
//   );
// }
