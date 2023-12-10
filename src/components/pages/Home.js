import React from 'react';

import '../css/Home.css';
import '../../App.css';

import Button from '../js/Button';

function Home() {
    return (
        <>
            <div className='welcome-container'>
                <h2>Welcome to Rome Admin Portal</h2>
                <img src='/media/images/jack-pic.png'></img>
                <span>JackManzotti</span>
                <span>Portal Developer</span>

                <p>
                    <strong><span style={{'color': '#f54242'}}>The Rome Admin Portal</span></strong> is the primary interface for the moderation network of the <a href='https://www.roblox.com/groups/6124305/The-Roman-Empire#!/about'>Roman Empire on Roblox.</a> <strong><span style={{'color': '#f5cb42'}}>If you do not have a login for this portal, and believe you should, contact the System Administrator listed above: JackManzotti.</span></strong>
                </p>

                <div className='btn-container-welcome-container'>
                    <Button path='/login' animation='raise' size='btn-large' scheme='btn-confirm'>Login <i class='fa-solid fa-arrow-right'/></Button>
                </div>
            </div>
        </>
    )
}

export default Home;