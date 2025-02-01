import { adminPages, inventoryPages, infrastructurePages, auditPages } from "@/Constants/navlinks";

export const getPages = (userType) => {
    switch (userType) {
        /* case 2050:
            return adminPages; */
        case 2051:
            return adminPages;
        case 2052:
            return inventoryPages;
        case 2053:
            return infrastructurePages;
        case 2054:
            return auditPages;
        /* case 2055:
            return adminPages; */
    }
};