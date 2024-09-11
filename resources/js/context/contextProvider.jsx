import { createContext, useContext, useState, useEffect } from "react";

const StateContext = createContext();

export const ContextProvider = ({ children }) => {
    const [theme, setTheme] = useState('default');

    return (
        <StateContext.Provider
            value={{
                theme, setTheme,
                
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);