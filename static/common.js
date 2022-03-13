"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
export const __esModule = true;
export function min () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args.reduce(function (a, b) { return a < b ? a : b; });
}
export function max () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args.reduce(function (a, b) { return a > b ? a : b; });
}
export function sleep (milisecs) {
    return new Promise(function (resolve) { return setTimeout(resolve, milisecs); });
}
var OutputSection = (function () {
    function OutputSection(selector, defaultMsg) {
        this.selector = selector;
        this.defaultMsg = defaultMsg;
        this.element = document.getElementById(this.selector);
    }
    OutputSection.prototype.write = function (message) {
        this.element.innerHTML = message;
    };
    OutputSection.prototype.defaultMessage = function () {
        this.write(this.defaultMsg);
    };
    return OutputSection;
}());
const _OutputSection = OutputSection;
export { _OutputSection as OutputSection };
;
var Button = (function (_super) {
    __extends(Button, _super);
    function Button(selector, defaultMsg, disableMsg) {
        var _this = _super.call(this, selector, defaultMsg) || this;
        _this.disableMsg = disableMsg;
        _this.button = _this.element;
        return _this;
    }
    Button.prototype.enable = function () {
        this.button.disabled = false;
        this.defaultMessage();
    };
    Button.prototype.disable = function () {
        this.button.disabled = true;
        this.write(this.disableMsg);
    };
    Button.prototype.setEvent = function (event) {
        this.button.addEventListener(event.type, event.listener);
    };
    return Button;
}(OutputSection));
const _Button = Button;
export { _Button as Button };
var Logger = (function () {
    function Logger() {
        this.writeLog("Debug mode " + (Logger.printDebugLogs ? 'enabled' : 'disabled') + ".", true, true);
        Logger.instance = this;
    }
    Logger.getInstance = function () {
        return Logger.instance ? Logger.instance : new Logger();
    };
    Logger.getTime = function () {
        var zeroLeftPad = function (num) {
            var str = num;
            return num < 10 ? '0' + str : str;
        };
        var date = new Date();
        var hours = zeroLeftPad(date.getHours());
        var minutes = zeroLeftPad(date.getMinutes());
        var seconds = zeroLeftPad(date.getSeconds());
        var milisecs = date.getMilliseconds();
        return hours + ":" + minutes + ":" + seconds + "." + milisecs;
    };
    Logger.prototype.saveLog = function (log) {
        Logger.logs.push(log);
    };
    Logger.prototype.writeLog = function (message, force, hideTime) {
        if (force === void 0) { force = false; }
        if (hideTime === void 0) { hideTime = false; }
        var currentTime = Logger.getTime();
        var prefix = hideTime ? '' : "[" + currentTime + "] ";
        this.saveLog({ time: currentTime, message: message });
        if (Logger.printDebugLogs === true || force === true) {
            console.log("" + (prefix + message));
        }
    };
    Logger.printDebugLogs = false;
    Logger.instance = undefined;
    Logger.logs = [];
    return Logger;
}());
const _Logger = Logger;
export { _Logger as Logger };
//# sourceMappingURL=common.js.map