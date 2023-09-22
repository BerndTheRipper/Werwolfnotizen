const { mkdir, writeFile } = require('fs').promises;
const os = require('os');
const path = require('path');
const puppeteer = require('puppeteer');
const fs = require("fs/promises");

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

module.exports = async function () {
	var file = await fs.open("./jest/index.test.js", "r");
	var lines = "";
	for await (const line of file.readLines({ autoClose: true })) {
		if (line.startsWith("var browser = await") || line.startsWith("var page = await")) {
			lines += "// " + line + "\n";
		}
		else if (line.startsWith("// var browser = globalThis") || line.startsWith("// var page;")) {
			lines += line.slice(3) + "\n";
		}
		else {
			lines += line + "\n";
		}
	}

	file = await fs.open("./jest/index.test.js", "w")
	await file.truncate(0);
	await file.writeFile(lines);
	await file.close();

	const browser = await puppeteer.launch({ headless: "new" });
	// store the browser instance so we can teardown it later
	// this global is only available in the teardown but not in TestEnvironments
	globalThis.__BROWSER_GLOBAL__ = browser;

	// use the file system to expose the wsEndpoint for TestEnvironments
	await mkdir(DIR, { recursive: true });
	await writeFile(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint());
};