const expect = require('expect');
const yaml = require('js-yaml');
const {createRobot} = require('probot');
const plugin = require('..');
const successEvent = require('./events/successEvent');
//const failEvent = require('./events/failEvent');

describe('update-docs', () => {
    let robot;
    let github;

    beforeEach(() => {
        robot = createRobot();
        plugin(robot);

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
                    data: [ {"filename": "help.yml"}, {"filename": "index.js"} ]
                }))
            }
        };
        robot.auth = () => Promise.resolve(github);
    });

    describe('update docs success', () => {
        it('posts a comment because the user did NOT update the docs', async () => {
            await robot.receive(successEvent);

            expect(github.pullRequests.getFiles).toHaveBeenCalledWith({
                owner: 'hiimbex',
                repo: 'testing-things',
                number: 21
            });
            expect(github.repos.getContent).toHaveBeenCalledWith({
                owner: 'hiimbex',
                repo: 'testing-things',
                path: '.github/config.yml'
            });
            expect(github.issues.createComment).toHaveBeenCalled();
        });
    });

    // describe('update docs fail fail', () => {
    //     beforeEach(() => {
    //         github.repos.getContent = expect.createSpy().andReturn(Promise.resolve({
    //             data: {
    //                 content: Buffer.from(` `).toString('base64')
    //             }
    //         }));
    //     });
    // 
    //     it('does not post a comment because the user did update documentation', async () => {
    //         await robot.receive(failEvent);
    // 
    //         expect(github.repos.getContent).toHaveBeenCalledWith({
    //             owner: 'hiimbex',
    //             repo: 'testing-things',
    //             path: '.github/request-info.yml'
    //         });
    // 
    //         expect(github.issues.createComment).toNotHaveBeenCalled();
    //         expect(github.issues.addLabels).toNotHaveBeenCalled();
    //     });
    // });
});
