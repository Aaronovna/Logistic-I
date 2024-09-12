import { createContext, useContext, useState, useEffect } from "react";

const StateContext = createContext();

export const ContextProvider = ({ children }) => {
    const [theme, setTheme] = useState('default');
    const [userPermissions, setUserPermissions] = useState();

    return (
        <StateContext.Provider
            value={{
                theme, setTheme,
                userPermissions, setUserPermissions,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);