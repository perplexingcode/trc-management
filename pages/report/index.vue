<template>
  <div class="text-center atomic m-auto">
    <select @change="changeMode">
      {{
        GROUP[index]
      }}
      <option v-for="(item, i) in GROUP" :key="i" :value="item">
        {{ item }}
      </option>
    </select>
  </div>
  <EffectRerender ref="report">
    <ReportMonth :group="GROUP[index]" />
    <ReportQuarter :group="GROUP[index]" />
  </EffectRerender>
</template>
<script setup>
const index = ref(0);
const GROUP = ["Personal", "All", "MFVN", "Freelance"];
const report = ref(null);
function changeMode() {
  index.value = (index.value + 1) % GROUP.length;
  report.value.rerender();
}
</script>
<style></style>
