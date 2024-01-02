import React, { useState, useContext, useRef } from 'react';
import '../css/Dropdown.css';

function Dropdown({setState, selected, options, required}) {
    return (
        <>
            <select className='dropdown-basic' value={selected} required={required || false} onChange={(e) => {
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