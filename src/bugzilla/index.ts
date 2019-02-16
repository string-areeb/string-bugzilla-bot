require('dotenv').config()
import request from 'request-promise';

let username: string|undefined = process.env.BUGZILLA_USERNAME;
let password: string|undefined = process.env.BUGZILLA_PASSWORD;

let token: string|null = null;

function assertTokenNotNull(token: string|null, message: string) {
    if (token == null) {
        throw new Error(message)
    }
}

function shouldRefresh(error: any, refresh: boolean): boolean {
    if (refresh) // If already refreshed, there is nothing we can do
        return false;

    if (error.statusCode === 400) {
        const errorJSON = error.response.body
        const errorResponse = JSON.parse(errorJSON)

        return errorResponse.code === 32000; // Token has expired
    }

    return false;
}

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
            console.error('Error while getting token', e)
            return null
        }
    },

    releaseToken() {
        token = null
    },

    setCredentials(login: string|undefined, pass: string|undefined) {
        username = login
        password = pass
    },

    async getComments(bug: number, refresh = false): Promise<any[]> {
        const token = await this.getToken(refresh)

        assertTokenNotNull(token, 'Cannot get comments. Token is null')

        try {
            const commentsResponse = await request(`https://bugzilla.string.org.in/rest.cgi/bug/${bug}/comment?token=${token}`)
            return JSON.parse(commentsResponse).bugs[bug.toString()].comments
        } catch (error) {
            if (shouldRefresh(error, refresh)) {
                return this.getComments(bug, true)
            }

            throw error;
        }
    },

    hasTagComment(comments: any[]): boolean {
        return !!comments.find(comment => comment.tags.includes('gh-pr'))
    },

    async isBugAlreadyCommentedOn(bug: number): Promise<Boolean> {
        const comments = await this.getComments(bug)

        return this.hasTagComment(comments)
    }
}
