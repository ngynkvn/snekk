import { Logger, ILogObject } from "tslog";
import { appendFileSync } from "node:fs";

const timestamp = Date.now();
function logToTransport(logObject: ILogObject) {
    if(process.env.NODE_ENV !== 'test') {
        appendFileSync(
            `/log/bot-${timestamp.toString()}.log`,
            JSON.stringify(logObject) + "\n"
        );
    }
}

// Configuration
export const logger: Logger = new Logger();
export const log = logger;
logger.attachTransport(
    {
        silly: logToTransport,
        debug: logToTransport,
        trace: logToTransport,
        info: logToTransport,
        warn: logToTransport,
        error: logToTransport,
        fatal: logToTransport,
    },
    "debug"
);
