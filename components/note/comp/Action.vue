<template>
  <div
    class="header__action cursor-pointer bg-slate-200 border-2 border-gray-300 select-none"
  >
    <span
      class="btn btn-cicle flex items-center justify-center text-white bg-primary rounded-full w-6 h-6 ml-auto"
      :title="states.noteInfo"
      >i</span
    >
    <img
      class="action delete note h-6 w-6 rounded-full"
      @click.stop="events.deleteNote = !events.deleteNote"
      title="Delete note"
      src="https://management-img.s3.ap-southeast-1.amazonaws.com/minus.png"
    />
    <span class="fixed top-3 left-1/2">{{ props.noteId }}</span>
  </div>
</template>
<script setup>
const props = defineProps({
  noteId: {
    type: String,
    required: true,
  },
});
const states = inject('states-' + props.noteId);
const events = inject('events-' + props.noteId);
</script>
<style></style>
