import {  WebhookPayloadPullRequestPullRequest } from "@octokit/webhooks";
import links = require("../links");
import { Context } from "probot";
import { ChecksCreateParamsOutput } from "@octokit/rest";

type conclusion = "success"
| "failure"
| "neutral"
| "cancelled"
| "timed_out"
| "action_required"

export async function handlePullRequestChange(context: Context) {
    const pull: WebhookPayloadPullRequestPullRequest = context.payload.pull_request
    const head = pull.head
    const fixedIssues = links.getFixedRenderedIssueNumbers(pull.body)

    let conclusion: conclusion = <'success'> 'success'
    let output: ChecksCreateParamsOutput
    const isDevPr = pull.labels.some(label => label.name === 'dev')

    if (fixedIssues.length > 0) {
        output = {
            title: 'Linked issues will be resolved on merging of PR',
            summary: `Following issues will be resolved on merging of this PR: ${fixedIssues.map(issue => links.getBugzillaLink(issue))}`
        }
    } else if (isDevPr) {
        output = {
            title: 'Issue linking not required for dev PRs',
            summary: 'Dev Module PRs don\'t require linking issues, hence skipping the check'
        }
    } else {
        conclusion = <'failure'> 'failure'
        output = {
            title: 'Please link a bugzilla issue in the PR body',
            summary: `No issue was found linked to the PR body. Please link a bugzilla issue in the PR in the format \`Fixes !2345\` where 2345 is the bug ID, 
            or mark this PR as a development module by adding a label to it named \`dev\``
        }
    }

    const status = {
      name: 'PR Link Check',
      head_sha: head.sha,
      status: <'completed'> 'completed',
      completed_at: new Date().toISOString(),
      conclusion: conclusion,
      output: output,
      details_url: `${pull.html_url}/checks`
    }

    await context.github.checks.create(context.repo(status))
}
