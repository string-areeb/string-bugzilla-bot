require('dotenv').config()
import request from 'request-promise';
import links from '../links';
import { getToken, assertTokenNotNull, shouldRefresh } from './auth';

export = {
    
    async getComments(bug: number, refresh = false): Promise<any[]> {
        const token = await getToken(refresh)

        assertTokenNotNull(token, 'Cannot get comments. Token is null')

        try {
            const commentsResponse = await request(`https://bugzilla.string.org.in/rest.cgi/bug/${bug}/comment?token=${token}`)
            return JSON.parse(commentsResponse).bugs[bug.toString()].comments
        } catch (error) {
            if (shouldRefresh(error, refresh)) {
                return this.getComments(bug, true)
            }

            throw error;
        }
    },

    hasTagComment(comments: any[], tag: string): boolean {
        return !!comments.find(comment => comment.tags.includes(tag))
    },

    async isBugAlreadyCommentedOn(bug: number, tag: string): Promise<Boolean> {
        const comments = await this.getComments(bug)

        return this.hasTagComment(comments, tag)
    },

    async addCommentTag(id: number, tag: string, refresh = false): Promise<any> {
        const token = await getToken(refresh)

        assertTokenNotNull(token, 'Cannot add tag. Token is null')

        try {
            const tagResponse = await request.put(`https://bugzilla.string.org.in/rest.cgi/bug/comment/${id}/tags?token=${token}`, {
                json: {
                    add: [tag]
                }
            })

            console.log(`Tag Added on comment ${id} `, tagResponse)
            return tagResponse
        } catch(error) {
            if (shouldRefresh(error, refresh)) {
                return this.addCommentTag(id, tag, true)
            }

            throw error;
        }
    },

    // Low level function. All logic to whether comment or not must be handled by caller
    async comment(bug: number, tag: string, comment: string, refresh = false): Promise<any> {
        const token = await getToken(refresh)

        assertTokenNotNull(token, 'Cannot post comments. Token is null')

        const commentUrl = `https://bugzilla.string.org.in/rest.cgi/bug/${bug}/comment`
        try {
            const response = await request.post(`${commentUrl}?token=${token}`, {
                json: {
                    comment: comment,
                    comment_tags: [tag]
                }
            })

            // Unfortunately, we don't have latest bugzilla, so we need to update the comment with a tag instead of adding it
            // at the time of creation

            console.log(`Commented on bug ${bug} `, response)

            return this.addCommentTag(response.id, tag)
        } catch(error) {
            if (shouldRefresh(error, refresh)) {
                return this.comment(bug, tag, comment, true)
            }

            throw error;
        }
    },

    getPullRequestFixingMessage(pullRequest: any): string {
        return `Merging of Pull Request ${pullRequest.html_url} will resolve this bug.\nAuthor: ${pullRequest.user.login}`
    },

    async addFixComment(bug: number, pullRequest: any): Promise<any> {
        const tag = `gh-pr-${pullRequest.number}`

        if (!await this.isBugAlreadyCommentedOn(bug, tag)) {
            return this.comment(bug, tag, this.getPullRequestFixingMessage(pullRequest))
        }
    },

    async addFixCommentForPr(pullRequest: any): Promise<any> {
        const fixedIssues = links.getFixedIssueNumbers(pullRequest.body)

        const promises: any[] = []
        for (let issue of fixedIssues) {
            promises.push(this.addFixComment(issue, pullRequest)
                .catch(console.error))
        }

        return Promise.all(promises)
    }
}
