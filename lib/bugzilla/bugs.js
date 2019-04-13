"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
var auth_1 = require("./auth");
var request_promise_1 = __importDefault(require("request-promise"));
var links_1 = require("../links");
function getBugs(bugs) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, auth_1.safeRun(function (token) { return __awaiter(_this, void 0, void 0, function () {
                    var bugResponse;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, request_promise_1.default("https://bugzilla.string.org.in/rest.cgi/bug?id=" + bugs.join(',') + "&token=" + token)];
                            case 1:
                                bugResponse = _a.sent();
                                return [2 /*return*/, JSON.parse(bugResponse).bugs];
                        }
                    });
                }); }, 'Cannot get bug')];
        });
    });
}
exports.getBugs = getBugs;
function updateBugs(params) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            if (!params.ids || params.ids.length <= 0)
                throw Error("IDs must be supplied");
            return [2 /*return*/, auth_1.safeRun(function (token) { return __awaiter(_this, void 0, void 0, function () {
                    var updateResponse;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, request_promise_1.default.put("https://bugzilla.string.org.in/rest.cgi/bug/" + params.ids[0] + "?token=" + token, {
                                    json: params
                                })];
                            case 1:
                                updateResponse = _a.sent();
                                console.log("Bug Updated " + JSON.stringify(params) + ": " + JSON.stringify(updateResponse));
                                return [2 /*return*/, updateResponse];
                        }
                    });
                }); }, 'Cannot get bug')];
        });
    });
}
exports.updateBugs = updateBugs;
var wipRegex = /^((wip:)|(\[wip\]))/ig;
function isPullRequestWorkInProgress(pullRequest) {
    var matches = pullRequest.title.match(wipRegex);
    var wipInTitle = matches && matches.length > 0;
    var wipInLabel = pullRequest.labels.some(function (label) { return label.name.toLowerCase() === 'wip' ||
        label.name.toLowerCase() == 'work in progress'; });
    return wipInTitle || wipInLabel;
}
var pendingBugs = [];
function executePendingBugs() {
    return __awaiter(this, void 0, void 0, function () {
        var bugIds, countMap, _i, pendingBugs_1, bug, promises, _a, _b, id, pendingRequests;
        return __generator(this, function (_c) {
            bugIds = pendingBugs.map(function (bug) { return bug.id; });
            countMap = {
                1: [],
                2: [],
                3: [],
                4: []
            };
            for (_i = 0, pendingBugs_1 = pendingBugs; _i < pendingBugs_1.length; _i++) {
                bug = pendingBugs_1[_i];
                countMap[bug.try] = [bug].concat(countMap[bug.try]);
            }
            // Remove bugs from pending
            pendingBugs = pendingBugs.filter(function (bug) { return bugIds.indexOf(bug.id) !== -1; });
            promises = [];
            for (_a = 0, _b = Object.keys(countMap); _a < _b.length; _a++) {
                id = _b[_a];
                pendingRequests = countMap[id];
                if (pendingRequests.length <= 0)
                    return [2 /*return*/];
                promises.push(changeBugsToFixed(pendingRequests[0].pullRequest, parseInt(id), pendingRequests.map(function (bug) { return bug.id; })));
            }
            return [2 /*return*/];
        });
    });
}
function changeBugsToFixed(pullRequest, tryCount, bugs) {
    if (tryCount === void 0) { tryCount = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var fixedBugs, fixedIssues, openIssues, pendingIssues, nonPendingIssues, _i, nonPendingIssues_1, bugId, bugsUpdate, response, _a, nonPendingIssues_2, bugId, index, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (tryCount > 3) {
                        console.log("Try count exceeds limit. Dropping " + bugs);
                        return [2 /*return*/];
                    }
                    console.log('Updating');
                    if (isPullRequestWorkInProgress(pullRequest)) {
                        console.warn("The pull request '" + pullRequest.number + ": " + pullRequest.title + "' with labels " + pullRequest.labels + " is Work in Progress, \n        so not changing Bug Status");
                        return [2 /*return*/];
                    }
                    fixedBugs = bugs || links_1.getFixedRenderedIssueNumbers(pullRequest.body);
                    if (fixedBugs.length <= 0) {
                        console.log("No resolved bug for PR " + pullRequest.number + ": " + pullRequest.title + " with body " + pullRequest.body);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, getBugs(fixedBugs)];
                case 1:
                    fixedIssues = _b.sent();
                    openIssues = fixedIssues.filter(function (issue) { return issue.is_open; }).map(function (issue) { return issue.id; });
                    if (openIssues.length <= 0) {
                        console.log("No open issues left amoung fixes issues: " + fixedIssues.map(function (issue) { id: issue.id; }));
                        return [2 /*return*/];
                    }
                    pendingIssues = pendingBugs.map(function (bug) { return bug.id; });
                    nonPendingIssues = openIssues.filter(function (id) { return pendingIssues.indexOf(id) === -1; });
                    if (nonPendingIssues.length <= 0) {
                        console.log("No non-pending issue left. Waiting for current issues to get finished");
                        return [2 /*return*/];
                    }
                    for (_i = 0, nonPendingIssues_1 = nonPendingIssues; _i < nonPendingIssues_1.length; _i++) {
                        bugId = nonPendingIssues_1[_i];
                        pendingBugs.push({
                            pullRequest: pullRequest,
                            id: bugId,
                            try: tryCount
                        });
                    }
                    bugsUpdate = {
                        ids: nonPendingIssues,
                        status: 'RESOLVED',
                        resolution: 'FIXED',
                        comment: {
                            body: 'PR Ready'
                        }
                    };
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, 5, 6]);
                    return [4 /*yield*/, updateBugs(bugsUpdate)];
                case 3:
                    response = _b.sent();
                    for (_a = 0, nonPendingIssues_2 = nonPendingIssues; _a < nonPendingIssues_2.length; _a++) {
                        bugId = nonPendingIssues_2[_a];
                        index = pendingBugs.map(function (bug) { return bug.id; }).indexOf(bugId);
                        if (index !== -1)
                            nonPendingIssues.splice(index, 1);
                    }
                    return [2 /*return*/, response];
                case 4:
                    e_1 = _b.sent();
                    throw e_1;
                case 5:
                    executePendingBugs().then(function () { return console.log('Execuyed pending bugs successfully'); });
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.changeBugsToFixed = changeBugsToFixed;
//# sourceMappingURL=bugs.js.map