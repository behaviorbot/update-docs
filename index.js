/* eslint array-callback-return: 0 */
/* eslint prefer-arrow-callback: 0 */

module.exports = robot => {
    robot.on('pull_request.opened', async context => {
        const files = await context.github.pullRequests.getFiles(context.issue());
        const docs = files.data.find(function (file) {
            if (file.filename.startsWith('README') || file.filename.includes('docs/')) {
                return file;
            }
        });

        if (!docs) {
            // Get config.yml and comment that on the PR
            try {
                const config = await context.config('config.yml');
                const title = context.payload.pull_request.title;
                let whiteList;
                if (config.updateDocsWhiteList) {
                    whiteList = config.updateDocsWhiteList.find(function (item) {
                        if (title.toLowerCase().includes(item.toLowerCase())) {
                            return item;
                        }
                    });
                }
                // Check to make sure it's not whitelisted (ie bug or chore)
                if (!whiteList) {
                    const template = config.updateDocsComment;
                    return context.github.issues.createComment(context.issue({body: template}));
                }
            } catch (err) {
                if (err.code !== 404) {
                    throw err;
                }
            }
        }
    });
};
