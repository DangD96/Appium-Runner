#!/usr/bin/env node 
// AKA use Node to execute this script. Works on Windows or Mac
import { spawn } from "child_process";
import fs from 'fs';
const OS = process.platform;

// CLI Arguments 
const CLI_ARGS = process.argv;           // built in Node array that holds the CLI arguments 
const RELEVANT_ARGS = CLI_ARGS.slice(2); // ARGS[0] is path to Node executable, ARGS[1] is path to script. Don't need them
let YAML = null;          
let TEST_ID = null;        
const MAX_SUPPORTED_ARGS = 2;            // YAML and TEST_ID
const MIN_SUPPORTED_ARGS = 1;

// Configuration
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const JAR_PATH = getPathToJarFile();

main();

function main() {
    const numOfArgs = getNumOfRelevantArgs();
    if (numOfArgs > MAX_SUPPORTED_ARGS) {
        console.log(`Max supported # of arguments: ${MAX_SUPPORTED_ARGS}\nActual # of arguments: ${getNumOfRelevantArgs()}`);
        process.exit(1);
    } else if (numOfArgs < MIN_SUPPORTED_ARGS) {
        console.log("You must provide command line arguments");
        process.exit(1);
    } else {
        let javaArgs = ["-jar", JAR_PATH];
        switch (numOfArgs) {
            case 1:
                // either YAML or TEST_ID. When passed in as CLI argument, TEST_ID can be either a single number or something like "1 2 3"    
                let mysteryArg = RELEVANT_ARGS[0]; 
                if (isNumber(removeAllWhitespace(mysteryArg))) {
                    TEST_ID = mysteryArg;
                    YAML = getDefaultYamlFile();
                    javaArgs.push(YAML);
                    addOverrideTestIDs(javaArgs); 
                } else {
                    YAML = mysteryArg;
                    javaArgs.push(YAML);
                }
                break;
            default:
                YAML = RELEVANT_ARGS[0];
                TEST_ID = RELEVANT_ARGS[1];
                addOverrideTestIDs(javaArgs);
        }
        spawn("java", javaArgs); // spawn separate java process
    }
}

// #region Performers
function addOverrideTestIDs(javaArgs) {
    if (!isMultipleTestIDs()) {
        javaArgs.push(TEST_ID); // single ID
    } else {
        javaArgs.push(TEST_ID.replace(" ", ",")); // multiple IDs. Company appium test runner needs comma delimted list
    }
}

function unsupportedOS(OS) {
    console.log("Unsupported OS: " + OS);
    process.exit(1);
}

function removeAllWhitespace(str) {
    return str.replace(/\s+/g, "");
    /*
        /   = start regex    
        \s  = whitespace
        +   = one or more
        g   = everywhere
    */
}
// #endregion


// #region Getters
// use hardcoded default path if not specified in config.json
function getPathToJarFile() {
    let jarPath;
    if (isWindows(OS)) {
        jarPath = config.windows.jarLocation;
        if (jarPath === "") return "C:\\Appium"; 
        return jarPath;
    } else if (isMacOS(OS)) {
        jarPath = config.macOS.jarLocation;
        if (jarPath === "") return "/Applications/Appium"; 
        return jarPath;
    } else {
        unsupportedOS(OS);
    }
}

function getDefaultYamlFile() {
    if (isWindows(OS)) {
        return config.windows.defaultYamlFile;
    } else if (isMacOS(OS)) {
        return config.macOS.defaultYamlFile;
    } else {
       unsupportedOS(OS);
    }
}

function getNumOfRelevantArgs() {
    return RELEVANT_ARGS.length;
}
// #endregion


// #region Booleans
function isNumber(x) {
    if (x === "" || x === " ") return false; // these eval to 0
    return !Number.isNaN(Number(x));         // real numbers return true. Words eval to NaN
}

// when you pass in "1,2", the TEST_ID variable turns into "1 2"
// comma might be causing powershell to be turning that into an array [1, 2] which then gets parsed back into "1 2" by JavaScript
function isMultipleTestIDs() {
    return TEST_ID.includes(" ");
}

function isWindows(os) {
    return os === "win32";
}

function isMacOS(os) {
    return os === "darwin";
}
// #endregion
