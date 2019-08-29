import { Application, Context } from 'probot' // eslint-disable-line no-unused-vars
import { handlePullRequestChange, handleCheckRun, handleCheckSuite } from './checks'
import { addFixCommentForPr } from './bugzilla/comment'
import { replaceLinks } from './links'
import { changeBugsToFixed, addMilestoneToIssue } from './bugzilla/bugs'
import { Request, Response } from 'express'
import { getSummary } from './bugzilla/summary'

export = (app: Application) => {
  // Unfurl Bugzilla Links

  const router = app.route('/bugzilla')

  router.get('/summary/:product/:target_milestone', async (req: Request, res: Response) => {
    res.send(JSON.stringify(await getSummary(req.params.product, req.params.target_milestone), null, 2))
  })

  app.on(['issue_comment.created', 'issue_comment.edited'], async (context: Context) => {
    const body = replaceLinks(context.payload.comment.body)

    await context.github.issues.updateComment(context.repo({
      comment_id: context.payload.comment.id,
      body
    }))
  })

  app.on(['issues.opened', 'issues.edited'], async (context: Context) => {
    const body = replaceLinks(context.payload.issue.body)

    await context.github.issues.update(context.issue({
      body
    }))
  })

  app.on(['pull_request.opened', 'pull_request.edited'], async (context: Context) => {
    const body = replaceLinks(context.payload.pull_request.body)

    await context.github.pulls.update(context.issue({
      body
    }))
  })

  app.on(['pull_request.opened', 'pull_request.edited'], async (context: Context) => {
    await addFixCommentForPr(context.payload.pull_request)
  })

  app.on(['pull_request.opened', 'pull_request.edited'], async (context: Context) => {
    await addMilestoneToIssue(context)
  })

  app.on([
    'pull_request.opened',
    'pull_request.edited',
    'pull_request.labeled',
    'pull_request.unlabeled'], async (context: Context) => {
    await handlePullRequestChange(context)
  })

  app.on(['check_run.rerequested'], async (context: Context) => {
    await handleCheckRun(context)
  })

  app.on(['check_suite.requested', 'check_suite.rerequested'], async (context: Context) => {
    await handleCheckSuite(context)
  })

  app.on(['pull_request.unlabeled'], async (context: Context) => {
    await changeBugsToFixed(context.payload.pull_request)
  })
}
