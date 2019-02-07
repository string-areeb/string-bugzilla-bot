export = {
    replaceLinks(body: string) {
        const regex = /(?:^|[\s.,;()?!])(bz-(\d+))/g
        return body.replace(regex, (match, reference, capture) => {
            return match.replace(reference, `[${reference}](https://bugzilla.string.org.in/show_bug.cgi?id=${capture})`)
        })
    }
}
