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

export const filterUsersByPermission = (users = [], codes = []) => {
  return users.filter(user => {
    // Convert JSON string to permissions array
    const permissionsArray = convertPermissions(user.permissions);

    // Check if at least one of the specified codes is true
    return codes.some(code =>
      permissionsArray.some(permission => permission[code] === true)
    );
  });
}