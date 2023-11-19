<template>
  <div class="new-note" :class="props.type" @click="emit('createNote')">
    <div v-if="props.type == 'atomic'">
      <button class="btn-circle h-6 w-6">
        <SvgPlus class="h-3 w-3" />
      </button>
    </div>
    <div v-if="props.type == 'row'">
      <div class="bg-gray-200 rounded-md m-1 cursor-pointer">
        <div
          class="row-head flex items-center w-[20rem] min-h-[1rem] border-2 border-gray-300 hover:border-gray-400 rounded-md p-[0.35rem]"
        >
          <div class="w-6 h-6 bg-accent btn-circle mx-auto">
            <SvgPlus class="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  box: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    default: 'atomic',
  },
});

const emit = defineEmits(['createNote']);
</script>
<style></style>
