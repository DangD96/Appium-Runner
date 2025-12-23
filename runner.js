#!/usr/bin/env node 
// AKA use Node to execute this script. Works on Windows and Mac

import { spawn } from "child_process";
import fs from 'fs';
const OS = process.platform;

// CLI 
const CLI_ARGS = process.argv;            // built in Node array that holds the CLI arguments 
const RELEVANT_ARGS = CLI_ARGS.slice(2);  // CLI_ARGS[0] is path to Node executable, CLI_ARGS[1] is path to script. Don't need them       
const MAX_SUPPORTED_ARGS = 2;             // yaml and testIDString
const MIN_SUPPORTED_ARGS = 1;

// Config
const CONFIG = getConfigFromJson();
const JAR_PATH = getPathToJarFile();

main();

function main() {
    const numOfArgs = RELEVANT_ARGS.length;
    if (numOfArgs > MAX_SUPPORTED_ARGS) {
        console.error(`Max supported # of arguments: ${MAX_SUPPORTED_ARGS}\nActual # of arguments: ${numOfArgs}`);
        process.exit(1);
    } else if (numOfArgs < MIN_SUPPORTED_ARGS) {
        console.error("You must provide command line arguments");
        process.exit(1);
    } else {
        let javaArgs = ["-jar", JAR_PATH];
        let yaml = "";
        let testIDString = "";
        switch (numOfArgs) {
            case 1:
                // either yaml or testIDString
                // When passed in as CLI argument, testIDString can be either a single number or something like "1 2 3"    
                let mysteryArg = RELEVANT_ARGS[0]; 
                if (isNumericString(removeAllWhitespace(mysteryArg))) {
                    testIDString = mysteryArg;
                    yaml = getDefaultYamlFile();
                    javaArgs.push(yaml);
                    addOverrideTestIDs(javaArgs, testIDString); 
                } else {
                    yaml = mysteryArg;
                    javaArgs.push(yaml);
                }
                break;
            default:
                yaml = RELEVANT_ARGS[0];
                testIDString = RELEVANT_ARGS[1];
                addOverrideTestIDs(javaArgs, testIDString);
        }
        console.log(javaArgs);
        const java = spawn("java", javaArgs, { stdio: "inherit" }); // spawn separate java process
        java.on("error", err => {
            console.error("Failed to start Java: " + err);
            process.exit(1);
        })
    }
}


// #region Performers
function addOverrideTestIDs(javaArgs, testIDString) {
    if (!isMultipleTestIDs(testIDString)) {
        javaArgs.push(testIDString); // single ID
    } else {
        javaArgs.push(testIDString.replace(" ", ",")); // multiple IDs. Company Appium test runner needs comma delimted list
    }
}

function unsupportedOS(OS) {
    console.error("Unsupported OS: " + OS);
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
function getConfigFromJson() {
    try {
        return JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    } catch (error) {
        console.error("Failed to load config.json: " + error);
        process.exit(1);
    }
}

function getPathToJarFile() {
    let jarPath;
    if (isWindows(OS)) {
        jarPath = CONFIG.windows.overrideJarLocation;
        if (jarPath === "") return "C:\\Appium"; // hardcode JAR path if not overriden in config.json
        return jarPath;
    } else if (isMacOS(OS)) {
        jarPath = CONFIG.macOS.overrideJarLocation;
        if (jarPath === "") return "/Applications/Appium"; 
        return jarPath;
    } else {
        unsupportedOS(OS);
    }
}

function getDefaultYamlFile() {
    if (isWindows(OS)) {
        return CONFIG.windows.defaultYamlFile; // get default YAML file from config.json if not specified
    } else if (isMacOS(OS)) {
        return CONFIG.macOS.defaultYamlFile;
    } else {
       unsupportedOS(OS);
    }
}
// #endregion


// #region Booleans
function isNumericString(x) {
    if (x === "" || x === " ") return false; // these eval to 0
    return !Number.isNaN(Number(x));         // real numeric strings return true. Wordy strings eval to NaN
}

// when you pass in "1,2,3", the argument turns into "1 2 3"
// comma might be causing powershell to be turning that into an array [1, 2, 3] which then gets parsed back into "1 2 3" by JavaScript
function isMultipleTestIDs(testIDString) {
    return testIDString.includes(" ");
}

function isWindows(os) {
    return os === "win32";
}

function isMacOS(os) {
    return os === "darwin";
}
// #endregion
