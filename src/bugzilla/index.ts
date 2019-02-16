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

    hasTagComment(comments: any[], tag: string): boolean {
        return !!comments.find(comment => comment.tags.includes(tag))
    },

    async isBugAlreadyCommentedOn(bug: number, tag: string): Promise<Boolean> {
        const comments = await this.getComments(bug)

        return this.hasTagComment(comments, tag)
    },

    async addCommentTag(id: number, tag: string, refresh = false): Promise<any> {
        const token = await this.getToken(refresh)

        assertTokenNotNull(token, 'Cannot add tag. Token is null')

        try {
            const tagResponse = await request.put(`https://bugzilla.string.org.in/rest.cgi/bug/comment/${id}/tags?token=${token}`, {
                json: {
                    add: [tag]
                }
            })

            console.log(`Tag Added on comment ${id} `, tagResponse)
            return tagResponse
        } catch(error) {
            if (shouldRefresh(error, refresh)) {
                return this.addCommentTag(id, tag, true)
            }

            throw error;
        }
    },

    // Low level function. All logic to whether comment or not must be handled by caller
    async comment(bug: number, tag: string, comment: string, refresh = false): Promise<any> {
        const token = await this.getToken(refresh)

        assertTokenNotNull(token, 'Cannot post comments. Token is null')

        const commentUrl = `https://bugzilla.string.org.in/rest.cgi/bug/${bug}/comment`
        try {
            const response = await request.post(`${commentUrl}?token=${token}`, {
                json: {
                    comment: comment,
                    comment_tags: [tag]
                }
            })

            // Unfortunately, we don't have latest bugzilla, so we need to update the comment with a tag instead of adding it
            // at the time of creation

            console.log(`Commented on bug ${bug} `, response)

            return this.addCommentTag(response.id, tag)
        } catch(error) {
            if (shouldRefresh(error, refresh)) {
                return this.comment(bug, tag, comment, true)
            }

            throw error;
        }
    }
}
