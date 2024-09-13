export const convertPermissions = (jsonString) => {
    try {
        const permissionsObject = JSON.parse(jsonString);

        const permissionsArray = [];

        for (const [key, value] of Object.entries(permissionsObject)) {
            const permissionItem = {};
            permissionItem[key] = value;

            permissionsArray.push(permissionItem);
        }

        return permissionsArray;
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return [];
    }
}