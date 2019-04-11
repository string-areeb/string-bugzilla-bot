require('dotenv').config()
import request from 'request-promise';

let username: string|undefined = process.env.BUGZILLA_USERNAME;
let password: string|undefined = process.env.BUGZILLA_PASSWORD;

let token: string|null = null;

export function assertTokenNotNull(token: string|null, message: string) {
    if (token == null) {
        throw new Error(message)
    }
}

export function shouldRefresh(error: any, refresh: boolean): boolean {
    if (refresh) // If already refreshed, there is nothing we can do
        return false;

    if (error.statusCode === 400) {
        const errorJSON = error.response.body
        const errorResponse = JSON.parse(errorJSON)

        return errorResponse.code === 32000; // Token has expired
    }

    return false;
}

export async function getToken(refresh: boolean = false): Promise<string|null> {
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
        console.error('Error while getting token', e)
        return null
    }
}

export async function safeRun(fun: (token: string) => any, errorMessage: string | undefined = undefined, refresh: boolean = false): Promise<any> {
    const token = await getToken(refresh)

    assertTokenNotNull(token, `${ errorMessage || 'Cannot run function' }. Token is null`)

    try {
        return await fun(token as string)
    } catch (error) {
        if (shouldRefresh(error, refresh)) {
            return safeRun(fun, errorMessage, true)
        }

        throw error;
    }
}

export const testController = {
    releaseToken: async function() {
        token = null
    },
    
    setCredentials: async function(login: string|undefined, pass: string|undefined) {
        username = login
        password = pass
    }
}
