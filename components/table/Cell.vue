<template>
  <cell
    v-if="props.item?.state"
    :key="key"
    :class="props.element?.attrs?.class || ''"
    @click="handleClick"
    ref="activeCell"
  />
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

const emit = defineEmits([
  'editRow',
  'upsertRow',
  'deleteRow',
  'copyId',
  'turnOn',
  'turnOff',
]);

const states = inject('states-' + props.tableId);
const config = inject('config-' + props.tableId);
const events = inject('events-' + props.tableId);

const activeCell = ref(null);

function handleClick() {
  states.activeCell = activeCell.value;
}

let cell = computed(() => {
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
      if (isNewRow)
        return h('td', {
          class: ['cell-' + element.key + ' cell-' + element.type],
        });
      return h(
        'td',
        {
          class: ['cell-' + element.key + ' cell-' + element.type, 'h-3 px-1'],
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
      return hTd(
        'cell-' +
          element.key +
          ' cell-' +
          element.type +
          (element?.hidden ? ' hidden' : ''),
        'input',
        {
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
            if (e.target.classList.contains('active')) return;
            states.activeCell = e.target.parentElement;
            e.target.classList.add('active');
            if (element.attrs.type == 'number') return;
            e.target.setSelectionRange(
              e.target.value.length,
              e.target.value.length,
            );
          },
          onBlur(e) {
            e.target.classList.remove('active');
            states.activeCell = null;
          },
        },
      );
    case 'input-name':
      const innerText = item[element.key] ? item[element.key] : element.default;
      return hTd('cell-' + element.key + ' cell-' + element.type, 'input', {
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
          if (e.target.classList.contains('active')) return;
          e.target.removeAttribute('disabled');
          e.target.focus();
        },
        onFocus: (e) => {
          if (e.target.classList.contains('active')) return;
          e.target.classList.add('active');
          e.target.setSelectionRange(
            e.target.value.length,
            e.target.value.length,
          );
        },
        onBlur: (e) => {
          e.target.classList.remove('active');
          if (!isNewRow) e.target.setAttribute('disabled', '');
        },
      });
    case 'tags':
      return hTd(
        'cell-' +
          element.key +
          ' cell-' +
          element.type +
          (element?.hidden ? ' hidden' : ''),
        'div',
        {
          class: 'flex',
        },
        [
          h(),
          h('input', {
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
              if (e.target.classList.contains('active')) return;
              states.activeCell = e.target.parentElement;
              e.target.classList.add('active');
              if (element.attrs.type == 'number') return;
              e.target.setSelectionRange(
                e.target.value.length,
                e.target.value.length,
              );
            },
            onBlur(e) {
              e.target.classList.remove('active');
              states.activeCell = null;
            },
          }),
        ],
      );
    case 'text-area':
      return hTd('cell-' + element.key + ' cell-' + element.type, 'textarea', {
        value: item[element.key] ? item[element.key] : element.default,
        class: element.key,
        disabled:
          element.disabled ||
          (!(item.state.isBeingEdited && states.isEditing) && !isNewRow),
        onInput: (e) => {
          item[element.key] = e.target.value;
        },
        onFocus: (e) => {
          if (e.target.classList.contains('active')) return;
          e.target.classList.add('active');
          e.target.style.height = '';
          e.target.style.height = e.target.scrollHeight + 'px';
          e.target.setSelectionRange(
            e.target.value.length,
            e.target.value.length,
          );
        },
        onBlur: (e) => {
          e.target.classList.remove('active');
          e.target.style.height = '';
        },
      });
    case 'boolean':
      // use an image to represent boolean, onclick to toggle
      return hTd(
        'cell-' + element.key + ' cell-' + element.type,
        // add a div
        h(
          'div',
          {
            class:
              'btn outline w-5 h-5 rounded-md p-1 m-auto cursor-pointer' +
              (item[element.key] ? ' bg-accent' : ' bg-slate-100'),
          },
          h('img', {
            src: item[element.key]
              ? 'https://trc-management.s3.ap-southeast-1.amazonaws.com/assets/img/svg/plus.svg'
              : 'https://trc-management.s3.ap-southeast-1.amazonaws.com/assets/img/svg/minus.svg',
            title: 'Click to toggle',
            class: ['action'],
            onClick: async (e) => {
              await nextTick();
              item[element.key] = !item[element.key];
              if (isNewRow) return;
              // If changing to true, add a "true" event
              item[element.key]
                ? (events[element.key] = { value: true, item })
                : (events[element.key] = { value: false, item });
              //upsert to the other table and delete row
              const isTransferTable =
                element?.transferTable &&
                item[element.key] == element.transferTable.triggerOn;
              console.log(
                isTransferTable,
                element?.transferTable,
                item[element.key] == element.transferTable.triggerOn,
              );
              if (!isTransferTable) return;
              emit('upsertRow', {
                id: item.id,
                table: element.transferTable.dbTable,
              });
              emit('deleteRow', item.id);
            },
          }),
        ),
      );

    case 'select':
      return hTd(
        'cell-' +
          element.key +
          ' cell-' +
          element.type +
          (element?.hidden ? ' hidden' : ''),
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
        ['-', ...element.options].map((option) => {
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
      return hTd('cell-' + element.key + ' cell-' + element.type, 'input', {
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
      return h('td', { class: 'cell ' + element.key }, item[element.key]);
    default:
      return h('td', { class: 'cell', title: 'Invalid cell type' }, 'Error');
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
