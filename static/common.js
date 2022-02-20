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
    var minimun;
    switch (args.length) {
        case 0:
            minimun = -Infinity;
            break;
        case 1:
            minimun = args[0];
            break;
        default:
            minimun = args[0];
            for (var i = 1; i < args.length; ++i)
                minimun = minimun > args[i] ? args[i] : minimun;
            break;
    }
    return minimun;
}
export function max () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var maximum;
    switch (args.length) {
        case 0:
            maximum = Infinity;
            break;
        case 1:
            maximum = args[0];
            break;
        default:
            maximum = args[0];
            for (var i = 1; i < args.length; ++i)
                maximum = maximum < args[i] ? args[i] : maximum;
            break;
    }
    return maximum;
}
export function sleep (milisecs) {
    return new Promise(function (resolve) { return setTimeout(resolve, milisecs); });
}
var OutputLabel = (function () {
    function OutputLabel(selector, defaultMsg) {
        var _this = this;
        this.selector = selector;
        this.defaultMsg = defaultMsg;
        this.write = function (message) {
            _this.element.innerHTML = message;
        };
        this.defaultMessage = function () {
            _this.write(_this.defaultMsg);
        };
        this.element = document.getElementById(this.selector);
    }
    return OutputLabel;
}());
const _OutputLabel = OutputLabel;
export { _OutputLabel as OutputLabel };
;
var Button = (function (_super) {
    __extends(Button, _super);
    function Button(selector, defaultMsg, disableMsg) {
        var _this = _super.call(this, selector, defaultMsg) || this;
        _this.disableMsg = disableMsg;
        _this.enable = function () {
            _this.button.disabled = false;
            _this.defaultMessage();
        };
        _this.disable = function () {
            _this.button.disabled = true;
            _this.write(_this.disableMsg);
        };
        _this.setEvent = function (event) {
            _this.button.addEventListener(event.type, event.listener);
        };
        _this.button = _this.element;
        return _this;
    }
    return Button;
}(OutputLabel));
const _Button = Button;
export { _Button as Button };
var Logger = (function () {
    function Logger() {
        var _this = this;
        this.saveLog = function (log) {
            Logger.logs.push(log);
        };
        this.writeLog = function (message, force, hideTime) {
            if (force === void 0) { force = false; }
            if (hideTime === void 0) { hideTime = false; }
            var currentTime = Logger.getTime();
            var prefix = hideTime ? '' : "[" + currentTime + "] ";
            _this.saveLog({ time: currentTime, message: message });
            if (Logger.printDebugLogs === true || force === true) {
                console.log("" + (prefix + message));
            }
        };
        this.writeLog("Debug mode " + (Logger.printDebugLogs ? 'enabled' : 'disabled') + ".", true, true);
        Logger.instance = this;
    }
    Logger.printDebugLogs = false;
    Logger.instance = undefined;
    Logger.logs = [];
    Logger.getInstance = function () {
        if (Logger.instance !== undefined) {
            return Logger.instance;
        }
        else {
            return new Logger();
        }
    };
    Logger.getTime = function () {
        var zeroPad = function (num) { return num < 10 ?
            '0' + num.toString() : num.toString(); };
        var date = new Date();
        var hours = zeroPad(date.getHours());
        var minutes = zeroPad(date.getMinutes());
        var seconds = zeroPad(date.getSeconds());
        return hours + ":" + minutes + ":" + seconds;
    };
    return Logger;
}());
const _Logger = Logger;
export { _Logger as Logger };
//# sourceMappingURL=common.js.map