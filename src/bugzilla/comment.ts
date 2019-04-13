require('dotenv').config()
import { safeRun } from "./auth";
import request from 'request-promise';
import { getFixedIssueNumbers } from "../links";

interface TagContainer {
    tags: string[]
}

interface Comment extends TagContainer {
    id: number,
    bug_id: number,
    text: string
    count: number,
    creator: string,
    attachment_id: string,
    creation_time: string,
    is_private: boolean
}

interface CommentResponse {
    bugs: { 
        [key: string]: {
            comments: Comment[]
        }
    } 
}

export async function getComments(bug: number): Promise<Comment[]> {
    return safeRun(async (token: string) => {
        const commentsResponse = await request(`https://bugzilla.string.org.in/rest.cgi/bug/${bug}/comment?token=${token}`)
        return (JSON.parse(commentsResponse) as CommentResponse).bugs[bug.toString()].comments
    }, 'Cannot get comments')
}

export function hasTagComment(comments: TagContainer[], tag: string): boolean {
    return !!comments.find(comment => comment.tags.includes(tag))
}

async function isBugAlreadyCommentedOn(bug: number, tag: string): Promise<Boolean> {
    const comments = await getComments(bug)

    return hasTagComment(comments, tag)
}

async function addCommentTag(id: number, tag: string, refresh = false): Promise<any> {
    return safeRun(async (token: string) => {
        const tagResponse = await request.put(`https://bugzilla.string.org.in/rest.cgi/bug/comment/${id}/tags?token=${token}`, {
            json: {
                add: [tag]
            }
        })

        console.log(`Tag Added on comment ${id} `, tagResponse)
        return tagResponse
    }, 'Cannot add tag')
}

// Low level function. All logic to whether comment or not must be handled by caller
async function postComment(bug: number, tag: string, comment: string, refresh = false): Promise<any> {
    return safeRun(async (token: string) => {
        const commentUrl = `https://bugzilla.string.org.in/rest.cgi/bug/${bug}/comment`
        const response = await request.post(`${commentUrl}?token=${token}`, {
            json: {
                comment: comment,
                comment_tags: [tag]
            }
        })

        // Unfortunately, we don't have latest bugzilla, so we need to update the comment with a tag instead of adding it
        // at the time of creation

        console.log(`Commented on bug ${bug} `, response)

        return addCommentTag(response.id, tag)
    }, 'Cannot post comments')
}

function getPullRequestFixingMessage(pullRequest: any): string {
    return `Merging of Pull Request ${pullRequest.html_url} will resolve this bug.\nAuthor: ${pullRequest.user.login}`
}

async function addFixComment(bug: number, pullRequest: any): Promise<any> {
    const tag = `gh-pr-${pullRequest.number}`

    if (!await isBugAlreadyCommentedOn(bug, tag)) {
        return postComment(bug, tag, getPullRequestFixingMessage(pullRequest))
    }
}

export async function addFixCommentForPr(pullRequest: any): Promise<any> {
    const fixedIssues = getFixedIssueNumbers(pullRequest.body)

    const promises: any[] = []
    for (let issue of fixedIssues) {
        promises.push(addFixComment(issue, pullRequest)
            .catch(console.error))
    }

    return Promise.all(promises)
}
