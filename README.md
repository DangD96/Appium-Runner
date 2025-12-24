# Background
At my company, our custom Appium test runner is called by entering the following into the command line:

`java -jar <path-to-jar-file> <name-of-yaml-config-file> [comma-delimited-list-of-test-ids]`

The yaml config file specifies the directory of tests to run all at once. The comma delimted list of test IDs serves to override that.

While you can use Batch files on Windows and Shortcuts on MacOS take care of everything up to the yaml parameter, there is no quick way to run just a single Appium test without typing all of that out.


# Design
I created a CLI wrapper using NodeJS that will support the following patterns to quickly run any test of their choosing:

1. `run <name-of-yaml-config-file> [comma-delimited-list-of-test-ids]`
2. `run <name-of-yaml-config-file>`
3. `run [comma-delimited-list-of-test-ids]`

For pattern #1 and #2: This wrapper defaults the path to the appium.jar file. The user can override this using the __overrideJarLocation__ variable in a config.json file.

For pattern #3: This wrapper does the same thing with the JAR file as previous patterns. The wrapper also defaults the name of the YAML file based on what the user sets in the __defaultYamlFile__ variable in a config.json file.


# Setup

## Configuration
With the files in one of your local folders:
- Open the folder in a Terminal
- Run `cp config-template.json config.json` to create the config.json file.
- Open config.json 
- Set __overrideJarLocation__ if needed.
- Set __defaultYamlName__ if needed.
- Save changes.

## Installation
With Terminal still open in the folder where these files are downloaded:
- Run `npm install -g .`
- Run `npm list -g` to verify the appium_runner tool installed successfully.

## Usage
You can now run tests from your Appium scripts directory using:

1. `run <name-of-yaml-config-file> [comma-delimited-list-of-test-ids]`
2. `run <name-of-yaml-config-file>`
3. `run [comma-delimited-list-of-test-ids]`


# Examples

## Run all tests in a YAML file
`run regression.yaml`

## Run a single test using the default YAML set in config.json
`run 3`

This runs **test ID 3**.

## Run multiple tests
`run regression.yaml 1,2,3`

## Run multiple tests using the default YAML
`run 4,7,12`

# What happens behind the scenes?
The tool:
- Detects whether you’re on Windows or Mac
- Finds `appium.jar` based on a hardcoded default path or what __overrideJarLocation__ is set to in config.json.
- Chooses the correct default YAML file if __defaultYamlName__ is set in config.json.
- Converts your input into the correct Java arguments.
- Passes the Java arguments to the company Appium Test Runner.

# Uninstall
- Open a Terminal from anywhere
- Run `npm uninstall -g appium_runner`
