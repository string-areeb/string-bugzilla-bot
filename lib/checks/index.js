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
Object.defineProperty(exports, "__esModule", { value: true });
var links = require("../links");
function handlePullRequestChange(context, pullRequest) {
    if (pullRequest === void 0) { pullRequest = null; }
    return __awaiter(this, void 0, void 0, function () {
        var pull, head, fixedIssues, conclusion, output, isDevPr, status;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pull = pullRequest || context.payload.pull_request;
                    head = pull.head;
                    fixedIssues = links.getFixedRenderedIssueNumbers(pull.body);
                    conclusion = 'success';
                    isDevPr = pull.labels.some(function (label) { return label.name === 'dev'; });
                    if (fixedIssues.length > 0) {
                        output = {
                            title: 'Linked issues will be resolved on merging of PR',
                            summary: "Following issues will be resolved on merging of this PR: " + fixedIssues.map(function (issue) { return links.getBugzillaLink(issue); })
                        };
                    }
                    else if (isDevPr) {
                        output = {
                            title: 'Issue linking not required for dev PRs',
                            summary: 'Dev Module PRs don\'t require linking issues, hence skipping the check'
                        };
                    }
                    else {
                        conclusion = 'failure';
                        output = {
                            title: 'Please link a bugzilla issue in the PR body',
                            summary: "No issue was found linked to the PR body. Please link a bugzilla issue in the PR in the format `Fixes !2345` where 2345 is the bug ID, \n            or mark this PR as a development module by adding a label to it named `dev`"
                        };
                    }
                    status = {
                        name: 'PR Link Check',
                        head_sha: head.sha,
                        status: 'completed',
                        completed_at: new Date().toISOString(),
                        conclusion: conclusion,
                        output: output,
                        details_url: pull.html_url + "/checks"
                    };
                    return [4 /*yield*/, context.github.checks.create(context.repo(status))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.handlePullRequestChange = handlePullRequestChange;
function handleCheckRunOrSuite(context, target) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (target.pull_requests.length < 1) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, Promise.all(target.pull_requests.map(function (pullRequest) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _a = handlePullRequestChange;
                                        _b = [context];
                                        return [4 /*yield*/, context.github.pulls.get(context.issue({
                                                number: pullRequest.number
                                            }))];
                                    case 1:
                                        _a.apply(void 0, _b.concat([(_c.sent()).data]));
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function handleCheckRun(context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, handleCheckRunOrSuite(context, context.payload.check_run)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.handleCheckRun = handleCheckRun;
function handleCheckSuite(context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, handleCheckRunOrSuite(context, context.payload.check_suite)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.handleCheckSuite = handleCheckSuite;
//# sourceMappingURL=index.js.map