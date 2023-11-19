<template>
  <div class="note-header flex">
    <div class="header__title w-full">
      <div>
        <h3
          class="cursor-text w-fit"
          @click.stop
          v-show="!states.showEditTitle"
          @dblclick="!props.noEditTitle && (states.showEditTitle = true)"
        >
          {{ note.title }}
        </h3>
      </div>
      <input
        @click.stop
        v-show="states.showEditTitle"
        v-model="states.newTitle"
        @keydown.enter="updateTitle"
        @keydown.tab="updateTitle"
        @blur="updateTitle"
        @keydown.esc="states.showEditTitle = false"
      />
    </div>
    <div
      v-if="props.showAction"
      class="header__action w-fit min-w-[3.5rem] ml-auto cursor-pointer"
      @mouseenter="states.showAction = true"
      @mouseleave="states.showAction = false"
    >
      <div v-show="states.showAction || props.showAction" class="flex ml-auto">
        <span
          class="btn btn-cicle flex items-center justify-center text-white bg-primary rounded-full w-6 h-6 ml-auto"
          :title="states.noteInfo"
          >i</span
        >
        <img
          class="action delete note h-6 w-6 rounded-full"
          @click="events.deleteNote = !events.deleteNote"
          title="Delete note"
          src="https://management-img.s3.ap-southeast-1.amazonaws.com/minus.png"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { upsert } from '~~/static/db';
const props = defineProps({
  noteId: {
    type: String,
    required: true,
  },
  showAction: {
    type: Boolean,
    default: false,
  },
  noEditTitle: {
    type: Boolean,
    default: false,
  },
});

const note = inject('note-' + props.noteId);
const states = inject('states-' + props.noteId);
const events = inject('events-' + props.noteId);

watch(
  () => states.showEditTitle,
  () => {
    if (states.showEditTitle) {
      states.newTitle = note.title;
      nextTick(() => {
        const input = document.querySelector('#t' + props.noteId + ' input');
        input.focus();
      });
    }
  },
);

function updateTitle() {
  states.showEditTitle = false;
  if (states.newTitle === note.title) return;
  note.title = states.newTitle;
  upsert('note', note);
}
</script>
<style></style>
