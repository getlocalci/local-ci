interface Orb {
  orbs?: Record<string, unknown>;
  commands?: Record<string, unknown>;
  jobs: Jobs;
}

interface Orbs {
  [key: string]: Orb;
}

interface Jobs {
  [key: string]: Job;
}

interface CiConfigWithJobs {
  orbs?: Orbs;
  jobs: Jobs;
  workflows: {
    [key: string]: {
      jobs: (Record<string, Record<string, unknown>>|string)[];
    }
  }
}

type CiConfig = CiConfigWithJobs | undefined;

interface ConfigFileQuickPick {
  label: string;
  description: string;
  fsPath: string;
}

interface DynamicCache {
  '.Branch': string;
  '.BuildNum': string;
  '.Environment.variableName': string;
  '.Revision': string;
  epoch: string;
}

interface SpawnOptions {
  cwd: string;
  env: {
    PATH: string;
    [key: string]: any;
  };
}

interface ErrorWithMessage {
  message: string;
}
