# Background
At my company, our custom Appium test runner is called by entering the following into the command line:

`java -jar <path-to-jar-file> <name-of-yaml-config-file> [comma-delimited-list-of-test-ids]`

While you can use Batch files on Windows and Shortcuts on MacOS take care of everything up to the yaml parameter, there is no quick way to run just a single Appium test without typing all of that out.

As such, I created a CLI wrapper using NodeJS that will make it so users can instead do:

`run <name-of-yaml-config-file> [comma-delimited-list-of-test-ids]`

to quickly run any test of their choosing.

/* To use:
    1. Make sure the parent directory of this file and package.json is in your Appium "scripts" directory 
    2. Make sure appium.jar is in your Appium "scripts" directory
    3. Open terminal to cd to this file's parent directory
    4. "npm install ."
    5. Can now call "pickles <yaml> [testids]"" while inside your Appium "scripts" directory to run tests
*/

PWSH: Copy-Item config-example.json config.json
Bash: cp config-example.json config.json