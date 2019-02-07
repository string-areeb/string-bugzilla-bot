export = {
    replaceLinks(body: string) {
        const regex = /bz-(\d+)/g
        return body.replace(regex, (match, capture) => {
            return `[${match}](https://bugzilla.string.org.in/show_bug.cgi?id=${capture})`
        })
    }
}