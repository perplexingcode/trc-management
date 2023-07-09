## Reason not to use Input.vue

Because the dataflow is unidirectional, it's not advised to create unnecessary child component.

## Table.vue should be just for UI only, modification happens in the `rows` object

## Implement repeated move
=> repeat id as global index => just display as queried
if task is repeat, handle upsert, delete differently
