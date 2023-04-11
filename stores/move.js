export const useMoveStore = defineStore('move', () => {
  const addMove = async (move) => {
    await useFetch('http://localhost:3141/move/add', {
      method: 'POST',
      body: JSON.stringify(move),
    });
  };
  const fetchMoves = async () => {
    const data = (await useFetch('http://localhost:3141/move/all')).data;
    return data;
  };
  return { addMove, fetchMoves };
});
