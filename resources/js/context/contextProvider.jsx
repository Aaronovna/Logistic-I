import { createContext, useContext, useState, useEffect } from "react";
import { light, dark } from "@/Constants/themes";

const StateContext = createContext();

export const ContextProvider = ({ children }) => {
    const [themePreference, setThemePreference] = useState('dark');
    const [theme, setTheme] = useState({});
    const [userPermissions, setUserPermissions] = useState();

    useEffect(() => {
        if (themePreference === 'light') {
            setTheme(light)
        } else if (themePreference === 'dark') {
            setTheme(dark)
        }
    }, [themePreference]);

    return (
        <StateContext.Provider
            value={{
                theme, setTheme,
                themePreference, setThemePreference,
                userPermissions, setUserPermissions,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);