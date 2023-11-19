import React from 'react';
import { Interweave } from 'interweave';
import '../css/TextArea.css';

function TextArea({children, style, defaultValue, setState, placeholder, type, disabled, onClick}) {
    return (
        <>
            <textarea style={style} defaultValue={defaultValue} value={children} readOnly={disabled} onClick={onClick} className='textarea' type={type} placeholder={placeholder} onInput={(e) => setState(e.target.value)}/>
            {disabled &&
                <>
                    <span style={{'fontSize': '15px', 'marginTop': '2px'}}><span style={{'color': '#f0be48'}}>*</span> Info is read only</span>
                </>
            }
        </>
    );
};

export default TextArea;