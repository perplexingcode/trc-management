export const useProjectStore = defineStore('project', () => {
  const backendUrl = 'useRuntimeConfig().backendUrl';
  const addTask = async (task) => {
    await useFetch(backendUrl + '/project/add', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  };
  const fetchProjects = async () => {
    const data = (await useFetch(backendUrl + '/project/all')).data;
    return data;
  };
  return { addTask, fetchProjects };
});
