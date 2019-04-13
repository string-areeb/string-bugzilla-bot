import { updateBugs, getBugs } from '../src/bugzilla/bugs'

describe('Fetch Tests', () => {

    test('hoola', async (done) => {
        console.log(await updateBugs({
            ids: [3869],
            status: 'RESOLVED',
            resolution: 'FIXED',
            comment: {
                body: "Passed"
            }
        } as any))

        // const a = await getBugs([3869, 7545])
        // console.log(a)
        done()
    })
})