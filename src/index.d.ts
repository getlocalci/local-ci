interface SaveCache {
  key: string;
  paths: Array<string>;
}

interface Checkout {
  path: string;
}

// See https://circleci.com/docs/2.0/configuration-reference/
interface FullStep {
  checkout?: Checkout;
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

interface Docker {
  [key: string]: string;
}

interface Job {
  docker?: Docker[];
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

interface WorkflowJobs {
  jobs: {[key: string]: {[key: string]: unknown} | string }[];
}

interface CiConfigWithWorkflows {
  orbs?: { [key: string]: Orb };
  jobs?: Jobs;
  workflows: {
    [key: string]: WorkflowJobs;
  }
}

type CiConfig = CiConfigWithWorkflows | undefined;

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
