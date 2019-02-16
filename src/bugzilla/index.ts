require('dotenv').config()
import request from 'request-promise';

let username: string|undefined = process.env.BUGZILLA_USERNAME;
let password: string|undefined = process.env.BUGZILLA_PASSWORD;

let token: string|null = null;

export = {
    async getToken(refresh: boolean = false): Promise<string|null> {
        if (token !== null && !refresh) {
            return token
        }

        if (username === undefined || password == undefined) {
            console.error('No username or password found')
            return null
        }

        try {
            const tokenResponse = await request(`https://bugzilla.string.org.in/rest.cgi/login?login=${username}&password=${password}`)
            token = JSON.parse(tokenResponse).token

            return token
        } catch (e) {
            // console.error('Error while getting token', e)
            return null
        }
    },

    releaseToken() {
        token = null
    },

    setCredentials(login: string|undefined, pass: string|undefined) {
        username = login
        password = pass
    }
}
