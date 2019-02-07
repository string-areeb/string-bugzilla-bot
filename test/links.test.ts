
import links from '../src/links/index'


test('Replaces bz prefix comment', async (done) => {
  const comment = 'Closes bz-2345'
  done(expect(links.replaceLinks(comment))
    .toBe('Closes [bz-2345](https://bugzilla.string.org.in/show_bug.cgi?id=2345)'))
})
