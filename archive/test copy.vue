<template>
  <div id="container">
    <div id="complete">{{ complete }}</div>
    <input
      type="text"
      id="input"
      v-model="input"
      @keydown.tab="acceptSuggestion"
    />
  </div>
</template>
<script setup>
const suggestions = [
  'aaa',
  'aab',
  'aac',
  'aba',
  'abb',
  'abc',
  'aca',
  'acb',
  'acc',
  'baa',
  'bab',
  'bac',
  'bba',
  'bbb',
  'bbc',
  'bca',
  'bcb',
  'bcc',
  'caa',
  'cab',
  'cac',
  'cba',
  'cbb',
  'cbc',
  'cca',
  'ccb',
  'ccc',
];
const input = ref('');
const complete = ref('');

watch(
  input,
  (value) => {
    if (value) {
      const match = suggestions.find((suggestion) =>
        suggestion.toLowerCase().startsWith(value.toLowerCase())
      );
      console.log(match);
      if (match) {
        complete.value = match;
      } else {
        complete.value = '';
      }
    } else {
      complete.value = '';
    }
  },
  { immediate: true }
);
const acceptSuggestion = () => {
  input.value = complete.value;
  complete.value = '';
};
</script>
<style scoped>
#container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
#input {
  width: 300px;
  height: 30px;
  font-size: 20px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
#complete {
  width: 300px;
  height: 30px;
  font-size: 20px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #eee;
}
</style>
