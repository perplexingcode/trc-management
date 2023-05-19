<template>
  <p>{{ data }}</p>
</template>

<script setup>
const apiUrl =
  'https://vq4h0iro9k.execute-api.ap-southeast-1.amazonaws.com/locker';
// Put item into locker
const data = {
  order: ['Milk', 'Bread', 'Cheese'],
};

const lockerId = 'my-locker';

fetch(apiUrl + '/upsert/' + lockerId, {
  method: 'POST',
  headers: new Headers({ 'Content-Type': 'application/json' }),
  body: JSON.stringify(data),
});

// Get item from locker
await fetch(apiUrl + '/locker/get/' + lockerId)
  .then((response) => response.json())
  .then((data) => {
    // access data here
    console.log(data);
  });
</script>
