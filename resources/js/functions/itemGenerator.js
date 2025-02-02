export const generateRandomItem = (array) => {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error('Input must be a non-empty array');
  }

  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

export const generateRandomItems = (numberOfItems, array) => {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error('Input must be a non-empty array');
  }
  
  if (typeof numberOfItems !== 'number' || numberOfItems <= 0) {
    throw new Error('Number of items to generate must be a positive number');
  }

  const result = [];
  const uniqueItems = new Set(array); // To avoid duplicates if necessary
  
  while (result.length < numberOfItems && uniqueItems.size > 0) {
    const randomIndex = Math.floor(Math.random() * uniqueItems.size);
    const item = Array.from(uniqueItems)[randomIndex];
    result.push(item);
    uniqueItems.delete(item); // Remove the selected item to avoid duplicates
  }
  
  return result;
};
