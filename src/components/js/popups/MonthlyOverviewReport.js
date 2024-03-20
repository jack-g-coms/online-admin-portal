import React, { useState } from "react";
import Swal from "sweetalert2";

import Button from "../Button";
import Dropdown from "../Dropdown";
import TextBox from "../TextBox";

import { getMonthReport } from "../modules/Statistics";

function MonthlyOverviewReportPopup({setState}) {
    const [popupState, setPopupState] = useState('available');
    const [year, setYear] = useState();
    const [month, setMonth] = useState('1');

    const generate = () => {
        if (!year || !month) return;
        if (isNaN(year) || isNaN(month)) return;
        if (popupState != 'available') return;

        setPopupState('loading');
        getMonthReport(Number(year), Number(month))
            .then((res) => {
                if (!res.success) {
                    Swal.fire({title: 'Error', icon: 'error', text: `Your report was not generated: ${res.message}`, confirmButtonText: 'Ok'});
                } else {
                    window.open(res.message, '_blank');
                }
                setPopupState('available');
            }).catch(err => {return});
    }

    return <div onClick={(e) => {if (e.target != e.currentTarget) return; setState('closed')}} className='popup-background-center'>
        <div className='popup-container'>
            <h2><i style={{'marginRight': '5px'}} class='fa-solid fa-calendar-days'/> Input Criteria</h2>
            <div style={{'alignItems': 'center', 'marginTop': '-2px', 'gap': '12px', 'fontSize': '20px'}} className='content'>
                <div className='embed-page-vertical-grouping'>
                    <span>Year</span>
                    <TextBox placeholder='Enter a valid year' setState={setYear}></TextBox>
                </div>

                <div className='embed-page-vertical-grouping'>
                    <span>Month</span>
                    <Dropdown setState={setMonth} options={[
                        <option value='1' selected>January</option>,
                        <option value='2'>February</option>,
                        <option value='3'>March</option>,
                        <option value='4'>April</option>,
                        <option value='5'>May</option>,
                        <option value='6'>June</option>,
                        <option value='7'>July</option>,
                        <option value='8'>August</option>,
                        <option value='9'>September</option>,
                        <option value='10'>October</option>,
                        <option value='11'>November</option>,
                        <option value='12'>December</option>,
                    ]}></Dropdown>
                </div>

                <div style={{'width': '100%'}} className='embed-page-horizontal-grouping'>
                    <Button onClick={generate} animation='raise' scheme='btn-confirm' style={{'width': '100%'}}><i style={{'marginRight': '3px'}} class="fa-solid fa-download"></i> Generate</Button>
                    <Button onClick={() => setState('closed')} animation='raise' scheme='btn-cancel' style={{'width': '100%'}}>Cancel</Button>
                </div>
            </div>
        </div>
    </div>
}

export default MonthlyOverviewReportPopup;