<template>
  <div class="gen-id flex items-center relative">
    <div v-show="copied" class="z-[999999]">
      <span
        v-if="!icon"
        class="mini-card w-[9rem] text-center text-xs absolute top-[-2.5rem]"
        >{{ id }}</span
      >
      <p
        v-show="copied"
        class="mini-card absolute top-1 right-[-3.8rem] text-xs"
      >
        Copied!
      </p>
    </div>
    <img
      v-if="icon"
      class="cursor-pointer min-w-[1.5rem] min-h-[1.5rem]"
      src="https://img.icons8.com/material-two-tone/24/copy--v1.png"
      :title="
        props.value
          ? 'Click to copy: ' + props.value
          : 'No ID found. Click to copy a new UUID'
      "
      @click="getId"
    />
    <button v-if="!icon" class="w-fit" @click="getId">Get UUID</button>
  </div>
</template>

<script setup>
import { v4 } from 'uuid';
const id = ref(null);
const copied = ref(false);

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  icon: {
    type: Boolean,
    default: true,
  },
  item: {
    type: Object,
  },
});

function getId() {
  id.value = props.value;
  if (props.value == '') {
    id.value = v4();
    if (props.item) props.item.id = id.value;
  }
  copied.value = true;
  setTimeout(() => (copied.value = false), 1600);
  navigator.clipboard.writeText(id.value);
}
</script>

<style scoped>
.mini-card {
  @apply bg-gray-50 border-gray-200 border rounded p-1;
}
</style>
