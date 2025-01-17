import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';

export const useAccessControl = (requiredUserTypes) => {
    const { userType } = useStateContext();

    const hasAccess = () => {
        if (Array.isArray(requiredUserTypes)) {
            return requiredUserTypes.some(type => userType === type);
        }
        return userType === requiredUserTypes;
    };

    return { hasAccess };
};