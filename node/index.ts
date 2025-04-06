import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

interface Sample {
    active: boolean,
    id: number
}

type Status = 'in-progress' | 'success' | 'failed'

interface LogObject {
    samplePath: string,
    resultPath: string,
    status: Status,
    message?: string,
    recordsCount?: number,
    filteredCount?: number
}

const samplePath = path.join(fileURLToPath(import.meta.url), "../../../data.json");
const resultPath = path.join(fileURLToPath(import.meta.url), "../../../active.json");
const startDebugging = Boolean(process.env.DEBUG_MODE) ?? false;


let recordsCount = 0;
let responses: Array<Sample> = [];

function logInfo(message: string, meta: LogObject) {
    if (!startDebugging) {
        return;
    }
    console.info(message, meta);
}


async function readJsonFile() {
    logInfo("readJsonFile started", {
        samplePath,
        resultPath,
        status: 'in-progress'
    })
    try {
        responses = JSON.parse(await fs.readFile(samplePath, 'utf-8'));
        recordsCount = responses.length;
        console.log(`Parsed ${recordsCount} records`)
        logInfo("readJsonFile successful", {
            samplePath,
            resultPath,
            status: 'success',
            recordsCount
        })
    } catch (error: any) {
        logInfo("readJsonFile finsihed with error", {
            samplePath,
            resultPath,
            status: 'failed',
            message: error?.message
        })
        throw error;
    }

}

async function filterAndWrite() {
    console.log(`Filter: item.active === true`);
    logInfo("filterAndWrite started", {
        samplePath,
        resultPath,
        status: 'in-progress'
    })
    try {
        responses = responses.filter((response) => response.active)
        const filteredCount = responses.length;
        const activePercentage = (filteredCount / recordsCount) * 100

        console.log(`Matched ${responses.length} out of ${recordsCount} items (${activePercentage}%)`)
        await fs.writeFile(resultPath, JSON.stringify(responses));

        const resultFileSize = (await fs.statfs(resultPath)).bsize;
        console.log(`Output written to ${path.basename(resultPath)} (${resultFileSize} bytes)`)

        logInfo("filterAndWrite successful", {
            samplePath,
            resultPath,
            status: 'success',
            recordsCount,
            filteredCount
        })
    } catch (error: any) {
        logInfo(" filterAndWrite finsihed with error", {
            samplePath,
            resultPath,
            status: 'failed',
            message: error?.message
        })
    }

}

(async function () {
    const start = performance.now();
    try {
        logInfo("Starting JSON Filter node", {
            samplePath,
            resultPath,
            status: 'in-progress',
        })
        await readJsonFile();
        await filterAndWrite();
    } catch (error: any) {
        console.log("JSON Filter node failed", {
            samplePath,
            resultPath,
            status: 'failed',
        })
    }
    logInfo("JSON Filter node successful", {
        samplePath,
        resultPath,
        status: 'success',
        recordsCount,
        filteredCount: responses.length
    });
    console.log(`Filtering completed ${(performance.now() - start).toFixed(3)} ms`)
})();
