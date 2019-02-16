const prefixes = ['bz-', 'bug ', 'issue ', '!']
const fixVerbs = ['Fixes', 'Closes', 'Resolves']

function createBugRegex(): String {
    const suffix = '(\\d+)'
    return prefixes
        .map(prefix => `(?:${prefix}${suffix})`)
        .join('|')
}

const bugRegex = createBugRegex()

function createIssueRegex(): RegExp {
    return new RegExp(`(?:^|[\\s.,;()?!])(${bugRegex})`, 'ig')
}

function createFixesIssueRegex(): RegExp {
    const fixRegex = fixVerbs.map(verb => `(?:${verb})`)
        .join('|')
    return new RegExp(`(?:^|[\\s.,;()?!])(?:(?:(${fixRegex})) )(${bugRegex})`, 'ig')
}

const issueRegex = createIssueRegex()
const fixesIssueRegex = createFixesIssueRegex()

export = {
    replaceLinks(body: string) {
        return body.replace(issueRegex, function(match, reference) {
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
    },

    getFixedIssueNumbers(body: string): number[] {
        const matched = body.match(fixesIssueRegex)
        if (matched != null) {
            return matched.map(match => {
                const issue = match.match('\\d+')
                if (issue != null) {
                    return parseInt(issue[0])
                } else {
                    return null
                }
            }).filter(item => item != null) as number[]
        }
        return []
    }
}
