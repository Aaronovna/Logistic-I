export const filterArray = (array, property, criteria) => {
    if (!Array.isArray(array) || !Array.isArray(criteria)) {
      throw new Error("Both 'array' and 'criteria' should be arrays.");
    }
  
    return array.filter(item => criteria.includes(item?.[property]));
  };