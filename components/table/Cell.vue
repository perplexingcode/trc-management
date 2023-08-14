<template>
  <cell :key="key" :class="props.element?.attrs?.class || ''" />
</template>
<script setup>
import GetId from '~~/components/GetId.vue';
import { durationValidate } from '~~/static/time';
// >>>----------------------------------------------------------------------------------<<<
// << DEV: TODO
const props = defineProps({
  isNewCell: {
    type: Boolean,
    default: false,
  },
  element: {
    type: Object,
    required: true,
  },
  item: {
    type: Object,
    required: true,
  },
  tableId: {
    type: String,
    required: true,
  },
  event: {
    type: Object,
    required: false,
  },
});
const key = ref(0);

const emit = defineEmits(['editRow', 'upsertRow', 'deleteRow', 'copyId']);

const states = inject('states-' + props.tableId);
const config = inject('config-' + props.tableId);

let cell = computed(() => {
  if (!props.item?.state) return;
  return renderElement(props.element, props.item, props.isNewCell);
});

onMounted(async () => {
  if (!props.isNewCell) return;
  await nextTick();
  watch(
    () => props.event.isReset,
    () => {
      key.value++;
    },
  );
});

function hTd(hClass, ...args) {
  return h('td', { class: ['cell', hClass] }, h(...args));
}
function renderElement(element, item, isNewRow) {
  switch (element.type) {
    case 'is-selected':
      if (isNewRow) return h('td', { class: ['cell-' + element.key] });
      return h(
        'td',
        {
          class: ['cell-' + element.key, 'h-3 px-1'],
          onMouseover: (e) => {
            states.showSelection = true;
          },
          onMouseout: (e) => {
            states.showSelection = false;
          },
        },
        h('input', {
          type: 'checkbox',
          class: [
            element.key,
            {
              hidden: !states.showSelection,
            },
          ],
          checked: item.state.isSelected,
          onClick: (e) => {
            item.state.isSelected = e.target.checked;
          },
        }),
      );
    case 'input':
      return hTd('cell-' + element.key, 'input', {
        type: element.attrs.type,
        class: element.key,
        value: item[element.key] ? item[element.key] : element.default,
        required: element.attrs.required,
        disabled:
          element.disabled ||
          (!(item.state.isBeingEdited && states.isEditing) && !isNewRow),
        onInput: (e) => {
          if (element.key == 'duration') {
            e.target.value = durationValidate(e.target.value);
          }
          item[element.key] = e.target.value;
        },
        onFocus: (e) => {
          e.target.setSelectionRange(
            e.target.value.length,
            e.target.value.length,
          );
        },
      });
    case 'input-name':
      const innerText = item[element.key] ? item[element.key] : element.default;
      return hTd('cell-' + element.key, 'input', {
        type: 'text',
        class: element.key,
        value: innerText,
        required: element.attrs.required,
        title: innerText?.length > 20 ? innerText : null,
        disabled:
          element.disabled ||
          (!(item.state.isBeingEdited && states.isEditing) && !isNewRow),
        onInput: (e) => {
          item[element.key] = e.target.value;
        },
        // onKeydown(e) {

        //   if (nonTextKeys.includes(e.keyCode)) {
        //     editRow(
        //       rows.value.findIndex((i) => (i.id = item.id)),
        //       rows,
        //       e
        //     );
        //     e.target.focus();
        //   }
        // },
        onClick: (e) => {
          e.target.removeAttribute('disabled');
          e.target.focus();
          e.target.setSelectionRange(
            e.target.value.length,
            e.target.value.length,
          );
        },
        onFocus: (e) => {
          e.target.setSelectionRange(
            e.target.value.length,
            e.target.value.length,
          );
        },
      });
    case 'text-area':
      return hTd('cell-' + element.key, 'textarea', {
        value: item[element.key] ? item[element.key] : element.default,
        class: element.key,
        disabled:
          element.disabled ||
          (!(item.state.isBeingEdited && states.isEditing) && !isNewRow),
        onInput: (e) => {
          item[element.key] = e.target.value;
        },
        onFocus: (e) => {
          e.target.setSelectionRange(
            e.target.value.length,
            e.target.value.length,
          );
        },
      });
    case 'select':
      return hTd(
        'cell-' + element.key,
        'select',
        {
          class: element.key,
          disabled:
            element.disabled ||
            (!(item.state.isBeingEdited && states.isEditing) && !isNewRow),
          onInput: (e) => {
            item[element.key] = e.target.value;
          },
        },
        ['', ...element.options].map((option) => {
          return h(
            'option',
            {
              value: option?.value || option,
              selected:
                option === item[element.key] || option === element.default,
              disabled: option === '',
            },
            option?.name || option,
          );
        }),
      );
    case 'checkbox':
      return hTd('cell-' + element.key, 'input', {
        type: 'checkbox',
        class: element.key,
        checked:
          typeof item[element.key] == 'boolean'
            ? item[element.key]
            : element.default,
        readonly:
          element.disabled ||
          (!(item.state.isBeingEdited && states.isEditing) && !isNewRow),
        onClick: (e) => {
          if (e.target.readOnly) {
            e.target.checked = !e.target.checked;
            return;
          }
          item[element.key] = e.target.checked;
        },
      });
    case 'row-action':
      return h(
        'td',
        {
          class: 'cell-action flex',
        },
        h(
          'div',
          {
            class: 'flex',
          },
          [
            h(GetId, {
              isImg: true,
              class: { 'd-none': !config.action.includes('copyId') },
              value: item.id,
            }),
            h('img', {
              // TODO: Update src logic
              src: 'https://management-img.s3.ap-southeast-1.amazonaws.com/minus.png',
              title: 'Double click to delete row',
              class: [
                'btn action delete cursor-pointer',
                { 'd-none': !config.action.includes('delete') },
              ],
              onDblclick: (e) => {
                emit('deleteRow', item.id);
                e.stopPropagation();
                e.preventDefault();
              },
            }),
          ],
        ),
      );
    case 'p':
      return h('td', { class: element.key }, item[element.key]);
    default:
      return h('td', 'Error');
  }
}
// TODO DEV >>
// >>>----------------------------------------------------------------------------------<<<
/*<< DEV:






DEV >>*/
</script>
<style>
.inputhidden input {
  display: none;
}
</style>
