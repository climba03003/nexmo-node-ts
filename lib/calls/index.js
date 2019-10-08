"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var endpoint_1 = require("../endpoint");
var HTTPClient = require("../utils/fetch");
var querystring = require("querystring");
var dtmf_1 = require("./dtmf");
var stream_1 = require("./stream");
var talk_1 = require("./talk");
var NexmoCalls = /** @class */ (function () {
    function NexmoCalls(credential, options) {
        if (options === void 0) { options = { retry: true, limit: 10 }; }
        this.credential = credential;
        this.options = Object.assign({ retry: true, limit: 10 }, options);
        this.dtmf = new dtmf_1.default(credential, options);
        this.stream = new stream_1.default(credential, options);
        this.talk = new talk_1.default(credential, options);
    }
    Object.defineProperty(NexmoCalls, "ENDPOINT", {
        get: function () {
            return new endpoint_1.default('api.nexmo.com', '/v1/calls');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NexmoCalls, "RETRYPATHS", {
        get: function () {
            return ['api.nexmo.com', 'api-sg-1.nexmo.com', 'api-us-1.nexmo.com'];
        },
        enumerable: true,
        configurable: true
    });
    NexmoCalls.prototype.create = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var body, url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // structure with default value
                        params = Object.assign({
                            answer_method: 'GET',
                            event_method: 'POST',
                            length_timer: 7200,
                            ringing_timer: 60
                        }, params);
                        body = JSON.stringify(params);
                        url = NexmoCalls.ENDPOINT.deserialize();
                        return [4 /*yield*/, HTTPClient.request(url, {
                                method: 'POST',
                                body: body,
                                headers: new HTTPClient.Headers({
                                    'Content-Type': 'application/json',
                                    // 'Content-Length': Buffer.byteLength(params).toString(),
                                    Authorization: "Bearer " + this.credential.generateJwt()
                                })
                            }, this.credential)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    NexmoCalls.prototype.get = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var pathExt, url;
            return __generator(this, function (_a) {
                if (!query) {
                    throw new Error('"query" is a required parameter');
                }
                pathExt = '';
                if (typeof query === 'string') {
                    pathExt = "/" + query;
                }
                else if (typeof query === 'object' && Object.keys(query).length > 0) {
                    pathExt = "?" + querystring.stringify(query);
                }
                url = "" + NexmoCalls.ENDPOINT.deserialize() + pathExt;
                return [2 /*return*/, HTTPClient.request(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer " + this.credential.generateJwt()
                        }
                    }, this.credential)];
            });
        });
    };
    NexmoCalls.prototype.update = function (callsId, params) {
        return __awaiter(this, void 0, void 0, function () {
            var body, url;
            return __generator(this, function (_a) {
                body = JSON.stringify(params);
                url = NexmoCalls.ENDPOINT.deserialize() + "/" + callsId;
                return [2 /*return*/, HTTPClient.request(url, {
                        method: 'PUT',
                        body: body,
                        headers: new HTTPClient.Headers({
                            'Content-Type': 'application/json',
                            // 'Content-Length': Buffer.byteLength(params).toString(),
                            Authorization: "Bearer " + this.credential.generateJwt()
                        })
                    }, this.credential)];
            });
        });
    };
    return NexmoCalls;
}());
exports.NexmoCalls = NexmoCalls;
exports.default = NexmoCalls;
//# sourceMappingURL=index.js.map