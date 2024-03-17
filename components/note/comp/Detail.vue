<template>
  <div class="note-detail">
    <BtnShowHide
      class="m-auto btn-circle h-6 w-6"
      @click="state.showMore = !state.showMore"
      :is-default-show="false"
    />
    <div v-show="state.showMore">
      <div class="note-action flex items-center justify-center gap-1">
        <button @click="changeNoteName">Rename</button>
        <button v-if="!note.title" @click="state.showEditTitle = true">
          Add title
        </button>
        <span
          class="btn btn-cicle flex items-center justify-center text-white bg-primary rounded-full w-6 h-6"
          :title="state.noteInfo"
          >i</span
        >
        <img
          class="btn action delete note h-6 w-6 rounded-full"
          @click="events.deleteNote = !events.deleteNote"
          title="Delete note"
          src="https://management-img.s3.ap-southeast-1.amazonaws.com/minus.png"
        />
      </div>
      <div class="flex justify-between">
        <button
          v-show="state.showMore"
          @click="
            showOldNote();
            state.viewVersion == 0 || state.viewVersion--;
          "
          class="rounded-full w-8 h-8"
        >
          &lt;
        </button>

        <button
          v-show="state.showMore"
          @click="
            showOldNote();
            state.viewVersion == note.versionHistory.stack.length - 1 ||
              state.viewVersion++;
          "
          class="rounded-full w-8 h-8"
        >
          &gt;
        </button>
      </div>
      <div v-show="state.showMore" class="flex p-2 items-center">
        <div
          v-for="(item, index) in note.versionHistory.stack"
          :key="item.id"
          class="w-4 h-4 bg-gray-500"
          :class="{
            'bg-yellow-500': index == state.viewVersion,
            'mr-2': index != note.versionHistory.stack.length - 1,
          }"
        ></div>
      </div>
      <textarea
        ref="oldNote"
        v-show="state.showMore"
        class="w-full"
        :value="note.versionHistory.stack[state.viewVersion]?.text"
        disabled
      />
      <p
        v-show="
          state.showMore &&
          note.versionHistory.stack[state.viewVersion]?.timestamp
        "
        class="text-xs text-center"
      >
        {{ note.versionHistory.stack[state.viewVersion]?.timestamp }}
      </p>
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
const state = inject('state-' + props.noteId);
const events = inject('events-' + props.noteId);

const oldNote = ref(null);
const showOldNote = async () => {
  await nextTick();
  oldNote.value.style.height = 'auto';
  oldNote.value.style.height = oldNote.value.scrollHeight + 'px';
  oldNote.value.style.maxHeight = '20rem';
  oldNote.value.style.overflowY = 'scroll';
};

const noteInfo = computed(
  () =>
    `Title: ${note.title}\nBox: ${note.box}\nName: ${note.name}\nText: ${note.text}\nLast updated: ${note.lastUpdated}`,
);
</script>
<style></style>
