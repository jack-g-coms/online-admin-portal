import React from 'react';
import '../css/TextBox.css';

function TextBox({children, onKeyUp, required, style, className, setState, placeholder, type, disabled, onClick}) {
    return (
        <>
            {required &&
                <input onKeyUp={onKeyUp} style={style} required readOnly={disabled} value={children} onClick={onClick} className={`textbox ${className}`} type={type} placeholder={placeholder} onChange={(e) => setState(e.target.value)}/>
            ||
                <input onKeyUp={onKeyUp} style={style} readOnly={disabled} value={children} onClick={onClick} className={`textbox ${className}`} type={type} placeholder={placeholder} onChange={(e) => setState(e.target.value)}/>
            }
            {disabled &&
                <>
                    <span style={{'fontSize': '15px', 'marginTop': '2px'}}><span style={{'color': '#f0be48'}}>*</span> Info is read only</span>
                </>
            }
        </>
    );
};

export default TextBox;