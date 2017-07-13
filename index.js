const yaml = require('js-yaml');

module.exports = robot => {
    robot.on('pull_request.opened', async context => {
        robot.log(context.payload);
        const owner = context.payload.repository.owner.login;
        const repo = context.payload.repository.name;
        const number = context.payload.pull_request.number;
        let config;

        const files = await context.github.pullRequests.getFiles({ owner, repo, number });
        let docs = files.data.find(function (file) {
            if (file.filename === 'README.md' || file.filename.includes('docs/')) {
                return file;
            }
        });

        if (!docs) {
            // Get update-docs.yml and comment that on the PR
            try {
                const options = context.repo({path: '.github/config.yml'});
                const response = await context.github.repos.getContent(options);
                config = yaml.load(Buffer.from(response.data.content, 'base64').toString()) || {};
            } catch (err) {
                if (err.code !== 404) throw err;
            }
            if (config) {
                const title = context.payload.pull_request.title;
                //let whiteList = false;
                let whiteList = config.whiteList.find(function (item) {
                    if (title.includes(item)) return item;
                });

                if (!whiteList) {
                    const template = config.updateDocsComment;
                    robot.log(template);
                    return context.github.issues.createComment(context.issue({body: template}));
                }
            }
            //Also check to mkae sure it's not part of the blacklist (ie bug fix or chore)
        }
    });
};
