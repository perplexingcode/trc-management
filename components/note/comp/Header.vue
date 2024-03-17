<template>
  <div class="note-header flex">
    <div class="header__title w-full">
      <div>
        <h3
          class="cursor-text w-fit"
          @click.stop
          v-show="!state.showEditTitle"
          @dblclick="!props.noEditTitle && (state.showEditTitle = true)"
        >
          {{ note.title }}
        </h3>
      </div>
      <input
        @click.stop
        v-show="state.showEditTitle"
        v-model="state.newTitle"
        @keydown.enter="updateTitle"
        @keydown.tab="updateTitle"
        @blur="updateTitle"
        @keydown.esc="state.showEditTitle = false"
      />
    </div>
    <div
      v-if="props.showAction"
      class="header__action w-fit min-w-[3.5rem] ml-auto cursor-pointer"
      @mouseenter="state.showAction = true"
      @mouseleave="state.showAction = false"
    >
      <div v-show="state.showAction || props.showAction" class="flex ml-auto">
        <span
          class="btn btn-cicle flex items-center justify-center text-white bg-primary rounded-full w-6 h-6 ml-auto"
          :title="state.noteInfo"
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
const state = inject('state-' + props.noteId);
const events = inject('events-' + props.noteId);

watch(
  () => state.showEditTitle,
  () => {
    if (state.showEditTitle) {
      state.newTitle = note.title;
      nextTick(() => {
        const input = document.querySelector('#t' + props.noteId + ' input');
        input.focus();
      });
    }
  },
);

function updateTitle() {
  state.showEditTitle = false;
  if (state.newTitle === note.title) return;
  note.title = state.newTitle;
  upsert('note', note);
}
</script>
<style></style>
