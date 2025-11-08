#!/usr/bin/env node 
// aka Use Node to execute this script
// Works on Windows or Mac/Linux
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

/* To use:
    1. Make sure the parent directory of this file and package.json is in your Appium "scripts" directory 
    2. Make sure appium.jar is in your Appium "scripts" directory
    3. Open terminal to cd to this file's parent directory
    4. "npm install ."
    5. Can now call "pickles <yaml> [testids]"" while inside your Appium "scripts" directory to run tests
*/

// process.argv is built in node array containing CLI arguments. This script doesn't need to use index 0 and 1
// '/usr/local/bin/node',                                      // [0] Node executable path
// '/path/to/runner.js',                                       // [1] script path
const ARGS = process.argv.slice(2);
const YAML = ARGS[0];                                          // required
const TEST_IDS = ARGS[1];                                      // optional
const PATH_TO_FILE = fileURLToPath(import.meta.url);           // path to this script
const PARENT_DIRECTORY = path.dirname(PATH_TO_FILE);           // path to this script's parent directory
const SCRIPTS_DIRECTORY = path.dirname(PARENT_DIRECTORY);      // path to the "scripts" directory
const JAR_PATH = path.join(SCRIPTS_DIRECTORY, "appium.jar");   // path to JAR relative to this file

if (!YAML) {
    console.log("Specify a .yaml file name from your Appium/config folder");
    process.exit(1);
}

// spawn separate java process
const JAVA_ARGS = ["-jar", JAR_PATH, YAML];
if (TEST_IDS) JAVA_ARGS.push(TEST_IDS);
spawn("java", JAVA_ARGS);
