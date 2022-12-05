import { createConfig, JobNames } from "@getlocalci/create-config";

createConfig(JobNames.JsTest, JobNames.JsLint, JobNames.Vsix);
