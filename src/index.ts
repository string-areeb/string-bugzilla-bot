import { Application, Context } from 'probot' // eslint-disable-line no-unused-vars
import links from './links'

export = (app: Application) => {
  app.on('issues.opened', async (context: Context) => {
    const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
    await context.github.issues.createComment(issueComment)
  })

  // Unfurl Bugzilla Links

  app.on('issue_comment.created', async (context: Context) => {
    const body = links.replaceLinks(context.payload.comment.body)

    await context.github.issues.updateComment(context.repo({
      comment_id: context.payload.comment.id,
      body
    }))
  })

  app.on(['issues.opened', 'pull_request.opened'], async (context: Context) => {

  })
}
