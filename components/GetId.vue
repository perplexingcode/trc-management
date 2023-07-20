<template>
  <div class="gen-id flex items-center relative">
    <div v-show="copied">
      <span
        v-if="!isImg"
        class="mini-card w-[9rem] text-center text-xs absolute top-[-2.5rem]"
        >{{ id }}</span
      >
      <p v-show="copied" class="mini-card absolute right-[-3.5rem] text-xs">
        Copied!
      </p>
    </div>
    <img
      v-if="isImg"
      class="cursor-pointer"
      src="https://img.icons8.com/material-two-tone/24/copy--v1.png"
      title="Copy item id"
      @click="getId"
    />
    <button v-if="!isImg" class="w-fit" @click="getId">Get UUID</button>
  </div>
</template>

<script setup>
import { v4 } from "uuid";
const id = ref(null);
const copied = ref(false);

const props = defineProps({
  value: {
    type: String,
    default: "",
  },
  isImg: {
    type: Boolean,
    default: false,
  },
});

function getId() {
  id.value = props.value;
  if (props.value) return;
  id.value = v4();
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
