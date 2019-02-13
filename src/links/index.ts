const prefixes = ['bz-', 'bug ', 'issue ']

function createRegex(): RegExp {
    const suffix = '(\\d+)'
    const bugRegex = prefixes
        .map(prefix => `(?:${prefix}${suffix})`)
        .join('|')
    return new RegExp(`(?:^|[\\s.,;()?!])(${bugRegex})`, 'ig')
}

const regex = createRegex()

export = {
    replaceLinks(body: string) {
        return body.replace(regex, function(match, reference) {
            const possibleCaptures = Array.from(arguments).slice(2, arguments.length - 2)

            let capture = null
            for (let possibleCapture of possibleCaptures) {
                if (possibleCapture !== undefined) {
                    capture = possibleCapture
                    break
                }
            }

            return match.replace(reference, `[${reference}](https://bugzilla.string.org.in/show_bug.cgi?id=${capture})`)
        })
    }
}
