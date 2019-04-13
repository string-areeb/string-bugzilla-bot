require('dotenv').config()
import { safeRun } from "./auth";
import request from 'request-promise';
import { WebhookPayloadPullRequestPullRequest } from "@octokit/webhooks";
import { getFixedRenderedIssueNumbers } from "../links";

interface AccountDetail {
    id: number,
    email: string,
    name: string,
    real_name: string
}

export interface Bug {
    id: number,
    product: string,
    component: string,
    summary: string,
    version: string,
    target_milestone: string,
    serverity: string,
    status: string,
    resolution: string,
    platform: string,
    creation_time: string,
    last_change_time: string,
    creator: string,
    creator_detail: AccountDetail,
    is_creator_accessible: boolean,
    assigned_to: string,
    assigned_to_detail: AccountDetail,
    cc: string[],
    cc_detail: AccountDetail[],
    is_cc_accessible: boolean,
    priority: string,
    deadline: any,
    is_open: boolean,
    is_confirmed: boolean,
    keywords: any[],
    blocks: number[]
    depends_on: number[],
    see_also: number[],
    dupe_of: number | null,
    op_sys: string,
    actual_time: number,
    remaining_time: number,
    update_token: string,
    classification: string,
    qa_contact: string,
    whiteboard: string,
    flags: any[],
    alias: any[],
    groups: any[]
}

export interface BugsResponse {
    bugs: Bug[]
}

export interface BugUpdateParams {
    ids?: number[],
    status?: string,
    resolution?: string
}

export async function getBugs(bugs: number[]): Promise<Bug[]> {
    return safeRun(async (token: string) => {
        const bugResponse = await request(`https://bugzilla.string.org.in/rest.cgi/bug?id=${bugs.join(',')}&token=${token}`)
        return (JSON.parse(bugResponse) as BugsResponse).bugs
    }, 'Cannot get bug')
}

export async function updateBugs(params: BugUpdateParams): Promise<any> {
    if (!params.ids || params.ids.length <= 0)
        throw Error("IDs must be supplied")

    return safeRun(async (token: string) => {
        const updateResponse = await request.put(`https://bugzilla.string.org.in/rest.cgi/bug/${params.ids![0]}?token=${token}`, {
            json: params
        })

        console.log(`Bug Updated ${params}: ${updateResponse}`)

        return updateResponse
    }, 'Cannot get bug')
}

interface PullRequest {
    title: string,
    labels: {
        name: string
    }[]
}

const wipRegex = /^((wip:)|(\[wip\]))/ig

function isPullRequestWorkInProgress(pullRequest: PullRequest): boolean {
    const matches = pullRequest.title.match(wipRegex)
    const wipInTitle = matches && matches.length > 0

    const wipInLabel = pullRequest.labels.some(label => label.name.toLowerCase() === 'wip' || 
        label.name.toLowerCase() == 'work in progress')

    return wipInTitle || wipInLabel
}

export async function changeBugsToFixed(pullRequest: WebhookPayloadPullRequestPullRequest, bugs?: number[]): Promise<any> {
    if (isPullRequestWorkInProgress(pullRequest)) {
        console.warn(`The pull request '${pullRequest.number}: ${pullRequest.title}' with labels ${pullRequest.labels} is Work in Progress, 
        so not changing Bug Status`)
        return
    }

    const fixedBugs = bugs || getFixedRenderedIssueNumbers(pullRequest.body)

    if (fixedBugs.length <= 0) {
        console.log(`No resolved bug for PR ${pullRequest.number}: ${pullRequest.title} with body ${pullRequest.body}`)
        return
    }

    const fixedIssues = await getBugs(fixedBugs)
    const openIssues = fixedIssues.filter(issue => issue.is_open).map(issue => issue.id)

    if (openIssues.length <= 0) {
        console.log(`No open issues left amoung fixes issues: ${fixedIssues.map(issue => { id: issue.id })}`)
        return
    }

    const bugsUpdate = {
        ids: openIssues,
        status: 'RESOLVED',
        resolution: 'FIXED',
        comment: {
            body: 'PR Ready'
        }
    }

    return updateBugs(bugsUpdate)
}
