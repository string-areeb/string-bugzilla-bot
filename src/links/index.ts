const prefixes = ['bz-', 'bug ', 'issue ', '!']
const fixVerbs = ['Fixes', 'Closes', 'Resolves']

function createBugRegex(prefix: string = '', suffix: string = ''): String {
    const bugNumber = '(\\d+)'
    return prefixes
        .map(keyword => `(?:${prefix}${keyword}${bugNumber}${suffix})`)
        .join('|')
}

const bugRegex = createBugRegex()

function createIssueRegex(): RegExp {
    return new RegExp(`(?:^|[\\s.,;()?!])(${bugRegex})`, 'ig')
}

function createFixesIssueRegex(
    prefix: string | undefined = undefined, 
    suffix: string | undefined = undefined): RegExp {
    const bugRegexString = (!prefix && !suffix) ? bugRegex : createBugRegex(prefix, suffix)

    const fixRegex = fixVerbs.map(verb => `(?:${verb})`)
        .join('|')
    return new RegExp(`(?:^|[\\s.,;()?!])(?:(?:(${fixRegex})) )(${bugRegexString})`, 'ig')
}

const issueRegex = createIssueRegex()
const fixesIssueRegex = createFixesIssueRegex()
const fixesRenderedIssueRegex = createFixesIssueRegex('\\[?', '\\]?')

function extractIssues(regex: RegExp, body: string): number[] {
    const matched = body.match(regex)
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

function getBugzillaLink(bug: string | number, reference: string | number = bug) {
    return `[${reference}](https://bugzilla.string.org.in/show_bug.cgi?id=${bug})`
}

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

            return match.replace(reference, getBugzillaLink(capture, reference))
        })
    },

    getBugzillaLink,

    getFixedIssueNumbers(body: string): number[] {
        return extractIssues(fixesIssueRegex, body)
    },

    getFixedRenderedIssueNumbers(body: string): number[] {
        return extractIssues(fixesRenderedIssueRegex, body)
    }
}
