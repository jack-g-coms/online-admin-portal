// * modules
const axios = require('axios');

// * url
const base = 'https://supportapi.romestaff.com'

// * helpers
const getCookie = (cookieString) => {
    const elements = cookieString.split(';');
    const authCookie = elements[0];

    return authCookie.split('=')[1];
};

// * api
const Account = class {
    constructor(email, password) {
        this.email = email;
        this.password = password;
        this.cookie = null;
    }

    login() {
        return new Promise((resolve, reject) => {
            axios.post(`${base}/api/account/login`, {email: this.email, password: this.password}, {headers: {'Content-Type': 'application/json'}})
                .then((response) => {
                    if (response.data.message == 'Success') {
                        this.cookie = getCookie(response.headers['set-cookie'][0]);
                        return resolve(response.data.data.account);
                    }
                    reject();
                })
                .catch((err) => {
                    console.log(err)
                    reject(err)
                });
        });
    }

    async get() {
        if (this.cookie) {
            return;
        }
        await this.login();
    }

    sendAPI(method, endpoint, data) {
        if (!this.cookie) return;
        return new Promise((resolve, reject) => {
            axios({
                method,
                url: `${base}/${endpoint}`,
                data,
                headers: {'Content-Type': 'application/json', 'Cookie': `authorization=${this.cookie}`}
            })
            .then(res => {
                resolve(res.data);
            })
            .catch(reject);
        });
    }
}

// * exports
module.exports.Account = Account;