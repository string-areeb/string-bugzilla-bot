import nock from 'nock'

import bugzilla from '../src/bugzilla'

nock.disableNetConnect()

describe('BugZilla Auth Tests', () => {

    beforeEach(() => {
        bugzilla.setCredentials(undefined, undefined)
        bugzilla.releaseToken()
    })

    test('Gets token and authenticates with bugzilla', async (done) => {
        nock('https://bugzilla.string.org.in')
            .get('/rest.cgi/login')
            .query({login: 'test', password: 'tester'})
            .reply(200, { token:"bugzilla-token" })

        bugzilla.setCredentials('test', 'tester')

        done(expect(await bugzilla.getToken()).toBe('bugzilla-token'))
    })

    test('Returns null token if error', async (done) => {
        nock('https://bugzilla.string.org.in')
            .get('/rest.cgi/login')
            .query({login: 'test', password: 'tester'})
            .replyWithError('')
        
        bugzilla.setCredentials('test', 'tester')

        done(expect(await bugzilla.getToken()).toBe(null))
    })

    test('Returns null token if no credentials', async (done) => {
        done(expect(await bugzilla.getToken()).toBe(null))
    })

    test('Caches token from bugzilla', async (done) => {
        nock('https://bugzilla.string.org.in')
            .get('/rest.cgi/login')
            .query({login: 'test', password: 'tester'})
            .once()
            .reply(200, { token:"bugzilla-token" })

        bugzilla.setCredentials('test', 'tester')

        await bugzilla.getToken()
        done(expect(await bugzilla.getToken()).toBe('bugzilla-token'))
    })

    test('Refreshes token from bugzilla', async (done) => {
        let first = true
        nock('https://bugzilla.string.org.in')
            .get('/rest.cgi/login')
            .query({login: 'test', password: 'tester'})
            .twice()
            .reply(200, () => {
                if (first) {
                    first = false;
                    return { token:"bugzilla-token" }
                } else {
                    return { token:"bugzilla-refreshed-token" }
                }
            })

        bugzilla.setCredentials('test', 'tester')

        await bugzilla.getToken() // cache the first token
        await bugzilla.getToken(true) // refresh the token
        done(expect(await bugzilla.getToken()).toBe('bugzilla-refreshed-token')) // check if new token is cached
    })

})