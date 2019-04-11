
import links from '../src/links/index'

describe('Link replacement tests', () => {
  test('Replaces bz prefix comment', async (done) => {
    const comment = 'Closes bz-2345'
    done(expect(links.replaceLinks(comment))
      .toBe('Closes [bz-2345](https://bugzilla.string.org.in/show_bug.cgi?id=2345)'))
  })
  
  test('Ignores already unfurled comment', async (done) => {
    const comment = 'Closes [bz-2345](https://bugzilla.string.org.in/show_bug.cgi?id=2345)'
    done(expect(links.replaceLinks(comment))
      .toBe(comment))
  })
  
  test('Ignores reference in between sentence', async (done) => {
    const comment = 'Closesbz-2345'
    done(expect(links.replaceLinks(comment))
      .toBe(comment))
  })
  
  test('Unfurls reference at the start of sentence', async (done) => {
    const comment = 'bz-2345'
    done(expect(links.replaceLinks(comment))
      .toBe('[bz-2345](https://bugzilla.string.org.in/show_bug.cgi?id=2345)'))
  })
  
  test('Unfurls reference with punctuation in front', async (done) => {
    const comment = 'This is good.bz-2345 is resolved'
    done(expect(links.replaceLinks(comment))
      .toBe('This is good.[bz-2345](https://bugzilla.string.org.in/show_bug.cgi?id=2345) is resolved'))
  })
  
  test('Replaces bug prefix comment', async (done) => {
    const comment = '.bug 2345'
    done(expect(links.replaceLinks(comment))
      .toBe('.[bug 2345](https://bugzilla.string.org.in/show_bug.cgi?id=2345)'))
  })
  
  test('Replaces issue prefix comment', async (done) => {
    const comment = '.Issue 2345'
    done(expect(links.replaceLinks(comment))
      .toBe('.[Issue 2345](https://bugzilla.string.org.in/show_bug.cgi?id=2345)'))
  })
  
  test('Replaces ! prefix comment', async (done) => {
    const comment = 'Closes !2345'
    done(expect(links.replaceLinks(comment))
      .toBe('Closes [!2345](https://bugzilla.string.org.in/show_bug.cgi?id=2345)'))
  })
})

describe('Fix extraction tests', () => {

  test('Extracts fixes bz issues', async (done) => {
    const comment = 'Fixes bz-2345'
    done(expect(links.getFixedIssueNumbers(comment))
      .toEqual([2345]))
  })

  test('Extracts fixes ! issues', async (done) => {
    const comment = 'Fixes !1234'
    done(expect(links.getFixedIssueNumbers(comment))
      .toEqual([1234]))
  })

  test('Extracts multiple fixes ! issues', async (done) => {
    const comment = 'Fixes !1234\nFixes !4567'
    done(expect(links.getFixedIssueNumbers(comment))
      .toEqual([1234, 4567]))
  })

  test('Extracts multiple complex fixes ! issues', async (done) => {
    const comment = 'Fixes !1234\nFixes !4567 and fixes !5345.fixEs !3333'
    done(expect(links.getFixedIssueNumbers(comment))
      .toEqual([1234, 4567, 5345, 3333]))
  })

  test('Extracts closes ! issues', async (done) => {
    const comment = 'Closes !1234'
    done(expect(links.getFixedIssueNumbers(comment))
      .toEqual([1234]))
  })

  test('Extracts fix multiple complex issues', async (done) => {
    const comment = 'Fixes bz-123,closes bug 234.Resolves !7890, and fixes issue 908'
    done(expect(links.getFixedIssueNumbers(comment))
      .toEqual([123, 234, 7890, 908]))
  })

})

describe('Fix rendered extraction tests', () => {

  test('Extracts rendered issues', async (done) => {
    const body = 'Fixes [!55555](https://bugzilla.string.org.in/show_bug.cgi?id=55555)\n Resolves [Bug 6789](https://bugzilla.string.org.in/show_bug.cgi?id=6789)'

    done(expect(links.getFixedRenderedIssueNumbers(body))
      .toEqual([55555, 6789]))
  })

  test('Extracts non-rendered issues', async (done) => {
    const body = 'Fixes !3456. Closes bz-2345'

    done(expect(links.getFixedRenderedIssueNumbers(body))
      .toEqual([3456, 2345]))
  })

  test('Extracts non-rendered and rendered issues', async (done) => {
    const body = 'Fixes !3456. Closes [bz-2345]()\nResolves Bug 3451. Fixes [Issue 2334]()'

    done(expect(links.getFixedRenderedIssueNumbers(body))
      .toEqual([3456, 2345, 3451, 2334]))
  })

})
