<template>
  <tr
    class="new-row"
    @keyup="handleKeyUp($event)"
    @keydown="handleKeyDown($event)"
  >
    <TableCell
      v-for="col in props.columns"
      :element="col"
      :item="newItem"
      :key="col.key"
      is-new-cell
      :table-id="props.tableId"
    />
  </tr>
</template>
<script setup>
import { v4 } from "uuid";
import { deepClone, removeState, dir, deepCompare } from "~/static/utils";
import { upsert, getAll, dbDelete } from "~/static/db";
import { durationValidate } from "~~/static/time";
import GetId from "~~/components/GetId.vue";

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  newItem: {
    type: Object,
    required: false,
  },
  suggestions: {
    type: Array,
    required: false,
    default: () => ref([]),
  },
  addRow: {
    type: Boolean,
    required: false,
    default: true,
  },
  tableId: {
    type: String,
    required: true,
  },
});

class State {
  isBeingEdited = false;
  isSelected = false;
}

let id = ref(v4());

// >>>----------------------------------------------------------------------------------<<<
//If new item is passed as prop, use it
let newItem = props.newItem;
props.newItem
  ? (props.newItem.state = reactive({ isBeingEdited: null, isSelected: null }))
  : null;
//If not, create a new one
newItem ||= reactive(createNewItemObj());
function createNewItemObj() {
  const item = {};
  props.columns.forEach((col) => {
    if (!col.name || col.noSave) return;
    col.default !== null && col.default !== undefined
      ? (item[col.key] = col.default)
      : (item[col.key] = "");
  });
  item.state = new State();
  item.id = id;
  item.state.isBeingEdited = null;
  item.state.isSelected = null;
  item.state.isFocused = null;
  return item;
}
// >>>----------------------------------------------------------------------------------<<<

// <DEV>
let suggestionItems = ref([]);
// </DEV>

// <DEV> TODO

// function validateColumns(items) {
//   let validated = true;
//   const requiredFields = [];
//   for (let col in columns) {
//     if (columns[col]?.attrs?.required && !items[columns[col].key]) {
//       validated = false;
//       requiredFields.push(columns[col].key);
//     }
//   }
//   if (!validated) {
//     alert("Please fill in the required fields: " + requiredFields.join(", "));
//     return false;
//   }
//   return true;
// }
// function createRow() {
//   if (!validateColumns(newItem)) return;
//   const item = deepClone(newItem);
//   item.state = new State();
//   rows.value.push(item);
//   upsert(itemName, newItem);
//   emits("rowUpsert", props.itemName);
//   id.value = v4();
//   states.isShownSuggestions = false;
//   resetNewItem();
// }

// const MAX_SUGGESTION_ROW = 5;

// function importSuggestion(index) {
//   const suggestion = suggestionItems.value[index];
//   for (let i = 0; i < suggestion.length; i++) {
//     const key = suggestion[i][0];
//     const value = suggestion[i][2];
//     newItem[key] = value;
//   }
//   selectedSuggestion.value = null;
// }
// function resetNewItem() {
//   props.columns.forEach((col) => {
//     if (!col.name || col.noSave) return;
//     col.default !== null && col.default !== undefined
//       ? (newItem[col.key] = col.default)
//       : (newItem[col.key] = "");
//   });
// }

// const selectedSuggestion = ref(null);
// const allRows = inject(props.allRows || props.rows);
// const _dev_suggestionItems = computed(() => {
//   if (!newItem.name) return null;
//   //Filter all rows that resemble new item input
//   const allSuggestions = allRows.value.filter((row) => {
//     let match = false;
//     for (let key in row) {
//       if (row.name.toLowerCase().startsWith(newItem.name.toLowerCase())) {
//         match = true;
//         break;
//       }
//     }
//     return match;
//   });

//   if (allSuggestions.length === 0) return null;
//   //Remove duplicates
//   const uniqueSuggestions = allSuggestions.filter(
//     (item, index, self) =>
//       index === self.findIndex((t) => t.name === item.name),
//   );
//   //Return only the first several items
//   let suggestions = uniqueSuggestions.slice(0, MAX_SUGGESTION_ROW);

//   const columnKeys = columns.map((col) => col.key);
//   suggestions = suggestions.map((suggestion) => {
//     return (
//       Object.entries(suggestion)
//         .sort((a, b) => {
//           return columnKeys.indexOf(a[0]) - columnKeys.indexOf(b[0]);
//         })
//         // Create item containing key for classes, name and value for display
//         .map(([key, value]) => {
//           //Ignore columns that don't have a name
//           const name = columns.find((col) => col.key === key)?.name;
//           if (!name) return null;

//           //   columns.find((col) => col.key === key)?.attrs?.suggestion
//           // );
//           //Ignore columns that don't need suggestions
//           const isSuggestion = columns.find((col) => col.key === key)?.attrs
//             ?.suggestion;
//           if (isSuggestion === false) return null;
//           return [key, name, value];
//         })
//         .filter((value) => {
//           return value !== null;
//         })
//     );
//   });
//   const maxLengths = [];
//   for (let i = 0; i < suggestions[0].length; i++) {
//     maxLengths[i] = 0;
//     for (let n = 0; n < suggestions.length; n++) {
//       try {
//         suggestions[n][i][2].length > maxLengths[i]
//           ? (maxLengths[i] = suggestions[n][i][2].length)
//           : null;
//       } catch (e) {
//         console.error(e);
//       }
//     }
//   }
//   suggestions.forEach((suggestion) => {
//     for (let i = 0; i < suggestions[0].length; i++) {
//       suggestion[i] ? (suggestion[i][3] = maxLengths[i]) : null;
//     }
//   });

//   return suggestions;
// });
// watch(suggestionItems, () => {
//   selectedSuggestion.value = null;
// });
// let newRow = computed(() =>
//   h(
//     "tr",
//     {
//       class: "new-row",
//       id: "row-" + newItem.id,
//       onKeyup: (e) => {
//         if (e.key === "Enter") {
//           if (selectedSuggestion.value) {
//             importSuggestion(selectedSuggestion.value);
//             return;
//           }
//           createRow();
//         }
//       },
//     },
//     props.columns
//       .map((col) => {
//         switch (col.type) {
//           case "is-selected":
//             return h(
//               "td",
//               { class: "cell-select" },
//               h("img", {
//                 src: dir("assets/img/icon/add.png"),
//                 class: [
//                   "add-row",
//                   {
//                     hidden: !(
//                       states.selectedRows[0] || states.isShownSelection
//                     ),
//                   },
//                 ],
//                 onClick: (e) => {
//                   importSuggestion(selectedSuggestion.value);
//                 },
//                 onHover: (e) => {
//                   states.isShownSelection = true;
//                 },
//                 onBlur: (e) => {
//                   states.isShownSelection = false;
//                 },
//               }),
//             );
//           case "action":
//             return hTd(
//               "cell-action",
//               "button",
//               {
//                 class: "add-row",
//                 onClick: (e) => {
//                   createRow();
//                 },
//               },
//               "Create row",
//             );

//           case "input":
//             return hTd(
//               "cell" + col.key,
//               "input",
//               {
//                 type: col.attrs.type,
//                 class: col.key,
//                 value: newItem[col.key],
//                 required: col.attrs.required,
//                 disabled: col.disabled,
//                 onInput: (e) => {
//                   if (col.key === "duration")
//                     e.target.value = durationValidate(e.target.value);
//                   newItem[col.key] = e.target.value;
//                 },
//               },
//               col.attrs.placeholder,
//             );
//           case "input-name":
//             let autofill = "";
//             const suggestions = props.suggestions.value.map((m) => m.name);
//             watch(
//               () => newItem[col.key],
//               (input) => {
//                 if (!input) {
//                   autofill = "";
//                   return;
//                 }
//                 const match = suggestions.find((suggestion) =>
//                   suggestion.toLowerCase().startsWith(input.toLowerCase()),
//                 );
//                 match
//                   ? (autofill = match.slice(input.length))
//                   : (autofill = "");
//               },
//               { immediate: true },
//             );
//             return h("td", { class: ["cell" + col.key, "input-name"] }, [
//               h("input", {
//                 type: "text",
//                 class: col.key,
//                 value: newItem[col.key],
//                 required: col.attrs.required,
//                 disabled: col.disabled,
//                 onKeydown: (e) => {
//                   if (e.keyCode === 39) {
//                     newItem[col.key] = newItem[col.key] + autofill;
//                   }
//                   if (
//                     e.keyCode === 9 &&
//                     autofill &&
//                     newItem[col.key] !== autofill
//                   ) {
//                     newItem[col.key] = newItem[col.key] + autofill;
//                   }
//                 },
//                 onInput: (e) => {
//                   newItem[col.key] = e.target.value;
//                   states.isShownSuggestions = true;
//                 },
//                 onFocus: (e) => {
//                   e.target.setSelectionRange(
//                     e.target.value.length,
//                     e.target.value.length,
//                   );
//                 },
//                 onBlur: (e) => {
//                   setTimeout(() => {
//                     states.isShownSuggestions = false;
//                   }, 120);
//                 },
//               }),
//               h("div", { class: "suggestion" }, [
//                 h("em", newItem[col.key]),
//                 autofill,
//               ]),
//             ]);
//         }
//         return renderElement(col, newItem, true);
//       })
//       .concat(
//         h("td", { class: "cell-action" }, [
//           h("img", {
//             // TODO: Update src logic
//             src: "https://management-img.s3.ap-southeast-1.amazonaws.com/minus.png",
//             title: "Reset new row",
//             class: "action-reset-new-row cursor-pointer",
//             onClick: (e) => {
//               resetNewItem();
//             },
//           }),
//         ]),
//       ),
//   ),
// );
// </DEV>
</script>
<style></style>
