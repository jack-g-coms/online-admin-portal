import React, { useContext } from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate, Outlet} from 'react-router-dom';

import AuthContext from './js/modules/AuthContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Portal from './pages/Portal';

function RouterComponent() {
    const authContext = useContext(AuthContext);

    const GuestRoute = () => {
        if (authContext.user && authContext.user.verified) {
            return <Navigate to={`/portal`} replace/>;
        } else {
            return <Outlet/>;
        }
    };

    const ProtectedRoute = () => {
        if (authContext.user && authContext.user.verified) {
            return <Outlet/>;
        } else {
            return <Navigate to={`/`} replace/>;
        }
    };

    return (
        <>
            <Routes>
                <Route element={<GuestRoute/>}>
                    <Route exact path='/' element={<Home/>}/>
                    <Route path='/login' element={<Login/>}/>
                    <Route path='/signup' element={<Signup/>}/>
                </Route>

                <Route element={<ProtectedRoute/>}>
                    <Route path='/portal' element={<Portal/>}/>
                </Route>
            </Routes>
        </>
    );
};

export default RouterComponent;