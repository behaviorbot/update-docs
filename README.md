# update-docs

> a GitHub App built with [probot](https://github.com/probot/probot) that comments on newly opened Pull Requests that do not update either the README or a files in the `/docs` folder. 

<img width="810" alt="screen shot 2017-07-12 at 2 59 22 pm" src="https://user-images.githubusercontent.com/13410355/28179044-97207bee-67b5-11e7-80d0-0c8ede4a325f.png">

## Usage

1. Install the bot on the intended repositories. The plugin requires the following **Permissions and Events**:
- Pull requests: **Read & Write**
  - [x] check the box for **Pull Request** events
2. Add a `.github/config.yml` file that contains the contents you would like to reply within an `updateDocsComment`
3. Optionally, you can also add a `whiteList` that includes terms, that if found in the title, the bot will not comment on.
```yml
# Configuration for update-docs - https://github.com/behaviorbot/update-docs

# Comment to be posted to on PRs that don't update documentation
updatesDocsComment: >
  Thanks for opening this pull request! The maintainers of this repository would appreciate it if you would update some of our documentation based on your changes.

whiteList:
  - bug
  - chore
```

## Setup

```
# Install dependencies
npm install

# Run the bot
npm start
```

See [the probot deployment docs](https://github.com/probot/probot/blob/master/docs/deployment.md) if you would like to run your own instance of this plugin.
