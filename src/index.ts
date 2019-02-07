import { Application, Context } from 'probot' // eslint-disable-line no-unused-vars
import links from './links'

export = (app: Application) => {
  // Unfurl Bugzilla Links

  app.on(['issue_comment.created', 'issue_comment.edited'], async (context: Context) => {
    const body = links.replaceLinks(context.payload.comment.body)

    await context.github.issues.updateComment(context.repo({
      comment_id: context.payload.comment.id,
      body
    }))
  })

  app.on(['issues.opened', 'issues.edited'], async (context: Context) => {
    const body = links.replaceLinks(context.payload.issue.body)

    await context.github.issues.update(context.issue({
      body
    }))
  })

  app.on(['pull_request.opened', 'pull_request.edited'], async (context: Context) => {
    const body = links.replaceLinks(context.payload.pull_request.body)

    await context.github.pullRequests.update(context.issue({
      body
    }))
  })
}
