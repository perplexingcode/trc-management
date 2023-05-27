import { request } from './request.js';
import { deepClone } from './utils.js';

export const upsert = async function (table, data) {
  const { backendUrl } = useRuntimeConfig();
  data = deepClone(data);
  delete data.state;
  let response = await request(
    backendUrl + '/upsert/' + table,
    'POST',
    JSON.stringify(data)
  );
  return response;
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
