export interface CtxPosI {
    x: number;
    y: number;
    z?: number;
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


export const sleep = (milisecs: number): Promise<unknown> =>
                    new Promise(resolve => setTimeout(resolve, milisecs));


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
        this.write(this.defaultMsg);
    }

    disable = () => {
        this.button.disabled = true;
        this.defaultMessage();
    }

    setEvent = (event: string, listener: any) => {
        this.button.addEventListener(event, listener);
    }
}
