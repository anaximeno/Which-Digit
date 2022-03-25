import {
    IEventSetter,
    ILogMessage
} from './types';


export const min = (...args: number[]): number =>
    args.reduce((a, b) => a < b ? a : b);


export const max = (...args: number[]): number =>
    args.reduce((a, b) => a > b ? a : b);


export const sleep = (milisecs: number): Promise<unknown> =>
    new Promise(resolve => setTimeout(resolve, milisecs));


export class OutputSection {
    protected readonly element: HTMLElement;

    constructor(protected readonly selector: string, protected readonly defaultMsg: string) {
        this.element = document.getElementById(this.selector);
    }

    write(message: string) {
        this.element.innerHTML = message;
    }

    defaultMessage() {
        this.write(this.defaultMsg);
    }
};


export
class Button extends OutputSection {
    protected readonly button: HTMLButtonElement;

    constructor(selector: string, defaultMsg: string, private readonly disableMsg: string) {
        super(selector, defaultMsg);
        this.button = <unknown>this.element as HTMLButtonElement;
    }

    enable() {
        this.button.disabled = false;
        this.defaultMessage();
    }

    disable() {
        this.button.disabled = true;
        this.write(this.disableMsg);
    }

    setEvent(event: IEventSetter) {
        this.button.addEventListener(
            event.type, event.listener
        );
    }
}


/* This class implements the Singleton design pattern. */
export class Logger {
    public static printDebugLogs: boolean = false;
    private static instance = undefined;
    static logs: ILogMessage[] = [];

    private constructor() {
        this.writeLog(
            `Debug mode ${Logger.printDebugLogs ? 'enabled' : 'disabled'}.`,
            true, true);
        Logger.instance = this;
    }

    static getInstance(): Logger {
        return Logger.instance ? Logger.instance : new Logger();
    }

    static getTime(): string {
        const date = new Date();

        const zeroLeftPad = (num: number): string => {
            const str = <unknown>num as string;
            return num < 10 ?  '0' + str : str;
        }

        const hours = zeroLeftPad(date.getHours());
        const minutes = zeroLeftPad(date.getMinutes());
        const seconds = zeroLeftPad(date.getSeconds());
        const milisecs = date.getMilliseconds();

        return `${hours}:${minutes}:${seconds}.${milisecs}`
    }

    saveLog(log: ILogMessage) {
        Logger.logs.push(log);
    }

    writeLog(message: string, force: boolean = false, hideTime: boolean = false) {
        const time = Logger.getTime();
        this.saveLog({ time, message });

        if (Logger.printDebugLogs === true || force === true) {
            const prefix = hideTime ? '' : `[${time}] `;
            console.log(`${prefix + message}`);
        }
    }
}
