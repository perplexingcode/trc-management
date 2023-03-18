export const useProjectStore = defineStore('project', () => {
  const addTask = async (task) => {
    await useFetch('http://localhost:3141/project/add', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  };
  const fetchProjects = async () => {
    const data = (await useFetch('http://localhost:3141/project/all')).data;
    console.log('khachat', data);
    return data;
  };
  return { addTask, fetchProjects };
});
