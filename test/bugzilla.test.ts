import nock from 'nock'

import bugzilla from '../src/bugzilla'
import { testController, getToken } from '../src/bugzilla/auth'

nock.disableNetConnect()

function getRequest(username = 'test', password = 'tester') {
    testController.setCredentials(username, password)

    return nock('https://bugzilla.string.org.in')
        .get('/rest.cgi/login')
        .query({login: username, password: password})
}

function setToken(username = 'test', password = 'tester', token = 'bugzilla-token') {
    getRequest(username, password)
        .reply(200, { token: token })
}

describe('BugZilla Auth Tests', () => {

    beforeEach(() => {
        testController.setCredentials(undefined, undefined)
        testController.releaseToken()
    })

    test('Gets token and authenticates with bugzilla', async (done) => {
        setToken()

        done(expect(await getToken()).toBe('bugzilla-token'))
    })

    test('Returns null token if error', async (done) => {
        getRequest()
            .replyWithError('')

        done(expect(await getToken()).toBe(null))
    })

    test('Returns null token if no credentials', async (done) => {
        done(expect(await getToken()).toBe(null))
    })

    test('Caches token from bugzilla', async (done) => {
        setToken()

        await getToken()
        done(expect(await getToken()).toBe('bugzilla-token'))
    })

    test('Refreshes token from bugzilla', async (done) => {
        let first = true
        getRequest()
            .twice()
            .reply(200, () => {
                if (first) {
                    first = false;
                    return { token:"bugzilla-token" }
                } else {
                    return { token:"bugzilla-refreshed-token" }
                }
            })

        await getToken() // cache the first token
        await getToken(true) // refresh the token
        done(expect(await getToken()).toBe('bugzilla-refreshed-token')) // check if new token is cached
    })

})

describe('BugZilla comments tests', () => {

    function setComments(bug: number, comments: any[]) {
        nock('https://bugzilla.string.org.in')
            .get(uri => uri.includes(`/rest.cgi/bug/${bug}/comment`))
            .reply(200, {bugs:{'2335':{comments}}})
    }

    test('Fetches comments from BugZilla', async (done) => {
        setToken()

        const comments = ['test', 'rest']
        setComments(2335, comments)

        done(expect(await bugzilla.getComments(2335)).toEqual(comments))
    })

    test('Refetches token on 400', async (done) => {
        setToken()

        nock('https://bugzilla.string.org.in')
            .get(uri => uri.includes('/rest.cgi/bug/2335/comment'))
            .reply(400, {code: 32000})
        
        const comments = ['test', 'rest']
        setComments(2335, comments)

        done(expect(await bugzilla.getComments(2335)).toEqual(comments))
    })

    test('Returns false if comments have no PR comment', async (done) => {
        const comments = [{
            tags: ['noat']
        }, {
            tags: []
        }, {
            tags: ['peru', 'jamaica']
        }]

        done(expect(bugzilla.hasTagComment(comments, 'gh-pr')).toBe(false))
    })

    test('Returns true if comments have a PR comment', async (done) => {
        const comments = [{
            tags: []
        }, {
            tags: ['absolving']
        }, {
            tags: ['gh', 'gh-pr']
        }]

        done(expect(bugzilla.hasTagComment(comments, 'gh-pr')).toBe(true))
    })

})