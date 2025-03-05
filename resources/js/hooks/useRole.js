import AdminLayout from "@/Layouts/AdminLayout";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import InventoryLayout from "@/Layouts/InventoryLayout";
import InfrastructureLayout from "@/Layouts/InfrastructureLayout";
import AuditLayout from "@/Layouts/AuditLayout";
import { superAdminPages, adminPages, inventoryPages, infrastructurePages, auditPages } from "@/Constants/navlinks";
import { useStateContext } from "@/context/contextProvider";

const useRole = () => {
  const { userPermissions, userType } = useStateContext();

  const hasAccess = (userType = 0, allowedTypes = []) => {
    if (!allowedTypes || allowedTypes.length === 0) return false;

    const typeList = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];

    return typeList.includes(userType);
  };

  const hasPermissions = (allowedPermissions = []) => {
    if (!userPermissions || typeof userPermissions !== "object" || !Array.isArray(allowedPermissions)) return false;

    return allowedPermissions.some(permission => userPermissions[permission] === true);
  };

  const getLayout = (userType = 0) => {
    let Layout = InventoryLayout;

    if (userType === 2050) {
      Layout = SuperAdminLayout;
    } else if (userType === 2051) {
      Layout = AdminLayout;
    } else if (userType === 2052) {
      Layout = InventoryLayout;
    } else if (userType === 2053) {
      Layout = InfrastructureLayout;
    } else if (userType === 2054) {
      Layout = AuditLayout;
    } else if (userType === 2055) {
      Layout = AuditLayout;
    }

    return Layout;
  }

  const getPages = (userType) => {
    switch (userType) {
      case 2050:
          return superAdminPages;
      case 2051:
        return adminPages;
      case 2052:
        return inventoryPages;
      case 2053:
        return infrastructurePages;
      case 2054:
        return auditPages;
      case 2055:
          return auditPages;
    }
  }

  return { hasAccess, hasPermissions, getLayout, getPages };
};

export default useRole;
