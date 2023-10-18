import FakeChildProcessGateway from 'gateway/FakeChildProcessGateway';
import FakeEditorGateway from 'gateway/FakeEditorGateway';
import FakeEnvVar from 'process/FakeEnvVar';
import FakeFsGateway from 'gateway/FakeFsGateway';
import FakeHttpGateway from 'gateway/FakeHttpGateway';
import FakeOsGateway from 'gateway/FakeOsGateway';
import FakeProcessGateway from 'gateway/FakeProcessGateway';
import FakeReporterGateway from 'gateway/FakeReporterGateway';
import AllConfigFiles from 'config/AllConfigFiles';
import AllJobs from 'job/AllJobs';
import BuildAgentSettings from 'config/BuildAgentSettings';
import Children from 'job/Children';
import Images from 'containerization/Images';
import ChildProcessGateway from 'gateway/ChildProcessGateway';
import CommandDecorators from 'terminal/CommandDecorators';
import CommandFactory from 'job/ComandFactory';
import Complain from 'command/Complain';
import Config from 'config/Config';
import ConfigFile from 'config/ConfigFile';
import CreateConfigFile from 'command/CreateConfigFile';
import DebugRepo from 'command/DebugRepo';
import Docker from 'containerization/Docker';
import EditorGateway from 'gateway/EditorGateway';
import Email from 'license/Email';
import EnterLicense from 'command/EnterLicense';
import EnterToken from 'command/EnterToken';
import EnvPath from 'common/EnvPath';
import EnvVar from 'process/EnvVar';
import ExitAllJobs from 'command/ExitAllJobs';
import ExitJob from 'command/ExitJob';
import FinalTerminal from 'terminal/FinalTerminal';
import FirstActivation from 'job/FirstActivation';
import FsGateway from 'gateway/FsGateway';
import GetLicense from 'command/GetLicense';
import Help from 'command/Help';
import HttpGateway from 'gateway/HttpGateway';
import JobFactory from 'job/JobFactory';
import JobListener from 'job/JobListener';
import JobProviderFactory from 'job/JobProviderFactory';
import JobRunner from 'job/JobRunner';
import JobTerminals from 'terminal/JobTerminals';
import LatestCommittedImage from 'containerization/LatestCommittedImage';
import License from 'license/License';
import LicenseInput from 'license/LicenseInput';
import LicensePresenter from 'license/LicensePresenter';
import LicenseProviderFactory from 'license/LicenseProviderFactory';
import LocalCi from '../common/LocalCi';
import LogFactory from 'log/LogFactory';
import LogFile from 'log/LogFile';
import LogProviderFactory from 'log/LogProviderFactory';
import NativeCommandFactory from 'job/NativeComandFactory';
import OsGateway from 'gateway/OsGateway';
import ParsedConfig from 'config/ParsedConfig';
import Persistence from 'process/Persistence';
import PipelineParameter from 'config/PipelineParameter';
import ProcessFile from 'process/ProcessFile';
import ProcessGateway from 'gateway/ProcessGateway';
import Refresh from 'command/Refresh';
import RegistrarFactory from 'common/RegistrarFactory';
import ReRunJob from 'command/ReRunJob';
import Retryer from 'job/Retryer';
import RunJob from 'command/RunJob';
import RunningContainer from 'containerization/RunningContainer';
import RunWalkthroughJob from 'command/RunWalkthroughJob';
import SelectRepo from 'command/SelectRepo';
import Spawn from 'common/Spawn';
import TryProcessAgain from 'command/TryProcessAgain';
import UncommittedFile from 'containerization/UncommittedFile';
import WarningCommandFactory from 'job/WarningCommandFactory';
import WarningFactory from 'job/WarningFactory';
import Workspace from 'common/Workspace';
import RefreshLicenseTree from 'command/RefreshLicenseTree';
import ShowLogFile from 'command/ShowLogFile';
import StartDocker from 'command/StartDocker';
import ReporterGateway from 'gateway/ReporterGateway';
import Volume from 'containerization/Volume';

export default function getContainer() {
  const childProcessGateway =
    new FakeChildProcessGateway() as unknown as ChildProcessGateway;
  const editorGateway = new FakeEditorGateway() as unknown as EditorGateway;
  const envVar = new FakeEnvVar() as unknown as EnvVar;
  const fsGateway = new FakeFsGateway() as unknown as FsGateway;
  const httpGateway = new FakeHttpGateway() as unknown as HttpGateway;
  const osGateway = new FakeOsGateway() as unknown as OsGateway;
  const processGateway = new FakeProcessGateway() as unknown as ProcessGateway;
  const reporterGateway =
    new FakeReporterGateway() as unknown as ReporterGateway;
  const volume = new Volume(fsGateway);

  const parsedConfig = new ParsedConfig(fsGateway);

  const allJobs = new AllJobs(parsedConfig);
  const envPath = new EnvPath(osGateway, processGateway);
  const workspace = new Workspace(editorGateway);

  const spawn = new Spawn(envPath, processGateway, workspace);
  const buildAgentSettings = new BuildAgentSettings(
    childProcessGateway,
    osGateway,
    spawn
  );
  const commandFactory = new CommandFactory(editorGateway);
  const jobFactory = new JobFactory(editorGateway);
  const logFactory = new LogFactory(editorGateway);
  const warningFactory = new WarningFactory(editorGateway);
  const warningCommandFactory = new WarningCommandFactory(warningFactory);

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
  const email = new Email(editorGateway, httpGateway, reporterGateway);
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

  const commandDecorators = new CommandDecorators(editorGateway);
  const jobRunner = new JobRunner(
    buildAgentSettings,
    commandDecorators,
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
  const getLicense = new GetLicense(editorGateway);
  const license = new License(editorGateway, httpGateway);
  const retryer = new Retryer();
  const jobProviderFactory = new JobProviderFactory(
    allConfigFiles,
    children,
    configFile,
    commandFactory,
    docker,
    editorGateway,
    fsGateway,
    license,
    config,
    jobFactory,
    logFactory,
    reporterGateway,
    retryer,
    warningFactory,
    allJobs
  );

  const licenseInput = new LicenseInput(editorGateway, license);
  const licensePresenter = new LicensePresenter(license);
  const licenseProviderFactory = new LicenseProviderFactory(
    license,
    licenseInput,
    licensePresenter,
    editorGateway
  );
  const complain = new Complain(editorGateway);
  const help = new Help(editorGateway, reporterGateway);
  const registrarFactory = new RegistrarFactory(
    complain,
    configFile,
    createConfigFile,
    debugRepo,
    new EnterLicense(licenseInput),
    enterToken,
    exitAllJobs,
    exitJob,
    new FirstActivation(editorGateway, reporterGateway, email),
    getLicense,
    help,
    licenseInput,
    new LogProviderFactory(fsGateway),
    new Refresh(),
    new RefreshLicenseTree(editorGateway),
    new ReRunJob(editorGateway, jobRunner, jobTerminals, reporterGateway),
    new RunJob(editorGateway, jobRunner, reporterGateway),
    new RunWalkthroughJob(config, configFile, editorGateway, reporterGateway),
    new SelectRepo(allConfigFiles, images, editorGateway, reporterGateway),
    new ShowLogFile(logFile),
    new StartDocker(childProcessGateway, envPath, spawn),
    new TryProcessAgain(configFile, fsGateway),
    editorGateway
  );

  const localCi = new LocalCi(
    fsGateway,
    jobProviderFactory,
    licenseProviderFactory,
    registrarFactory,
    reporterGateway
  );

  return {
    allConfigFiles,
    buildAgentSettings,
    childProcessGateway,
    commandDecorators,
    complain,
    configFile,
    createConfigFile,
    debugRepo,
    docker,
    editorGateway,
    email,
    envPath,
    envVar,
    finalTerminal,
    fsGateway,
    help,
    httpGateway,
    images,
    jobFactory,
    jobProviderFactory,
    jobTerminals,
    license,
    licenseInput,
    licensePresenter,
    localCi,
    osGateway,
    parsedConfig,
    processFile,
    processGateway,
    reporterGateway,
    spawn,
    uncommittedFile,
    volume,
    workspace,
  };
}
