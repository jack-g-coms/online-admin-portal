import React, { useContext } from 'react';
import {Routes, Route, Navigate, Outlet} from 'react-router-dom';

import AuthContext from './js/modules/AuthContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Portal from './pages/Portal';
import NotFound from './pages/NotFound';

function RouterComponent() {
    const authContext = useContext(AuthContext);

    const GuestRoute = () => {
        if (authContext.user && authContext.user.verified) {
            return <Navigate to={`/portal/dashboard`} replace/>;
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

    const RequiresFlag = ({flag}) => {
        console.log(flag, authContext.user)
        if (authContext.user && authContext.user.verified && authContext.user.permissions.Flags[flag]) {
            return <Outlet/>;
        } else {
            return <Navigate to={`/portal/dashboard`} replace/>;
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
                    <Route exact path='/portal' element={<Portal view='dashboard'/>}/>
                    <Route path='/portal/dashboard' element={<Portal view='dashboard'/>}/>
                    <Route path='/portal/robloxBans' element={<Portal view='robloxBans'/>}/>
                    <Route path='/portal/robloxWarnings' element={<Portal view='robloxWarnings'/>}/>
                    <Route path='/portal/discordModerations' element={<Portal view='discordModerations'/>}/>
                    <Route path='/portal/discordBans' element={<Portal view='discordBans'/>}/>
                    <Route path='/portal/moderationReport' element={<Portal view='moderationReport'/>}/>
                </Route>

                <Route element={<RequiresFlag flag='MANAGE_USERS'/>}>
                    <Route path='/portal/users' element={<Portal view='users'/>}/>
                </Route>

                <Route element={<RequiresFlag flag='VIEW_GLOBAL_BANS'/>}>
                    <Route path='/portal/globalBans' element={<Portal view='globalBans'/>}/>
                </Route>

                <Route element={<RequiresFlag flag='VIEW_LOGS'/>}>
                    <Route path='/portal/logs' element={<Portal view='logs'/>}/>
                </Route>

                <Route element={<RequiresFlag flag='BOT_ACTIONS'/>}>
                    <Route path='/portal/createEmbed' element={<Portal view='createEmbed'/>}/>
                </Route>

                <Route path='*' element={<NotFound/>}/>
            </Routes>
        </>
    );
};

export default RouterComponent;