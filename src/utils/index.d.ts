interface ConfigFileWithJobs {
  jobs: Record<
    string,
    Job
  >;
}

type ConfigFile = ConfigFileWithJobs | null;

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
