import React from "react";
import '../css/NotFound.css';

import Button from "../js/Button";

function NotFound() {
    return (
        <>
            <div className='not-found-container'>
                <div className='not-found-info'>
                    <span style={{'fontSize': '150px', 'fontWeight': '400', 'marginBottom': '20px'}}>404</span>
                    <span style={{'fontSize': '40px', 'fontWeight': '100', 'marginBottom': '10px'}}>Sorry, this page was not found.</span>
                    <span style={{'fontSize': '25px', 'fontWeight': '100'}}>The link appears to no longer be working. It could be malformed or the page has been removed.</span>
                </div>

                <img src='/media/images/404.png'/>
            </div>
        </>
    );
};

export default NotFound;