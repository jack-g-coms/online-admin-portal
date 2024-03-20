import React, { useState } from "react";
import '../css/DateSelect.css';

function DateSelect(props) {
    return (
        <input style={props.style} value={props.value} onChange={props.onChange} type='datetime-local'></input>
    );
}

export default DateSelect;