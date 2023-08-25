<template>
  <Table
    rows="transactions"
    :columns="transactionColumns"
    item-name="transaction"
    add-row
  />
</template>
<script setup>
// SYNC
const transactions = reactive({ value: {} });
async function getData() {
  // Fetch data from database
  transactions.value = (await query('move', 'date', monthDates)).data._rawValue;
}
onMounted(async () => {
  await getData();
});
provide('transactions', transactions);

// DATA
const transactionColumns = [
  {
    name: '',
    key: 'is-selected',
    type: 'is-selected',
    disabled: true,
    attrs: { type: 'text' },
  },
  {
    name: 'Transaction',
    key: 'transaction',
    type: 'input-name',
    data: choreMoves.value.map((m) => m.name),
    disabled: false,
    attrs: { type: 'text' },
  },
  {
    name: 'Category',
    key: 'cat',
    type: 'select',
    disabled: false,
    options: [
      'FoodnBeverage',
      'Services',
      'Consumables',
      'Shopping',
      'Movement',
      'Relationship',
      'Health',
      'Maintainance',
      'Education',
      'Investment',
      '-',
    ],
    attrs: { type: 'text', required: true },
  },
];

// LOGICS
</script>
<style></style>
