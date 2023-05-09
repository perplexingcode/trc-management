export const useMoveStore = defineStore('move', () => {
  const backendUrl = 'useRuntimeConfig().backendUrl';
  const addMove = async (move) => {
    await useFetch(backendUrl + '/move/add', {
      method: 'POST',
      body: JSON.stringify(move),
    });
  };
  const fetchMoves = async () => {
    const data = (await useFetch(backendUrl + '/move/all')).data;
    return data;
  };
  return { addMove, fetchMoves };
});
