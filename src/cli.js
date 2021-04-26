const inquirer = require("inquirer");
const ejs = require("ejs");
const { existsSync, mkdirSync, lstatSync, readdirSync, readSync, readFileSync, writeFileSync, copyFile, copyFileSync } = require("fs");
const path = require("path");
const Listr = require("listr");
const { install } = require("pkg-install");

let answers = {};
let templatesPath = path.resolve(__dirname, "..", "templates");
let answerOptionsKey = {
    JAVASCRIPT: 0,
    TYPESCRIPT: 1,
    BACKGROUND: 2,
    CONTENTSCRIPT: 3,
    POPUP: 4,
    PREFERENCE: 5
}
let arrayHas = (array, item) => {
    return array.indexOf(item) > -1
}

function isDirectory(source) {
    return lstatSync(source).isDirectory();
}

function isExcluded(filename) {
    let RE = /(\.png)|(\.jpeg)|(\.svg)|(\.mp4)/;
    return RE.test(filename);
}

async function cli(args) {
    let questions = [];
    // let name of extension be the 3rd argument
    let name = args[2];
    if (!name) {
        questions.push({
            type: "input",
            name: "name",
            message: "What's the name of your project?"
        });
    } else answers.name = name;

    questions.push({
        type: "list",
        name: "language",
        message: "Language Preference",
        choices: [
            {
                name: "JavaScript",
                value: answerOptionsKey.JAVASCRIPT
            },
            {
                name: 'TypeScript',
                value: answerOptionsKey.TYPESCRIPT
            }
        ]
    })

    questions.push({
        type: "checkbox",
        name: "parts",
        message: "Extension options",
        choices: [
            {
                name: "Background",
                value: answerOptionsKey.BACKGROUND
            },
            {
                name: "Content Script",
                value: answerOptionsKey.CONTENTSCRIPT
            },
            {
                name: "Popup",
                value: answerOptionsKey.POPUP
            },
            {
                name: "Preference",
                value: answerOptionsKey.PREFERENCE
            }
        ]
    })

    answers = { ...answers, ...await inquirer.prompt(questions), ...answerOptionsKey, arrayHas };
    const tasks = new Listr([
        {
            title: 'Generating project files',
            task: () => generateCode(),
        },
        {
            title: 'Installing dependencies',
            task: () => install({
                '@types/chrome': undefined,
                'webpack': undefined,
                'webpack-cli': undefined,
                'copy-webpack-plugin': '^8'
            }, {
                prefer: 'yarn',
                dev: 'true',
                cwd: path.join(process.cwd(), answers.name)
            })
        }
    ])

    await tasks.run();
    let lastRemarks = `
Your project is ready   
\n                      
cd ${answers.name} 
\n                      
yarn dev / npm run dev`

    console.log(lastRemarks);
}

async function processFile(dirPath, filename, filePath) {
    let workingDirectory = path.join(process.cwd(), answers.name);
    let toDir = dirPath.split("\\");
    toDir.splice(0, 1); // these two lines remove the starting path /templatename
    toDir = toDir.join("\\");
    let currentDir = path.join(workingDirectory, toDir);

    let content;
    let transformedContent;

    if (!isExcluded(filename)) {
        content = readFileSync(filePath, 'utf-8');
        transformedContent = ejs.render(content, answers);
    }

    try {
        let destFile = path.join(currentDir, filename);
        mkdirSync(currentDir, { recursive: true });
        !isExcluded(filename) ? writeFileSync(destFile, transformedContent) : copyFileSync(filePath, destFile);
    } catch (e) {
        throw e;
    }

}

async function generateCode() {
    let dirStack = [];
    let baseTemplate = "base";
    // generate directory first
    if (!existsSync(answers.name)) {
        mkdirSync(answers.name);
    }
    // make template selection here
    dirStack.push(baseTemplate);

    // template processing goes on here
    while (dirStack.length > 0) {
        let activeFolder = dirStack.pop();
        let files = await readdirSync(path.join(templatesPath, activeFolder));
        for (let i = 0; i < files.length; i++) {
            let filePath = path.join(templatesPath, activeFolder, files[i]);
            if (isDirectory(filePath)) dirStack.push(path.join(activeFolder, files[i]))
            else await processFile(activeFolder, files[i], filePath);
        }
    }

}

module.exports = { cli, isExcluded, isDirectory }