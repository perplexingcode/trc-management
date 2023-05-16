<template></template>
<script setup>
const inputAuto = h('div', { class: 'input-auto' }, [
  h('input', {
    type: 'text',
    vModel: input,
    onKeydown: (e) => {
      if (e.key === 'Enter') {
        acceptSuggestion();
      }
    },
  }),
  h('div', { class: 'suggestions' }, [
    h('div', { class: 'suggestion' }, complete),
  ]),
]);
</script>
<style></style>
