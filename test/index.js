const expect = require('expect')
const {createRobot} = require('probot')
const plugin = require('..')
const payload = require('./events/payload')

describe('update-docs', () => {
  let robot
  let github

  beforeEach(() => {
    robot = createRobot()
    plugin(robot)

    github = {
      repos: {
        getContent: expect.createSpy().andReturn(Promise.resolve({
          data: {
            content: Buffer.from(`whiteList:\n  - bug\n  - chore`).toString('base64')
          }
        }))
      },
      issues: {
        createComment: expect.createSpy()
      },
      pullRequests: {
        getFiles: expect.createSpy().andReturn(Promise.resolve({
          data: [{filename: 'help.yml'}, {filename: 'index.js'}]
        }))
      }
    }
    robot.auth = () => Promise.resolve(github)
  })

  describe('update docs success', () => {
    it('posts a comment because the user did NOT update the docs', async () => {
      await robot.receive(payload)

      expect(github.pullRequests.getFiles).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        number: 21
      })
      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        path: '.github/config.yml'
      })
      expect(github.issues.createComment).toHaveBeenCalled()
    })
  })

  describe('update docs fail', () => {
    beforeEach(() => {
      github.pullRequests.getFiles = expect.createSpy().andReturn(Promise.resolve({
        data: [{filename: '/lib/main.js'}, {filename: '/docs/main.md'}]
      }))
    })

    it('does not post a comment because the user DID update documentation in /docs', async () => {
      await robot.receive(payload)

      expect(github.pullRequests.getFiles).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        number: 21
      })
      expect(github.repos.getContent).toNotHaveBeenCalled()
      expect(github.issues.createComment).toNotHaveBeenCalled()
    })
  })

  describe('update docs fail', () => {
    beforeEach(() => {
      github.pullRequests.getFiles = expect.createSpy().andReturn(Promise.resolve({
        data: [{filename: '/lib/main.js'}, {filename: '/README.md'}]
      }))
    })

    it('does not post a comment because the user DID update README.md', async () => {
      await robot.receive(payload)

      expect(github.pullRequests.getFiles).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        number: 21
      })
      expect(github.repos.getContent).toNotHaveBeenCalled()
      expect(github.issues.createComment).toNotHaveBeenCalled()
    })
  })
})
