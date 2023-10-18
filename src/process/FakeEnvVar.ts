export default class FakeEnvVar {
  getStep() {
    return {
      run: {
        name: 'Set more environment variables',
        command: `echo 'echo "export CIRCLE_SHA1=037f2d35d59080dc313608c565b55f37d2f42c7e"
        echo "export CIRCLE_BRANCH=develop"
        echo "export CIRCLE_PROJECT_REPONAME=local-ci"
        echo "export CIRCLE_REPOSITORY_URL=git@github.com:getlocalci/local-ci.git"' >> $BASH_ENV`,
      },
    };
  }
}
