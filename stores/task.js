export const useTaskStore = defineStore('task', () => {
  const addTask = async (task) => {
    await useFetch('http://localhost:3141/task/add', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  };
  const fetchTasks = async () => {
    const data = (await useFetch('http://localhost:3141/task/all')).data;
    return data;
  };
  return { addTask, fetchTasks };
});
