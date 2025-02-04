import { createContext, useContext, useState, useEffect } from "react";
import { light, dark } from "@/Constants/themes";

const StateContext = createContext();

export const ContextProvider = ({ children }) => {
    const [themePreference, setThemePreference] = useState(() => {
        return localStorage.getItem("themePreference") || "light";
    });

    const [theme, setTheme] = useState(themePreference === "dark" ? dark : light);
    const [userPermissions, setUserPermissions] = useState();
    const [userType, setUserType] = useState(1111);
    const [debugMode, setDebugMode] = useState(() => {
        return localStorage.getItem("debugMode") === "true"; // Persist debug mode
    });

    // Dummy Data
    const [ordersDummyData, setOrdersDummyData] = useState([]);
    const [fleetsDummyData, setFleetsDummyData] = useState([]);

    useEffect(() => {
        localStorage.setItem("themePreference", themePreference);
        setTheme(themePreference === "dark" ? dark : light);
    }, [themePreference]);

    useEffect(() => {
        localStorage.setItem("debugMode", debugMode);
        if (debugMode) {
            document.body.classList.add("debug-mode");
        } else {
            document.body.classList.remove("debug-mode");
        }
    }, [debugMode]);

    return (
        <StateContext.Provider
            value={{
                theme, setTheme,
                debugMode, setDebugMode,
                themePreference, setThemePreference,
                userPermissions, setUserPermissions,
                userType, setUserType,
                ordersDummyData, setOrdersDummyData,
                fleetsDummyData, setFleetsDummyData,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);
