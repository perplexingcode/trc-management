<template>
  <div class="note-group border-2 border-gray=300 w-fit p-3 rounded-md">
    <div v-if="box">
      <div class="note-group__head">
        <h3 class="text-center font-bold text-xl">{{ props.groupName }}</h3>
        <p class="text-center">{{ props.groupDes }}</p>
      </div>
      <div class="note-group__body flex">
        <Note :box="box" :name="props.name" class="w-[300px] mr-3" />
        <NoteCluster :box="box" :row="row" :col="col" :type="props.type" />
      </div>
    </div>
    <div v-else>
      <h3>Error: No note box or note name is provided</h3>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  box: {
    type: String,
  },
  name: {
    type: String,
  },
  row: {
    type: Number,
  },
  col: {
    type: Number,
  },
  type: {
    type: String,
    default: 'atomic',
  },
  groupName: {
    type: String,
    default: '',
  },
  groupDes: {
    type: String,
    default: '',
  },
});

// We can use either box or name to get the cluster
const box = props.box || (props.name && props.name + '-cluster');

let row, col;
if (props.type == 'row') {
  row = 0;
  col = 1;
}
</script>
<style>
.note-group textarea {
  min-height: 150px;
}
</style>
