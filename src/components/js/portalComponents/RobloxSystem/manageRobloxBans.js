import React, { useState, useRef, useContext, useEffect } from 'react'; 
import ReactPaginate from 'react-paginate'; 

import '../../../css/portalComponents/RobloxSystem/ManageBans.css';

import Button from '../../Button';
import TextBox from '../../TextBox';
import Loader from '../../Loader';
import ManageBansRow from './manageRobloxBansRow';
import CreateRobloxBanPopup from '../../popups/CreateRobloxBan';

import AuthContext from '../../modules/AuthContext';
import { getBans, searchBan, newBan } from '../../modules/RobloxModerations';

function ManageRobloxBans() {
    const authContext = useContext(AuthContext);

    const [state, setState] = useState('loading');
    const [popupState, setPopupState] = useState('closed');
    const [filter, setFilter] = useState('');

    const bans = useRef();
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
        const bansFilter = ban => ban.rbxID.toString().includes(filter) || ban.moderator.toString().includes(filter) || ban.banType.Type.toLowerCase() == filter.toLowerCase() || ban.reason.toLowerCase().includes(filter.toLowerCase());
        const results = bans.current.filter(bansFilter);
        
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
        getBans()
            .then(bansReq => {
                bans.current = bansReq.data || [];

                setPagination({
                    data: bans.current,
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
    }, [pagination.numberPerPage, pagination.offset, bans.current]);

    return (
        <>
            <div className='manage-roblox-bans-page'>
                {state == 'loading' &&
                    <Loader style={{'margin': 'auto'}}/>
                }

                {popupState == 'opened' && 
                    <CreateRobloxBanPopup setState={setPopupState}/>
                }
                
                {state == 'available' && bans.current &&
                    <>
                        <div style={{'borderBottom': '1px solid #706f6f', 'borderBottomLeftRadius': '5px', 'borderBottomRightRadius': '5px'}} className='manage-roblox-bans-container'>
                            <div className='manage-roblox-bans-container-header-row'>
                                <h1><i style={{'marginRight': '4px'}} class='fa-solid fa-circle-info'/> Roblox Ban Actions</h1>
                            </div>

                            <div className='manage-roblox-bans-table'>
                                <div style={{'alignItems': 'center', 'justifyContent': 'center'}} className='manage-roblox-bans-container-row'>
                                    {authContext.user.permissions.Flags.CREATE_ROBLOX_BANS &&
                                        <Button animation='raise' onClick={(e) => {setPopupState('opened');}} scheme='btn-confirm'>Create Ban</Button>
                                    }
                                    {!authContext.user.permissions.Flags.CREATE_ROBLOX_BANS &&
                                        <span>You are currently a <span style={{'color': '#349fc9'}}>read only</span> access level</span>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className='manage-roblox-bans-container'>
                            <div className='manage-roblox-bans-container-header-row'>
                                <h1><i style={{'marginRight': '4px'}} class='fa-solid fa-gavel'/> Roblox Bans</h1>
                            </div>

                            <div className='manage-roblox-bans-container-header-notice'>
                                <TextBox onKeyUp={(e) => {
                                    if (e.key == 'Enter' || e.keyCode == 13) applyFilter();
                                }} setState={setFilter} className='filter-textbox' placeholder={'Filter Bans (enter any key or relevant information about the ban)'}/>
                            </div>

                            <div className='manage-roblox-bans-table manage-roblox-bans-table-container'>
                                {pagination.currentData && pagination.currentData.map((listedBan, i) => {
                                    return <ManageBansRow ban={listedBan}/>;
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
                    </>
                }
            </div>
        </>
    );
};

export default ManageRobloxBans;