const yaml = require('js-yaml');

module.exports = robot => {
    robot.on('pull_request.opened', async context => {
        const owner = context.payload.repository.owner.login;
        const repo = context.payload.repository.name;
        const number = context.payload.pull_request.number;
        let config;

        const files = await context.github.pullRequests.getFiles({ owner, repo, number });
        const docs = files.data.find(function (file) {
            if (file.filename === 'README.md' || file.filename.includes('docs/')) {
                return file;
            }
        });

        if (!docs) {
            // Get config.yml and comment that on the PR
            try {
                const options = context.repo({path: '.github/config.yml'});
                const response = await context.github.repos.getContent(options);
                config = yaml.load(Buffer.from(response.data.content, 'base64').toString()) || {};
            } catch (err) {
                if (err.code !== 404) throw err;
            }
            if (config) {
                const title = context.payload.pull_request.title;
                const whiteList = config.whiteList.find(function (item) {
                    if (title.includes(item)) return item;
                });
                // Check to make sure it's not whitelisted (ie bug or chore)
                if (!whiteList) {
                    const template = config.updateDocsComment;
                    robot.log(template);
                    return context.github.issues.createComment(context.issue({body: template}));
                }
            }
        }
    });
};
