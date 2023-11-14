import React, { useEffect, useState, createContext, useContext, useRef } from 'react';
import { refresh } from './js/modules/User';
import { useLocation } from 'react-router-dom';

import AuthContext from './js/modules/AuthContext';

function AuthProvider({ children }) {
    const winPath = useLocation();
    const isAuthenticated = useRef(false);

    const [apiState, setApiState] = useState('available');
    const [user, setUser] = useState();

    const getCurrentUser = async () => {
        refresh()
            .then((responseInfo) => {
                isAuthenticated.current = true;
                setUser(responseInfo.data || null);
                return;
            })
            .catch((err) => {
                setApiState('unavailable');
            });
    };

    useEffect(() => {
        getCurrentUser();
    }, [winPath.pathname]);

    return (
        <>
            {isAuthenticated.current && <AuthContext.Provider value={{refresh, user}}>{children}</AuthContext.Provider>}
            {apiState == 'unavailable' && <></>}
        </>
    );
};

export default AuthProvider;