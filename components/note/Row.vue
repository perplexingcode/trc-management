<template>
  <div
    v-if="note"
    @click="handleClickRow"
    @mouseenter="showActionBtn = true"
    @mouseleave="showActionBtn = false"
    class="note-row relative w-fit bg-gray-200 rounded-md m-1 cursor-pointer"
    ref="wrapper"
  >
    <div
      class="row-head flex items-center w-[20rem] min-h-[1.5rem] border-2 border-gray-500 rounded-md p-[0.35rem] pl-2"
    >
      <NoteCompHeader :note-id="note.id" class="w-full" no-edit-title />
      <NoteCompAction
        v-show="showAction"
        :note-id="note.id"
        class="absolute -right-8 flex flex-col rounded-full"
      />
      <div class="w-fit ml-1">
        <BtnShowHide
          ref="showHideBtn"
          v-show="showActionBtn"
          @click.stop="showAction = !showAction"
          :is-default-show="false"
          :is-show="showAction"
          class="h-6 w-6 flex items-center justify-center border border-gray-300 rounded-full p-0 m-0"
          tabindex="0"
        />
      </div>
    </div>
    <div class="w-full flex">
      <textarea
        v-show="states.showNote"
        v-model="note.text"
        class="w-full min-h-[20rem] overflow-y-scroll"
        :class="{ isEditing: states.isEditing }"
        @input="states.isEditing = true"
        @keydown="handleKeydown($event)"
        @blur="events.applyChange = !events.applyChange"
      />
    </div>
  </div>
</template>
<script setup>
import { onClickOutside } from '@vueuse/core';
import { deepClone } from '~~/static/utils';

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
const showActionBtn = ref(false);
const showAction = ref(false);

watch(
  () => events.deleteNote,
  () => {
    showAction.value = false;
  },
);

const wrapper = ref(null);
onClickOutside(wrapper, () => {
  states.showNote = false;
  states.showEditTitle = false;
  showAction.value = false;
});

function handleClickRow() {
  if (!note.title && !states.showEditTitle) {
    states.showEditTitle = true;
    if (!states.showNote) return;
  }
  states.showNote = !states.showNote;
}

const handleKeydown = (e) => {
  if (e.shiftKey && e.keyCode === 13) {
    e.preventDefault();
    events.applyChange = !events.applyChange;
  }
};
</script>
<style>
h3 {
  color: black;
}
</style>
