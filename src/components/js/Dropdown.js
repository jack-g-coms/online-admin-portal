import React, { useState, useContext, useRef } from 'react';
import '../css/Dropdown.css';

function Dropdown({setState, options, required}) {
    return (
        <>
            <select className='dropdown-basic' required={required || false} onChange={(e) => {
                setState(e.target.value);
            }}>
                {options.map((option, i) => {
                    return option
                })}
            </select>
        </>
    );
};

export default Dropdown;