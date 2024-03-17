<template>
  <cell
    v-if="props.item?.state && !props.component"
    :key="key"
    :class="props.element?.attrs?.class || ''"
    @click="handleClick"
    ref="activeCell"
  />
</template>
<script setup>
import CellBooleanAction from '~~/components/table/cell/BooleanAction.vue';
import CellInput from '~~/components/table/cell/Input.vue';
import CellInputName from '~~/components/table/cell/InputName.vue';
import CellSelect from '~~/components/table/cell/Select.vue';
import SvgChecked from '~~/components/table/svg/Checked.vue';
import SvgUnchecked from '~~/components/table/svg/Unchecked.vue';
import SvgDelete from '~~/components/table/svg/Delete.vue';
import { deepClone } from '~~/static/utils';
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
  component: {
    type: Boolean,
    default: false,
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

const state = inject('state-' + props.tableId);
const config = inject('config-' + props.tableId);
const events = inject('events-' + props.tableId);

const activeCell = ref(null);

function handleClick() {
  state.activeCell = activeCell.value;
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
            state.showSelection = true;
          },
          onMouseout: (e) => {
            if (config.showSelection) return;
            state.showSelection = false;
          },
        },
        h('input', {
          type: 'checkbox',
          class: [
            element.key,
            config.showSelection,
            {
              hidden: !(config.showSelection || state.showSelection),
            },
          ],
          checked: item.state.isSelected,
          onClick: (e) => {
            item.state.isSelected = e.target.checked;
          },
        }),
      );
    case 'input':
      return h(CellInput, {
        item,
        element,
        isNewRow,
        state,
      });
    case 'input-name':
      return h(CellInputName, {
        item,
        element,
        isNewRow,
        state,
      });
    case 'textarea':
      return hTd(
        'cell-' + element.key + ' cell-' + element.type + ' ' + element.class,
        'textarea',
        {
          value: (() => {
            if (Array.isArray(item[element.key])) {
              return item[element.key].join('\n');
            } else
              return item[element.key] ? item[element.key] : element.default;
          })(),
          class: [
            element.key + (item[element.key] === '' ? ' empty' : ''),
            {
              disabled:
                !(item.state.isBeingEdited && state.isEditing) && !isNewRow,
            },
          ],
          disabled: element.disabled,
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
        },
      );
    case 'boolean': {
      // use an image to represent boolean, onclick to toggle
      const showTitle = ref(false);
      return () =>
        h(
          'td',
          {
            class:
              'cell-' +
              element.key +
              ' cell-' +
              element.type +
              ' ' +
              element.class +
              ' relative',
            // add a div
            onMouseenter: (e) => {
              showTitle.value = true;
            },
            onMouseleave: (e) => {
              showTitle.value = false;
            },
          },
          [
            h(
              'div',
              {
                class: 'btn w-6 h-6 rounded-md m-auto cursor-pointer',
              },
              // conditional rendering
              h(
                'div',
                {
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
                    if (!isTransferTable && item[element.key]) {
                      //Update row
                      element.action(item);
                      return;
                    }
                    emit('upsertRow', {
                      id: item.id,
                      table: element.transferTable.dbTable,
                    });
                    emit('deleteRow', item.id);
                  },
                },
                item[element.key] ? h(SvgChecked) : h(SvgUnchecked),
              ),
            ),
            showTitle.value
              ? h(
                  'div',
                  {
                    class:
                      'absolute top-[-0.25rem] px-2 bg-gray-100 border border-gray-500 rounded-md',
                  },
                  h(
                    'p',
                    {
                      class:
                        'mx-auto text-xs text-gray-700 w-fit whitespace-nowrap',
                    },
                    element.name,
                  ),
                )
              : null,
            ,
          ],
        );
    }
    case 'boolean-action':
      const showTitle = ref(false);
      // use an image to represent boolean, onclick to toggle
      return h(
        'td',
        {
          class:
            'cell-' +
            element.key +
            ' cell-' +
            element.type +
            ' ' +
            element.class,
          onMouseenter: (e) => {
            showTitle.value = true;
          },
          onMouseleave: (e) => {
            showTitle.value = false;
          },
          showTitle,
        },
        // add a div
        h(CellBooleanAction, {
          item,
          element,
          isNewRow,
        }),
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
            (!(item.state.isBeingEdited && state.isEditing) && !isNewRow),
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
    case 'select2':
      return h(CellSelect, {
        item,
        element,
        isNewRow,
        state,
      });
    case 'checkbox':
      return hTd('cell-' + element.key + ' cell-' + element.type, 'input', {
        type: 'checkbox',
        class: [
          element.key,
          {
            disabled:
              !(item.state.isBeingEdited && state.isEditing) && !isNewRow,
          },
        ],
        checked:
          typeof item[element.key] == 'boolean'
            ? item[element.key]
            : element.default,
        readonly: element.disabled,
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
            h(
              'div',
              {
                title: 'Double click to delete row',
                class: [
                  'btn action delete cursor-pointer w-6 h-6',
                  { 'd-none': !config.action.includes('delete') },
                ],
                onDblclick: (e) => {
                  emit('deleteRow', item.id);
                  e.stopPropagation();
                  e.preventDefault();
                },
              },
              h(SvgDelete),
            ),
          ],
        ),
      );
    case 'p':
      return h(
        'td',
        { class: 'cell cell-' + element.key },
        h('p', item[element.key]),
      );
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
