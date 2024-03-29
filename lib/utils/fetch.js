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
var node_fetch_1 = require("node-fetch");
exports.Response = node_fetch_1.Response;
var querystring = require("querystring");
exports.defaultHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json'
};
function request(url, init, credential, autoParseJson, customResponseParser) {
    if (autoParseJson === void 0) { autoParseJson = true; }
    return __awaiter(this, void 0, void 0, function () {
        var splitPath, qs, params_1, hash, query, response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    init = Object.assign(
                    // default init params
                    {
                        method: 'GET',
                        headers: exports.defaultHeaders
                    }, 
                    // override init params
                    init);
                    // ensure default headers is exist but not replaced
                    init.headers = Object.assign({}, exports.defaultHeaders, init.headers);
                    // convert to Headers
                    init.headers = new node_fetch_1.Headers(init.headers);
                    if (credential.signatureSecret && credential.signatureMethod) {
                        splitPath = String(url).split(/\?(.+)/);
                        qs = splitPath[0];
                        params_1 = querystring.decode(qs);
                        // add timestamp if not already present
                        if (Object.prototype.hasOwnProperty.call(params_1, 'timestamp')) {
                            params_1.timestamp = String((new Date().getTime() / 1000) | 0); // floor to seconds
                        }
                        // strip API Secret
                        delete params_1.api_secret;
                        hash = credential.generateSignature(params_1);
                        query = Object.keys(params_1)
                            .sort()
                            .reduce(function (query, key) {
                            return query + "&" + key + "=" + params_1[key];
                        }, String(''));
                        // replace the first & with ?
                        query = query.replace(/&/i, '?');
                        url = String(url).replace(qs, query + "&sig=" + hash);
                    }
                    console.info('Request: %s \nMethod: %s \nHeaders: %o \nBody: %j', url, init.method, init.headers.raw(), init.body);
                    return [4 /*yield*/, node_fetch_1.default(url, init)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, handleResponse(response, init, autoParseJson, customResponseParser)];
                case 2: 
                // pass to handler
                return [2 /*return*/, _a.sent()];
                case 3:
                    err_1 = _a.sent();
                    console.error('problem with API request detailed stacktrace below ');
                    console.error(err_1);
                    throw err_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.request = request;
function get(url, params, credential, useJwt, useBasicAuth) {
    if (useJwt === void 0) { useJwt = false; }
    if (useBasicAuth === void 0) { useBasicAuth = false; }
    return __awaiter(this, void 0, void 0, function () {
        var headers;
        return __generator(this, function (_a) {
            params = params || {};
            if (!useJwt && !useBasicAuth) {
                params['api_key'] = credential.apiKey;
                params['api_secret'] = credential.apiSecret;
            }
            url = url + "?" + querystring.stringify(params);
            headers = {
                'Content-Type': 'application/json'
            };
            if (useJwt) {
                headers['Authorization'] = "Bearer " + credential.generateJwt();
            }
            if (useBasicAuth) {
                headers['Authorization'] = "Basic " + Buffer.from(credential.apiKey + ':' + credential.apiSecret).toString('base64');
            }
            return [2 /*return*/, request(url, {
                    method: 'GET',
                    headers: headers
                }, credential)];
        });
    });
}
exports.get = get;
function handleResponse(response, request, autoParseJson, customResponseParser) {
    if (autoParseJson === void 0) { autoParseJson = true; }
    return __awaiter(this, void 0, void 0, function () {
        var res, error, headers, contentType, statusCode, retryAfterMillis, _a, parseError_1, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    res = null;
                    error = null;
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 15, , 18]);
                    headers = response.headers;
                    contentType = headers.get('content-type');
                    statusCode = Number(response.status);
                    if (!(statusCode >= 500)) return [3 /*break*/, 2];
                    error = {
                        message: 'Server Error',
                        statusCode: status
                    };
                    return [3 /*break*/, 14];
                case 2:
                    if (!(contentType === 'application/octet-stream')) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.buffer()];
                case 3:
                    // return buffer when it is octet-stream
                    res = _f.sent();
                    return [3 /*break*/, 14];
                case 4:
                    if (!(statusCode === 429)) return [3 /*break*/, 6];
                    // 429 does not return a parsable body
                    if (!headers.has('retry-after')) {
                        retryAfterMillis = request.method === 'POST' ? 1000 / 2 : 1000 / 5;
                        headers.set('retry-after', String(retryAfterMillis));
                    }
                    _a = {};
                    return [4 /*yield*/, response.text()];
                case 5:
                    error = (_a.body = _f.sent(),
                        _a);
                    return [3 /*break*/, 14];
                case 6:
                    if (!(statusCode === 204)) return [3 /*break*/, 7];
                    // No content
                    res = null;
                    return [3 /*break*/, 14];
                case 7:
                    if (!(request.method !== 'DELETE')) return [3 /*break*/, 12];
                    if (!autoParseJson) return [3 /*break*/, 9];
                    return [4 /*yield*/, response.json()];
                case 8:
                    res = _f.sent();
                    return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, response.text()];
                case 10:
                    res = _f.sent();
                    _f.label = 11;
                case 11: return [3 /*break*/, 14];
                case 12: return [4 /*yield*/, response.buffer()];
                case 13:
                    // default parse as buffer
                    res = _f.sent();
                    _f.label = 14;
                case 14: return [3 /*break*/, 18];
                case 15:
                    parseError_1 = _f.sent();
                    console.error(parseError_1);
                    console.error('could not convert API response to JSON, above error is ignored and raw API response is returned to client');
                    console.error('Raw Error message from API ');
                    _c = (_b = console).error;
                    _d = "\"";
                    return [4 /*yield*/, response.buffer()];
                case 16:
                    _c.apply(_b, [_d + (_f.sent()) + "\""]);
                    _e = {
                        status: status,
                        message: 'The API response could not be parsed.'
                    };
                    return [4 /*yield*/, response.buffer()];
                case 17:
                    error = (_e.body = _f.sent(),
                        _e.parseError = parseError_1,
                        _e);
                    return [3 /*break*/, 18];
                case 18:
                    // use custom parser when it exist
                    if (typeof customResponseParser === 'function') {
                        // don't try to parse the response on errors
                        if (response) {
                            res = customResponseParser(response, request);
                        }
                    }
                    // when error occur add nessary info and throw
                    if (error) {
                        error.statusCode = String(response.status);
                        error.headers = response.headers;
                        throw error;
                    }
                    // return response
                    return [2 /*return*/, res];
            }
        });
    });
}
exports.handleResponse = handleResponse;
//# sourceMappingURL=fetch.js.map