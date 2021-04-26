let {isExcluded, isDirectory} = require("./cli");
let { mkdirSync, rmdirSync, existsSync, writeFileSync, unlinkSync } = require("fs");
let path = require("path");

test("exclude media files", ()=>{
    expect(isExcluded("han.png")).toBeTruthy();
    expect(isExcluded("love.js")).toBeFalsy();
})

test("check for directories", ()=>{
    let folderLoc = path.join(__dirname, "__testFolder");
    if(!existsSync(folderLoc)) mkdirSync(folderLoc);
    expect(isDirectory(folderLoc)).toBeTruthy();
    rmdirSync(folderLoc);

    let fileLoc = path.join(__dirname, "__testfile.js");
    if(!existsSync(fileLoc)) writeFileSync(fileLoc, "break;");
    expect(isDirectory(fileLoc)).toBeFalsy();
    unlinkSync(fileLoc);
})
