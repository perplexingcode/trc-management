<template>
  <div
    @mouseenter="states.showDetail = true"
    @mouseleave="states.showDetail = false"
    class="note-default flex flex-col h-fit"
  >
    <div class="note-content__wrapper w-full">
      <div class="note-main rounded">
        <NoteCompHeader :note-id="note.id" />
        <textarea
          onfocus='this.style.height = "";this.style.height = this.scrollHeight + "px"'
          v-model="note.text"
          class="w-full max-h-80 overflow-y-scroll min-h-5"
          :class="{ isEditing: states.isEditing }"
          @input="states.isEditing = true"
          @keydown="handleKeydown($event)"
          @blur="events.applyChange = !events.applyChange"
        />
      </div>
      <NoteCompDetail v-show="states.showDetail" :note-id="note.id" />
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  noteId: {
    type: String,
    required: true,
  },
});

const note = inject('note-' + props.noteId);
const states = inject('states-' + props.noteId);
const events = inject('events-' + props.noteId);

const handleKeydown = (e) => {
  if (e.shiftKey && e.keyCode === 13) {
    e.preventDefault();
    events.applyChange = !events.applyChange;
  }
};
</script>
<style></style>
