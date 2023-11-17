import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { signup } from '../js/modules/User';

import '../css/Signup.css';

import Button from '../js/Button';
import TextBox from '../js/TextBox';

function Signup() {
    const [state, setState] = useState('available');

    const [email, setEmail] = useState();
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();

    const triggerAccountSignup = () => {
        if (!email || !username || !password) return setState('available');
        signup(email, username, password)
            .then(response => {
                if (response.message == 'No Roblox User') {
                    Swal.fire({title: 'Error', icon: 'error', text: `No Roblox User under the username ${username} was found. Ensure that you have the correct username, and that it is spelt correctly.`, confirmButtonText: 'Ok'});
                } else if (response.message == 'Login') {
                    Swal.fire({title: 'Account Found', text: 'An account under that email or username already exists. Did you mean to login?', icon: 'question', showDenyButton: true, confirmButtonText: 'Login', denyButtonText: 'Cancel'})
                        .then((result) => {
                            if (result.isConfirmed) window.location = './login';
                        });
                } else if (response.message == 'Success') {
                    Swal.fire({title: 'Success', text: 'Account creation request sent for review. Once approved, you will be able to log into the portal using this account.', icon: 'success', confirmButtonText: 'Ok'})
                        .then(() => {
                            window.location = './login';
                        });
                }
                setState('available');
            }).catch(console.log);
    };

    return (
        <>
            <div className='signup-form-container'>
                <h2>Signup for Rome Admin Portal</h2>
                <form onSubmit={(e) => {e.preventDefault(); setState('loading'); triggerAccountSignup();}} className='signup-container-fields'>
                    <div className='signup-container-field'>
                        <span><i style={{'marginRight': '3px'}} class='fa-solid fa-envelope'/> Enter Email</span>
                        <TextBox style={{'width': '100%', 'text-align': 'center'}} placeholder='Input Email' type='email' required={true} setState={setEmail}>{email}</TextBox>
                    </div>

                    <div className='signup-container-field'>
                        <span><i style={{'marginRight': '3px'}} class='fa-solid fa-user'/> Enter ROBLOX Username</span>
                        <TextBox style={{'width': '100%', 'text-align': 'center'}} placeholder='Input Username' required={true} setState={setUsername}>{username}</TextBox>
                    </div>

                    <div className='signup-container-field'>
                        <span><i style={{'marginRight': '3px'}} class='fa-solid fa-lock'/> Enter Password</span>
                        <TextBox style={{'width': '100%', 'text-align': 'center'}} placeholder='Input Password' required={true} type='password' setState={setPassword}>{password}</TextBox>
                    </div>

                    <Button animation='raise' type='submit' style={{'width': '100%'}} scheme='btn-confirm'>{state == 'available' && <>Create Account <i class='fa-solid fa-arrow-right'/></> || state == 'loading' && <i className='fa-solid fa-spinner loader'/>}</Button>
                    <Button animation='color pop-out' style={{'width': '100%'}} onClick={(e) => {window.location = './login'}} scheme='btn-clear'>Already have an account? Login <i class='fa-solid fa-arrow-right'/></Button>
                </form>
            </div>
        </>
    );
};

export default Signup;