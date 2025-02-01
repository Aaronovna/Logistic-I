import { createContext, useContext, useState, useEffect } from "react";
import { light, dark } from "@/Constants/themes";

const StateContext = createContext();

export const ContextProvider = ({ children }) => {
    const [themePreference, setThemePreference] = useState('light');
    const [theme, setTheme] = useState({});
    const [userPermissions, setUserPermissions] = useState();
    const [userType, setUserType] = useState(1111);

    //Dummy Data
    const [ordersDummyData, setOrdersDummyData] = useState([]);

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
                userType, setUserType,

                ordersDummyData, setOrdersDummyData,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);