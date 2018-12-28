

export enum LoggingVerbosity {
    Debug = 0,
    Trace = 1,
    Warning = 2,
    Error = 3,
}

export interface Logger {
    enabled: boolean;

    verbosity: LoggingVerbosity;

    log(message: string | object, verbosity: LoggingVerbosity): void;
}