interface SaveCache {
  key: string;
  paths: Array<string>;
}

// See https://circleci.com/docs/2.0/configuration-reference/
interface FullStep {
  checkout?: Record<string, unknown> | string;
  attach_workspace?: {
    at: string;
  };
  persist_to_workspace?: {
    root: string;
    paths: Array<string>;
  };
  save_cache?: SaveCache;
  restore_cache?: {
    key?: string;
    keys?: Array<string>;
  };
  run?: {
    command: string;
    name?: string;
    environment?: {
      [key: string]: string;
    };
  } | string;
  'continuation/continue'?: {
    configuration_path: string;
    parameters?: string;
  };
  [key: string]: unknown;
}

type Step = FullStep | string | 'checkout';

interface Job {
  docker?: Array<Record<string, string>>;
  steps?: Step[];
  working_directory?: string;
  machine?: { image?: string };
}

type RunningTerminal = number | undefined;
interface RunningTerminals {
  [key: string]: RunningTerminal[]
}

interface Orb {
  orbs?: Record<string, unknown>;
  commands?: Record<string, unknown>;
  jobs?: Jobs;
}

interface Jobs {
  [key: string]: Job;
}

interface CiConfigWithJobs {
  orbs?: { [key: string]: Orb };
  jobs?: Jobs;
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

declare module '*.sh' {
  const content: any;
  export = content;
}

declare module '*.yml' {
  const content: any;
  export = content;
}
