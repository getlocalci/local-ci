import * as os from 'os';
import * as path from 'path';

export const RUN_JOB_COMMAND = 'local-ci.runJob';
export const TMP_PATH = path.join(os.tmpdir(), 'local-ci');
export const PROCESS_FILE_PATH = path.join(TMP_PATH, 'process.yml');
