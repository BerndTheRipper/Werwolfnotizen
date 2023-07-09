const fs = require('fs').promises;
const os = require('os');
const path = require('path');

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');
module.exports = async function () {
    var file = await fs.open("./index.test.js", "r+");
    var lines = "";
    for await (const line of file.readLines({autoClose:true})){
        if(line.startsWith("var browser = globalThis") || line.startsWith("var page;")){
            lines += "// " + line + "\n";
        }
        else if(line.startsWith("// var browser = await") || line.startsWith("// var page = await")){
            lines += line.slice(3) + "\n";
        }
        else{
            lines += line + "\n";
        }
    }

    file = await fs.open("./index.test.js", "w")
    await file.truncate(0);
    await file.writeFile(lines);
    await file.close();

    // close the browser instance
    await globalThis.__BROWSER_GLOBAL__.close();

    // clean-up the wsEndpoint file
    await fs.rm(DIR, {recursive: true, force: true});
};