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

let recordsCount = 0;
let responses: Array<Sample> = [];


function logInfo(message: string, meta: LogObject) {
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
        logInfo("readJsonFile successfull", {
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
    logInfo("filterAndWrite started", {
        samplePath,
        resultPath,
        status: 'in-progress'
    })
    try {
        responses = responses.filter((response) => response.active)
        await fs.writeFile(resultPath, JSON.stringify(responses));
        logInfo(" filterAndWrite successfull", {
            samplePath,
            resultPath,
            status: 'success',
            recordsCount,
            filteredCount: responses.length
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
    try {
        console.log("Starting JSON Filter node", {
            samplePath,
            resultPath,
            status: 'in-progress',
        })
        await readJsonFile();
        await filterAndWrite();
        console.log("JSON Filter node sucessfull", {
            samplePath,
            resultPath,
            status: 'success',
            recordsCount,
            filterdCount: responses.length
        })
    } catch (error: any) {
        console.log("JSON Filter node failed", {
            samplePath,
            resultPath,
            status: 'failed',
        })
    }
})();
