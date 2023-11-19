<template>
  <div class="note-atom" v-if="note?.id">
    <BtnShowHide
      ref="showHideBtn"
      @keydown.delete.prevent="handleEventShowHideBtn"
      @click="handleEventShowHideBtn"
      :is-default-show="false"
      class="h-6 w-6 flex items-center justify-center border border-gray-300 rounded-none p-0"
      :title="'<' + (note.title || 'Untitled') + '>\n' + note.text"
      tabindex="0"
    />
    <div
      v-show="states.showNote"
      class="note-content flex flex-col fixed top-0 left-0 w-screen h-screen"
    >
      <div class="note-content__wrapper w-96 m-auto z-10">
        <div class="note-main rounded">
          <NoteCompHeader :note-id="note.id" />
          <textarea
            onfocus='this.style.height = "";this.style.height = this.scrollHeight + "px"'
            v-model="note.text"
            :class="{ isEditing: states.isEditing }"
            @input="states.isEditing = true"
            @keydown="handleKeydown"
            @blur="events.applyChange = !events.applyChange"
          />
        </div>
        <div class="note-detail" v-if="props.showDetail">
          <BtnShowHide
            class="m-auto btn-circle h-6 w-6"
            @click="states.showMore = !states.showMore"
            :is-default-show="false"
          />
          <NoteCompDetail :note-id="note.id" />
        </div>
      </div>
      <div @click="showHideBtn.$el.click()">
        <div
          v-show="states.showNote"
          class="fixed top-0 left-0 w-screen h-screen bg-gray-100 bg-opacity-90"
        ></div>
      </div>
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
const showHideBtn = ref(null);
const handleEventShowHideBtn = (e) => {
  if (e.key === 'Delete') {
    events.deleteNote = !events.deleteNote;
    return;
  }
  states.showNote = !states.showNote;
};
const handleKeydown = (e) => {
  if (e.shiftKey && e.keyCode === 13) {
    e.preventDefault();
    events.applyChange = !events.applyChange;
  }
};
</script>
<style></style>
