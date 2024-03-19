<template>
  <td ref="cell" class="cell relative" :class="className">
    <div
      v-show="disabled && !element.attrs.hideInput"
      class="absolute top-0 left-0 z-[20] flex items-center text-left w-full h-full pt-[2px] ps-[5px]"
      @click="handleClick"
    >
      <div
        class="cell-overlay relative bg-gray-100 border border-gray-300 rounded-md active:bg-gray-200 active:border-gray-400"
        :style="{
          width: size.width + 'px',
          height: size.height + 'px',
        }"
      >
        <div
          class="absolute z-50 top-1 left-2 text-[0.95rem] overflow-scroll whitespace-nowrap text-elipsis pe-3"
          :style="{
            width: size.width - 12 + 'px',
            height: size.height + 'px',
          }"
          :class="copiable ? 'flex' : ''"
        >
          <div
            v-if="
              element.key !== 'date' || element?.attrs?.friendlyDate == false
            "
            class=""
          >
            {{ item[element.key] ? item[element.key] : element.default }}
          </div>
          <div v-else>
            {{
              item[element.key]
                ? friendlyDate(item[element.key])
                : element.default
            }}
          </div>
          <div v-if="copiable" class="w-1 h-1 select-none"></div>
        </div>
      </div>
    </div>
    <div class="flex" :class="element.attrs.hideInput ? 'justify-center' : ''">
      <input
        v-if="!element.attrs.hideInput"
        ref="input"
        :type="element.attrs.type || 'text'"
        :class="element.key"
        :value="item[element.key] ? item[element.key] : element.default"
        :required="element.attrs.required"
        :disabled="disabled"
        @input="handleInput"
        @blur="handleBlur"
      />
      <TableGetId
        v-if="copiable"
        :value="item[element.valueKey ? element.valueKey : element.key]"
        :item="item"
        class="z-50 select-none"
        icon
      />
    </div>
  </td>
</template>

<script setup>
import { v4 } from 'uuid';
import { watchDebounced } from '@vueuse/core';
import { friendlyDate, durationValidate } from '../format';

const props = defineProps(['item', 'element', 'isNewRow', 'state']);
const emit = defineEmits(['upsertRow']);

const item = props.item;
const element = props.element;
const isNewRow = props.isNewRow;
const state = props.state;

const cellId = v4();

const cell = ref(null);
const input = ref(null);

const copiable = element.copiable;

const active = computed(() => {
  return state?.activeCell === cellId;
});

watch(active, (val) => {
  if (val) {
    cell.value.classList.add('active');
  } else {
    cell.value.classList.remove('active');
  }
});

// get width and height of input element
const size = computed(() => {
  if (!input.value) return {};
  return {
    width: input.value.offsetWidth,
    height: input.value.offsetHeight,
  };
});

const disabled = computed(() => {
  if (element.disabled) return true;
  if (isNewRow) return false;
  return !(item.state.isBeingEdited && state.isEditing);
});

const className =
  'cell-' +
  element.key +
  ' cell-' +
  element.type +
  ' ' +
  element.class +
  (element?.hidden ? ' hidden' : '');

const handleInput = (e) => {
  if (element.key === 'duration') {
    input.value.value = durationValidate(e.target.value);
  }
  // Update item's property and emit update to parent component
  item[element.key] = e.target.value;
  emit('upsertRow');
};

const handleClick = async (e) => {
  if (element.attrs.type === 'checkbox' && !disabled.value) {
    item[element.key] = !item[element.key];
  }
  if (state?.activeRow == item.id) {
    await enableInput();
    return;
  }

  state.activeCell = cellId;
  state.activeRow = item.id;
};

watchDebounced(
  () => item[element.key],
  // compare changes, upsert
  (oldValue, newValue) => {
    if (oldValue === newValue) return;
    emit('upsertRow');
  },
  { debounce: 500, maxWait: 1000 },
);

async function enableInput() {
  if (element.disabled) return;
  state.activeCell = cellId;
  state.activeRow = item.id;
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 10));
  input.value.focus();
  if (element.attrs.type !== 'number') {
    input.value.setSelectionRange(
      input.value.value.length,
      input.value.value.length,
    );
  }
}
</script>

<style scoped>
.active .cell-overlay {
  border-color: #ffdb00;
  background-color: #f9fafb;
}

/* hide scrollbar */
.cell-overlay *::-webkit-scrollbar {
  display: none;
}
.cell-overlay {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
