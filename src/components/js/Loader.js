import React from "react";
import '../css/Loader.css';

function Loader({style}) {
    return (
        <>
            <div style={style} className='loader-container'>
                <i className='fa-solid fa-spinner loader'/>
            </div>  
        </>
    );
};

export default Loader;