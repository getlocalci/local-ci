interface Step {
  checkout?: Record<string, unknown> | string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  attach_workspace?: {
    at?: string;
  };
  // eslint-disable-next-line @typescript-eslint/naming-convention
  persist_to_workspace?: {
    root?: string;
    paths?: Array<string>;
  };
  run?: {
    command?: string;
  };
}

interface Job {
  docker?: Array<Record<string, string>>;
  steps?: Array<Step>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  working_directory?: string;
}

interface ConfigFile {
  jobs: Record<
    string,
    Job
  >;
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