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

        console.log(`Bug Updated ${JSON.stringify(params)}: ${JSON.stringify(updateResponse)}`)

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

interface PendingRequest {
    pullRequest: WebhookPayloadPullRequestPullRequest,
    id: number,
    try: number
}

let pendingBugs: PendingRequest[] = []

async function executePendingBugs(): Promise<any> {
    const bugIds = pendingBugs.map(bug => bug.id)
    const countMap: { [key: string]: PendingRequest[] } = {
        1: [],
        2: [],
        3: [],
        4: []
    }
    for (let bug of pendingBugs) {
        countMap[bug.try] = [bug, ...countMap[bug.try]]
    }

    // Remove bugs from pending
    pendingBugs = pendingBugs.filter(bug => bugIds.indexOf(bug.id) !== -1)

    const promises = []
    for (let id of Object.keys(countMap)) {
        const pendingRequests = countMap[id]
        if (pendingRequests.length <= 0)
            return
        promises.push(changeBugsToFixed(pendingRequests[0].pullRequest, parseInt(id), pendingRequests.map(bug => bug.id)))
    }
}

export async function changeBugsToFixed(pullRequest: WebhookPayloadPullRequestPullRequest, tryCount: number = 0, bugs?: number[]): Promise<any> {
    if (tryCount > 3) {
        console.log(`Try count exceeds limit. Dropping ${bugs}`)
        return
    }
    console.log('Updating')
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

    const pendingIssues = pendingBugs.map(bug => bug.id)
    const nonPendingIssues = openIssues.filter(id => pendingIssues.indexOf(id) === -1)

    if (nonPendingIssues.length <= 0) {
        console.log(`No non-pending issue left. Waiting for current issues to get finished`)
        return
    }

    for (let bugId of nonPendingIssues) {
        pendingBugs.push({
            pullRequest,
            id: bugId,
            try: tryCount
        })
    }

    const bugsUpdate = {
        ids: nonPendingIssues,
        status: 'RESOLVED',
        resolution: 'FIXED',
        comment: {
            body: 'PR Ready'
        }
    }

    try {
        const response = await updateBugs(bugsUpdate)
        for (let bugId of nonPendingIssues) {
            const index = pendingBugs.map(bug => bug.id).indexOf(bugId)

            if (index !== -1)
                nonPendingIssues.splice(index, 1)
        }
        return response
    } catch(e) {
        throw e
    } finally {
        executePendingBugs().then(() => console.log('Execuyed pending bugs successfully'))
    }
}
