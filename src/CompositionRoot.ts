import ChildProcessGateway from 'gateway/ChildProcessGateway';
import EditorGateway from 'gateway/EditorGateway';
import EnvVar from 'process/EnvVar';
import FsGateway from 'gateway/FsGateway';
import OsGateway from 'gateway/OsGateway';
import ProcessGateway from 'gateway/ProcessGateway';
import ReporterGateway from 'gateway/ReporterGateway';
import AllConfigFiles from 'config/AllConfigFiles';
import AllJobs from 'job/AllJobs';
import BuildAgentSettings from 'config/BuildAgentSettings';
import Children from 'job/Children';
import Images from 'containerization/Images';
import CommandDecorators from 'terminal/CommandDecorators';
import CommandFactory from 'job/ComandFactory';
import Complain from 'command/Complain';
import Config from 'config/Config';
import ConfigFile from 'config/ConfigFile';
import CreateConfigFile from 'command/CreateConfigFile';
import DebugRepo from 'command/DebugRepo';
import Docker from 'containerization/Docker';
import EnterToken from 'command/EnterToken';
import EnvPath from 'common/EnvPath';
import ExitAllJobs from 'command/ExitAllJobs';
import ExitJob from 'command/ExitJob';
import FinalTerminal from 'terminal/FinalTerminal';
import Help from 'command/Help';
import JobFactory from 'job/JobFactory';
import JobListener from 'job/JobListener';
import JobProviderFactory from 'job/JobProviderFactory';
import JobRunner from 'job/JobRunner';
import JobTerminals from 'terminal/JobTerminals';
import LatestCommittedImage from 'containerization/LatestCommittedImage';
import LocalCi from './common/LocalCi';
import LogFactory from 'log/LogFactory';
import LogFile from 'log/LogFile';
import LogProviderFactory from 'log/LogProviderFactory';
import NativeCommandFactory from 'job/NativeComandFactory';
import ParsedConfig from 'config/ParsedConfig';
import Persistence from 'process/Persistence';
import PipelineParameter from 'config/PipelineParameter';
import ProcessFile from 'process/ProcessFile';
import Refresh from 'command/Refresh';
import RegistrarFactory from 'common/RegistrarFactory';
import ReRunJob from 'command/ReRunJob';
import Retryer from 'job/Retryer';
import RunJob from 'command/RunJob';
import RunningContainer from 'containerization/RunningContainer';
import RunWalkthroughJob from 'command/RunWalkthroughJob';
import SelectRepo from 'command/SelectRepo';
import ShowLogFile from 'command/ShowLogFile';
import Spawn from 'common/Spawn';
import StartDocker from 'command/StartDocker';
import TryProcessAgain from 'command/TryProcessAgain';
import UncommittedFile from 'containerization/UncommittedFile';
import Volume from 'containerization/Volume';
import WarningCommandFactory from 'job/WarningCommandFactory';
import WarningFactory from 'job/WarningFactory';
import Workspace from 'common/Workspace';

const childProcessGateway = new ChildProcessGateway();
const editorGateway = new EditorGateway();
const fsGateway = new FsGateway();
const osGateway = new OsGateway();
const processGateway = new ProcessGateway();
const reporterGateway = new ReporterGateway();

const parsedConfig = new ParsedConfig(fsGateway);
const allJobs = new AllJobs(parsedConfig);
const envPath = new EnvPath(osGateway, processGateway);
const workspace = new Workspace(editorGateway);
const commandFactory = new CommandFactory(editorGateway);
const jobFactory = new JobFactory(editorGateway);
const logFactory = new LogFactory(editorGateway);
const warningFactory = new WarningFactory(editorGateway);
const warningCommandFactory = new WarningCommandFactory(warningFactory);
const spawn = new Spawn(envPath, processGateway, workspace);
const buildAgentSettings = new BuildAgentSettings(
  childProcessGateway,
  osGateway,
  spawn
);
const children = new Children(
  commandFactory,
  editorGateway,
  jobFactory,
  logFactory,
  new NativeCommandFactory(),
  warningCommandFactory,
  warningFactory
);
const pipelineParameter = new PipelineParameter(fsGateway);
const envVar = new EnvVar(childProcessGateway, spawn);
const volume = new Volume(fsGateway);
const persistence = new Persistence(volume);
const processFile = new ProcessFile(envVar, fsGateway, persistence);

const config = new Config(
  childProcessGateway,
  editorGateway,
  fsGateway,
  pipelineParameter,
  processFile,
  spawn
);
const allConfigFiles = new AllConfigFiles(editorGateway);
const configFile = new ConfigFile(
  allConfigFiles,
  editorGateway,
  reporterGateway
);

const createConfigFile = new CreateConfigFile(editorGateway, reporterGateway);
const debugRepo = new DebugRepo(editorGateway, reporterGateway);
const docker = new Docker(childProcessGateway, spawn);
const enterToken = new EnterToken(editorGateway);
const images = new Images(childProcessGateway, spawn);
const exitAllJobs = new ExitAllJobs(images, editorGateway, reporterGateway);
const finalTerminal = new FinalTerminal(
  childProcessGateway,
  editorGateway,
  spawn
);
const logFile = new LogFile(editorGateway);
const jobListener = new JobListener(
  childProcessGateway,
  images,
  configFile,
  editorGateway,
  fsGateway,
  logFile,
  parsedConfig,
  spawn
);

const latestCommittedImage = new LatestCommittedImage(
  spawn,
  childProcessGateway
);
const runningContainer = new RunningContainer(spawn, childProcessGateway);
const uncommittedFile = new UncommittedFile(
  childProcessGateway,
  editorGateway,
  spawn
);

const jobRunner = new JobRunner(
  buildAgentSettings,
  new CommandDecorators(editorGateway),
  configFile,
  editorGateway,
  finalTerminal,
  fsGateway,
  images,
  jobFactory,
  jobListener,
  latestCommittedImage,
  parsedConfig,
  runningContainer,
  uncommittedFile
);
const jobTerminals = new JobTerminals(editorGateway);
const exitJob = new ExitJob(jobFactory, jobRunner, jobTerminals);
const retryer = new Retryer();
const jobProviderFactory = new JobProviderFactory(
  allConfigFiles,
  children,
  configFile,
  commandFactory,
  docker,
  editorGateway,
  fsGateway,
  config,
  jobFactory,
  logFactory,
  reporterGateway,
  retryer,
  warningFactory,
  allJobs
);

const registrarFactory = new RegistrarFactory(
  new Complain(editorGateway),
  configFile,
  createConfigFile,
  debugRepo,
  enterToken,
  exitAllJobs,
  exitJob,
  new Help(editorGateway, reporterGateway),
  new LogProviderFactory(fsGateway),
  new Refresh(),
  new ReRunJob(editorGateway, jobRunner, jobTerminals, reporterGateway),
  new RunJob(editorGateway, jobRunner, reporterGateway),
  new RunWalkthroughJob(config, configFile, editorGateway, reporterGateway),
  new SelectRepo(allConfigFiles, images, editorGateway, reporterGateway),
  new ShowLogFile(logFile),
  new StartDocker(childProcessGateway, envPath, spawn),
  new TryProcessAgain(configFile, fsGateway),
  editorGateway
);

export const app = new LocalCi(
  fsGateway,
  jobProviderFactory,
  registrarFactory,
  reporterGateway
);
