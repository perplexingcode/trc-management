export const validateItem = function (row, columns) {
  let validated = true;
  const requiredFields = [];
  for (let i = 0; i < columns.length; i++) {
    const cell = row[columns[i].key];
    const isCellRequired = columns[i]?.attrs?.required;
    if (isCellRequired && (cell === '' || cell === undefined)) {
      validated = false;
      requiredFields.push(columns[i].key);
    }
  }

  if (!validated) {
    alert('Please fill in the required fields: ' + requiredFields.join(', '));
    return false;
  }
  return true;
};
