<template>
  <JsonViewer :value="props.data" />
</template>
<script setup>
import { JsonViewer } from 'vue3-json-viewer';
import 'vue3-json-viewer/dist/index.css';

const props = defineProps(['data']);
</script>
<style></style>
