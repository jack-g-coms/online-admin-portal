import React from 'react';

import '../css/Home.css';
import '../../App.css';
import config from '../../config.json';

import Button from '../js/Button';

function Home() {
    return (
        <>
            <div className='welcome-container'>
                <h2>Welcome to {config.communityName} Admin Portal</h2>
                <img src='/online-admin-portal/media/images/community-shield-big.png'></img>
                <span style={{'color':'#1e86cf'}}>Powered by Community Shield</span>

                <p>
                    <strong><span style={{'color': '#1e86cf'}}>The {config.communityName} Admin Portal</span></strong> is the primary interface for the moderation network of <a href={config.communityLink}>{config.communityName} on Roblox.</a> <strong><span style={{'color': '#f5cb42'}}>If you do not have a login for this portal, and believe you should, contact a System Administrator</span></strong>
                </p>

                <div className='btn-container-welcome-container'>
                    <Button path='/login' animation='raise' size='btn-large' scheme='btn-confirm'>Login <i class='fa-solid fa-arrow-right'/></Button>
                </div>
            </div>
        </>
    )
}

export default Home;