import React, { useState, useEffect, useContext, useRef } from "react";
import ReactPaginate from 'react-paginate'; 
import '../../css/portalComponents/Logs.css';

import Button from "../Button";
import TextBox from "../TextBox";
import Loader from "../Loader";

import AuthContext from "../modules/AuthContext";
import * as Logging from '../modules/Logging';
import * as Common from '../../../shared';

function Log({ data }) {
    var time = Common.convertToLocal(data.timestamp, true, true);
    var date = time[0];
    var dateTime = time[1];

    return (
        <div className='log-row'>
            <span>{date}<br/>{dateTime}</span>

            <div className='log-row-user'>
                <img src={data.user.rbxUser.imageUrl}/>
                <div className='log-row-user-info'>
                    <span>{data.user.rbxUser.username}</span>
                    <span style={{'fontSize': '15px', 'opacity': '0.5'}}>{data.user.permissions.Name}</span>
                </div>
            </div>

            <span style={{'color': '#f0be48'}}>ID: {data.logID}<br/><span style={{'color': '#34c94a', 'fontSize': '15px'}}><i style={{'marginRight': '7px'}} className='fa-solid fa-gavel'/>Authorized Action based on Permissions</span></span>
            <span style={{'marginBottom': 'auto', 'fontWeight': '1000'}}>Description<br/><span style={{'fontWeight': 'normal', 'fontSize': '17px', 'wordBreak': 'break-all'}}>{data.action}</span></span>
        </div>
    );
}

function Logs() {
    const authContext = useContext(AuthContext);

    const [state, setState] = useState('loading');
    const [filter, setFilter] = useState('');

    const logs = useRef();
    const [pagination, setPagination] = useState({
        data: [],
        offset: 0,
        numberPerPage: 50,
        pageCount: 0,
        pageNum: 1,
        currentData: [] 
    });

    const handlePageClick = event => {
        const selected = event.selected;
        const offset = selected * pagination.numberPerPage;

        setPagination({...pagination, offset, pageNum: selected});
    };

    const applyFilter = () => {
        const logsFilter = log => log.logID == filter || log.action.toLowerCase().includes(filter.toLowerCase()) || log.user.rbxUser.username.toLowerCase().includes(filter.toLowerCase());
        const results = logs.current.filter(logsFilter);
        
        setPagination((prevState) => ({
            data: results,
            pageCount: Math.ceil(results.length / pagination.numberPerPage),
            currentData: results.slice(pagination.offset, pagination.offset + pagination.numberPerPage),
            pageNum: 0,
            offset: 0,
            numberPerPage: 50
        }));
    };

    useEffect(() => {
        Logging.getLogs()
            .then(res => {
                logs.current = res.data || {};
                setPagination({
                    data: logs.current,
                    offset: 0,
                    numberPerPage: 50,
                    pageCount: 0,
                    pageNum: 0,
                    currentData: []
                })
                setState('available');
            }).catch(console.log);
    }, []);

    useEffect(() => {
        setPagination((prevState) => ({
            ...prevState,
            pageCount: Math.ceil(prevState.data.length / prevState.numberPerPage),
            currentData: prevState.data.slice(pagination.offset, pagination.offset + pagination.numberPerPage)
        }));
    }, [pagination.numberPerPage, pagination.offset, logs.current]);

    return (
        <div className='logs-page'>
            {state == 'loading' &&
                <Loader style={{'margin': 'auto'}}/>
            }

            {state == 'available' && logs.current &&
                <div className='logs-container'>
                    <div className='manage-users-container-header'>
                        <h1><i style={{'marginRight': '4px'}} class='fa-solid fa-eye'/> Logs</h1>
                    </div>
                    <div className='manage-roblox-bans-container-header-notice'>
                        <TextBox onKeyUp={(e) => {
                            if (e.key == 'Enter' || e.keyCode == 13) applyFilter();
                        }} setState={setFilter} className='filter-textbox' placeholder={'Filter Logs (enter any key or relevant information about the log)'}/>
                    </div>

                    <div style={{'marginBottom': '0', 'borderBottom': 'none'}} className='logs-table'>
                        {pagination.currentData.map((log, i) => {
                            return (<Log data={log}/>);
                        })}
                    </div>

                    <div className='manage-roblox-bans-table-bottom'>
                        <ReactPaginate
                            activeClassName={'paginationList'}
                            previousLabel={<i class="fa-solid fa-arrow-left-long"></i>}
                            nextLabel={<i class="fa-solid fa-arrow-right-long"></i>}
                            breakLabel={'...'}
                            pageCount={pagination.pageCount}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={handlePageClick}
                        />
                        <span>Page <TextBox className='pag-textbox' setState={page => {if (!isNaN(page)) {handlePageClick({selected: Number(page) - 1})}}} style={{'backgroundColor': '#303030', 'width': '50px', 'height': '20px', 'textAlign': 'center'}} children={pagination.pageNum + 1}/> out of {pagination.pageCount}</span>
                    </div>
                </div>
            }
        </div>
    );
}

export default Logs;