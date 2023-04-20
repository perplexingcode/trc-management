const suggestionItems = computed(() => {
  if (!newItem.name) return;
  //Filter all rows that resemble new item input
  const allSuggestions = allRows.value.filter((row) => {
    let match = false;
    for (let key in row) {
      if (row.name.toLowerCase().startsWith(newItem.name.toLowerCase())) {
        match = true;
        break;
      }
    }
    return match;
  });
  //Remove duplicates
  const uniqueSuggestions = allSuggestions.filter(
    (item, index, self) => index === self.findIndex((t) => t.name === item.name)
  );
  //Return only the first 5
  const suggestions = uniqueSuggestions.slice(0, 5);
 
  let maxLengths = [];
  for (let i = 0; i < suggestions.length; i++) {
    maxLengths[i] = 0;
 
    // new Array(5).forEach((v, n) => {
 
    //   if (suggestions[n][i].length > maxLengths[i]) {
    //     maxLengths[i] = suggestions[n][i].length;
    //   }
    // });
    for (let j = 0; j < 5; j++) {
 
      try {
        if (suggestions[j].value[i].length > maxLengths[i]) {
          maxLengths[i] = suggestions[j].value[i].length;
        }
      } catch (error) {}
    }
    new Array(5).forEach((v, n) => {
      if (suggestions[n][i].length < maxLengths[i]) {
        suggestions[n][i] += ' '.repeat(
          maxLengths[i] - suggestions[n][i].length
        );
      }
    });
  }
 
  return suggestions;
});
