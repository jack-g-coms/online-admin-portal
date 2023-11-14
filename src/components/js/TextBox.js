import React from 'react';
import '../css/TextBox.css';

function TextBox({children, style, setState, placeholder, type, disabled, onClick}) {
    return (
        <>
            <input style={style} readOnly={disabled} defaultValue={children} onClick={onClick} className='textbox' type={type} placeholder={placeholder} onChange={(e) => setState(e.target.value)}/>
            {disabled &&
                <>
                    <span style={{'fontSize': '15px', 'marginTop': '2px'}}><span style={{'color': '#f0be48'}}>*</span> Info is read only</span>
                </>
            }
        </>
    );
};

export default TextBox;