import React from 'react';
import '../css/Button.css';

import { Link } from 'react-router-dom';

function Button({children, animation, style, size, scheme, path, type, onClick}) {
    return (
        <>
            {path ? 
                <Link to={path}>
                    <button style={style} type='button' onClick={onClick} className={`btn ${size || 'btn-medium'} ${scheme || 'btn-primary'} ${animation || 'none-animation'}`}>{children || 'Button'}</button>
                </Link>
            :
                <button style={style} type={type || 'button'} onClick={onClick} className={`btn ${size || 'btn-medium'} ${scheme || 'btn-primary'} ${animation || 'none-animation'}`}>{children || 'Button'}</button>
            }
        </>
    );
};

export default Button;