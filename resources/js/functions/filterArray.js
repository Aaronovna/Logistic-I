import { convertPermissions } from "./permissionsConverter";

export const filterArray = (array = [], property = '', criteria = [], invert = false) => {
  if (!Array.isArray(array) || !Array.isArray(criteria)) {
    throw new Error("Both 'array' and 'criteria' should be arrays.");
  }

  // If invert is true, filter out the items that match the criteria
  return array.filter(item => {
    const isMatch = criteria.includes(item?.[property]);
    return invert ? !isMatch : isMatch;
  });
};