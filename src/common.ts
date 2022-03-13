export interface IEventSetter {
    type: string,
    listener: EventListenerOrEventListenerObject
}


export const min = (...args: number[]): number => {
    let minimun: number;

    switch (args.length) {
        case 0:
            minimun = -Infinity;
            break;
        case 1:
            minimun = args[0];
            break;
        default:
            minimun = args[0];
            for (let i = 1 ; i < args.length ; ++i)
                minimun = minimun > args[i] ? args[i] : minimun;
            break;
    }

    return minimun;
}


export const max = (...args: number[]): number => {
    let maximum: number;

    switch (args.length) {
        case 0:
            maximum = Infinity;
            break;
        case 1:
            maximum = args[0];
            break;
        default:
            maximum = args[0];
            for (let i = 1 ; i < args.length ; ++i)
                maximum = maximum < args[i] ? args[i] : maximum;
            break;
    }

    return maximum;
}


export const sleep = (milisecs: number): Promise<unknown> => {
    return new Promise(resolve => setTimeout(resolve, milisecs));
}

export class OutputLabel {
    protected readonly element: HTMLElement;

    constructor(
        protected readonly selector: string,
        protected readonly defaultMsg: string
    ) {
        this.element = document.getElementById(this.selector);
    }

    write = (message: string) => {
        this.element.innerHTML = message;
    }

    defaultMessage = () => {
        this.write(this.defaultMsg);
    }
};


export class Button extends OutputLabel {
    protected readonly button: HTMLButtonElement;

    constructor(
        selector: string,
        defaultMsg: string,
        private readonly disableMsg: string
    ) {
        super(selector, defaultMsg);
        this.button = (this.element as unknown) as HTMLButtonElement;
    }

    enable = () => {
        this.button.disabled = false;
        this.defaultMessage();
    }

    disable = () => {
        this.button.disabled = true;
        this.write(this.disableMsg);
    }

    setEvent = (event: IEventSetter) => {
        this.button.addEventListener(event.type, event.listener);
    }
}


interface ILogMessage {
    time: string;
    message: string;
}

/* This class implements the Singleton design pattern. */
export class Logger{
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
        const zeroLeftPad = (num: number): string => {
            const str = <unknown>num as string;
            return num < 10 ?  '0'+str : str;
        }

        const date = new Date();
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
        const currentTime = Logger.getTime();
        const prefix = hideTime ? '' : `[${currentTime}] `;
        this.saveLog({ time: currentTime, message: message });
        if (Logger.printDebugLogs === true || force === true) {
            console.log(`${prefix + message}`);
        }
    }
}
