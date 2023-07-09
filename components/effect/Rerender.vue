<template>
  <div v-if="display">
    <slot></slot>
  </div>
</template>
<script setup>
const display = ref(true);
async function rerender() {
  display.value = !display.value;
  await nextTick();
  display.value = !display.value;
}

defineExpose({
  rerender,
});
</script>
<style></style>
