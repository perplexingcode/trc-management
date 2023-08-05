<template>
  <div class="dev gap-1 bg-white p-1">
    <h3 :class="`text-${props.titleSize || 'xl'}`">{{ props.title }}</h3>
    <JsonViewer :value="props.data" />
  </div>
</template>
<script setup>
import { JsonViewer } from "vue3-json-viewer";
import "vue3-json-viewer/dist/index.css";

const props = defineProps(["data", "title", "titleSize"]);
</script>
<style>
.jv-code {
  padding: 15px 10px !important;
}
</style>
