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

const dirName = fileURLToPath(import.meta.url);
const samplePath = path.join(dirName, "../../data.json");
const resultPath = path.join(dirName, "../../active.json");
const startDebugging = process.env.DEBUG_MODE === "true";


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
        responses = await Bun.file(samplePath).json();
        recordsCount = responses.length;
        console.log(`Parsed ${recordsCount} records`)
        logInfo("readJsonFile successful", {
            samplePath,
            resultPath,
            status: 'success',
            recordsCount
        })
    } catch (error: any) {
        logInfo("readJsonFile finished with error", {
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

        console.log(`Matched ${filteredCount} out of ${recordsCount} items (${activePercentage.toFixed(2)}%)`)
        await Bun.write(resultPath, JSON.stringify(responses));

        const resultFileSize = (await Bun.file(resultPath).stat()).size
        console.log(`Output written to ${path.basename(resultPath)} (${resultFileSize} bytes)`)

        logInfo("filterAndWrite successful", {
            samplePath,
            resultPath,
            status: 'success',
            recordsCount,
        })
    } catch (error: any) {
        logInfo("filterAndWrite finished with error", {
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
        logInfo("Starting JSON Filter bun", {
            samplePath,
            resultPath,
            status: 'in-progress',
        })
        await readJsonFile();
        await filterAndWrite();
    } catch (error: any) {
        console.log("JSON Filter bun failed", {
            samplePath,
            resultPath,
            status: 'failed',
        })
    }
    logInfo("JSON Filter bun successful", {
        samplePath,
        resultPath,
        status: 'success',
        recordsCount,
        filteredCount: responses.length
    });
    console.log(`Filtering completed ${(performance.now() - start).toFixed(3)} ms`)
})();
