<template>
  <input v-model="chat" />
  <h3>Render function</h3>
  <customInput />
</template>
<script setup>
let chat = inject('danchoi');
const customInput = withDirectives(
  h('input', {
    value: chat.value,
    onInput: (e) => {
      chat.value = e.target.value;
    },
  }),
  [[chat]]
);
</script>
<style></style>
