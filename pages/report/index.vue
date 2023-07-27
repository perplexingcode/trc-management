<template>
  <div class="text-center atomic m-auto">
    <select @change="changeMode(e)">
      {{
        GROUP[index]
      }}
      <option v-for="(group, i) in GROUP" :key="group" :value="i">
        {{ group }}
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
function changeMode(e) {
  const selectedIndex = event.target.value;
  index.value = selectedIndex;
  report.value.rerender();
}
</script>
<style></style>
