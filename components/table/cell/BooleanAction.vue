<template>
  <div
    @mouseenter="showTitle = true"
    @mouseleave="showTitle = false"
    class="relative btn w-6 h-6 rounded-md m-auto cursor-pointer"
    :class="accent"
  >
    <div class="action w-4 h-4" title="Click to toggle" @click="handleClick">
      <SvgChecked v-if="item[element.key]" />
      <SvgLoading v-else-if="item[element.key] === null" />
      <SvgUnchecked v-else />
    </div>
    <div
      v-show="showTitle"
      class="absolute top-[-1.5rem] left-[-1rem] px-2 bg-gray-100 border border-gray-500 rounded-md"
    >
      <p class="mx-auto text-xs pb-[2px] text-gray-700 w-fit whitespace-nowrap">
        {{ name }}
      </p>
    </div>
  </div>
</template>
<script setup>
const props = defineProps(['item', 'element', 'isNewRow', 'showTitle']);
const item = props.item;
const element = props.element;
const name = element.name;
const isNewRow = props.isNewRow;
const logs = inject('logs');

const accent = computed(() => {
  if (!element?.accent) return '';
  return element.accent(item) ? 'accent' : '';
});

async function handleClick() {
  await nextTick();
  if (isNewRow) return;
  const value = item[element.key];
  if (value && !element.action[1]) return;
  if (!value && !element.action[0]) return;
  item[element.key] = null;
  await nextTick();
  const success = await element.action[item[element.key] ? 1 : 0](item, logs);
  if (success) item[element.key] = !value;
  else item[element.key] = value;
}
</script>
<style>
.cell-boolean-action:has(.accent)::before {
  content: '';
  height: 6px;
  width: 100%;
  background-color: orange;
  position: absolute;
  bottom: 0;
  right: 0;
  display: block;
}
.cell-boolean-action:has(.accent) {
  position: relative;
}
</style>
