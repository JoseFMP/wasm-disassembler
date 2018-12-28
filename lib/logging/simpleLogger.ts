import { Logger, LoggingVerbosity } from './logger';


export class SimpleLogger implements Logger {

    loggerFunc: ((message: any) => void) | null;

    constructor(loggerFunc: ((message: any) => void) | null){
        this.loggerFunc = loggerFunc;
    }

    enabled: boolean;
    verbosity: LoggingVerbosity = LoggingVerbosity.Error;
    
    log(message: string | object, verbosity: LoggingVerbosity) {
        if(!this.enabled || !this.loggerFunc){
            return;
        }

        if (verbosity >= this.verbosity){
            this.loggerFunc(message);
        }
    };
}