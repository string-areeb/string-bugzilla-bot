
import links from '../src/links/index'

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
