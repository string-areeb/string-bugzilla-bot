require('dotenv').config()
import { safeRun } from "./auth";
import request from 'request-promise';

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

export interface BugzillaResponse<T> {
    [key: string ]: T
}

export async function getBug(bug: number): Promise<Bug> {
    return safeRun(async (token: string) => {
        const bugResponse = await request(`https://bugzilla.string.org.in/rest.cgi/bug/${bug}?token=${token}`)
        return (JSON.parse(bugResponse) as BugzillaResponse<Bug>).bugs
    }, 'Cannot get bug')
}
