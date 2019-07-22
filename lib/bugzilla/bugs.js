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
            if (bugs.length == 0)
                return [2 /*return*/, []];
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
                                console.log("Bug Updated " + params + ": " + updateResponse);
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
function changeBugsToFixed(pullRequest, bugs) {
    return __awaiter(this, void 0, void 0, function () {
        var fixedBugs, fixedIssues, openIssues, bugsUpdate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isPullRequestWorkInProgress(pullRequest)) {
                        console.warn("The pull request '" + pullRequest.number + ": " + pullRequest.title + "' with labels " + pullRequest.labels + " is Work in Progress, \n        so not changing Bug Status");
                        return [2 /*return*/];
                    }
                    fixedBugs = bugs || links_1.getFixedRenderedIssueNumbers(pullRequest.body);
                    if (fixedBugs.length <= 0) {
                        console.log("Bug Fix: No resolved bug for PR " + pullRequest.number + ": " + pullRequest.title + " with body " + pullRequest.body);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, getBugs(fixedBugs)];
                case 1:
                    fixedIssues = _a.sent();
                    openIssues = fixedIssues.filter(function (issue) { return issue.is_open; }).map(function (issue) { return issue.id; });
                    if (openIssues.length <= 0) {
                        console.log("Bug Fix: No open issues left amoung fixes issues: " + fixedIssues.map(function (issue) { id: issue.id; }));
                        return [2 /*return*/];
                    }
                    bugsUpdate = {
                        ids: openIssues,
                        status: 'RESOLVED',
                        resolution: 'FIXED',
                        comment: {
                            body: 'PR Ready'
                        }
                    };
                    return [2 /*return*/, updateBugs(bugsUpdate)];
            }
        });
    });
}
exports.changeBugsToFixed = changeBugsToFixed;
function getMilestoneForPr(pullRequest) {
    return __awaiter(this, void 0, void 0, function () {
        var fixedIssues, bugs, nonEmptyMilestones;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (pullRequest.milestone) {
                        console.log("Milestone: Milestone is already set for PR " + pullRequest.number + " - " + pullRequest.title + ", no need to fetch");
                        return [2 /*return*/];
                    }
                    fixedIssues = links_1.getFixedRenderedIssueNumbers(pullRequest.body);
                    if (fixedIssues.length <= 0) {
                        console.log("Milestone: No resolved bug for PR " + pullRequest.number + ": " + pullRequest.title + " with body " + pullRequest.body);
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, getBugs(fixedIssues)];
                case 1:
                    bugs = _a.sent();
                    nonEmptyMilestones = bugs.map(function (bug) { return bug.target_milestone; }).filter(function (milestone) { return milestone !== '---'; });
                    if (nonEmptyMilestones.length > 0) {
                        if (nonEmptyMilestones.length > 1)
                            console.log("Multiple Milestones " + nonEmptyMilestones + " for bugs " + fixedIssues + " of PR " + pullRequest.number + " - " + pullRequest.title + ". Picking first");
                        return [2 /*return*/, nonEmptyMilestones[0]];
                    }
                    else {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.getMilestoneForPr = getMilestoneForPr;
function getOrCreateMilestone(context, milestone) {
    return __awaiter(this, void 0, void 0, function () {
        var milestones, filteredMilestones, newMilestone;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, context.github.issues.listMilestonesForRepo(context.repo())];
                case 1:
                    milestones = _a.sent();
                    filteredMilestones = milestones.data.filter(function (ms) { return ms.title == milestone; });
                    if (!(filteredMilestones.length == 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, context.github.issues.createMilestone(context.repo({
                            title: milestone
                        }))];
                case 2:
                    newMilestone = _a.sent();
                    return [2 /*return*/, newMilestone.data];
                case 3: return [2 /*return*/, filteredMilestones[0]];
            }
        });
    });
}
function addMilestoneToIssue(context) {
    return __awaiter(this, void 0, void 0, function () {
        var milestone, milestoneInRepo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getMilestoneForPr(context.payload.pull_request)];
                case 1:
                    milestone = _a.sent();
                    if (!milestone) return [3 /*break*/, 4];
                    return [4 /*yield*/, getOrCreateMilestone(context, milestone)];
                case 2:
                    milestoneInRepo = _a.sent();
                    return [4 /*yield*/, context.github.issues.update(context.issue({
                            milestone: milestoneInRepo.number
                        }))];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.addMilestoneToIssue = addMilestoneToIssue;
//# sourceMappingURL=bugs.js.map