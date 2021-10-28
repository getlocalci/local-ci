function getRepos(): Record<string, string> {
  return {
    'passwords-evolved': 'foo/baz/passwords-evolved',
    'local-ci': 'example/bar/local-ci',
  };
}

export default function getConfigUi(): string {
  const repos = getRepos();
  if (!Object.keys(repos)) {
    return '';
  }

  const selectId = 'local-ci-config';
  const helpId = 'local-ci-config-help';
  return `
    <label for="${selectId}">Repo to run CI on</label>
    <select id="${selectId}" aria-describedby="${helpId}">
      ${Object.keys(repos).map((repoDirname) => {
        return `<option value="${repos[repoDirname]}">
          ${repoDirname}
        </option>`;
      })}
    </select>
    <p id="l${helpId}">
      There are multiple repos in this workspace with a <code>.circleci/config.yml</code> file.
    </p>`;
}
