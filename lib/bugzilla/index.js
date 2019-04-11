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
require('dotenv').config();
var request_promise_1 = __importDefault(require("request-promise"));
var links_1 = __importDefault(require("../links"));
var auth_1 = require("./auth");
module.exports = {
    getComments: function (bug, refresh) {
        if (refresh === void 0) { refresh = false; }
        return __awaiter(this, void 0, void 0, function () {
            var token, commentsResponse, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, auth_1.getToken(refresh)];
                    case 1:
                        token = _a.sent();
                        auth_1.assertTokenNotNull(token, 'Cannot get comments. Token is null');
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, request_promise_1.default("https://bugzilla.string.org.in/rest.cgi/bug/" + bug + "/comment?token=" + token)];
                    case 3:
                        commentsResponse = _a.sent();
                        return [2 /*return*/, JSON.parse(commentsResponse).bugs[bug.toString()].comments];
                    case 4:
                        error_1 = _a.sent();
                        if (auth_1.shouldRefresh(error_1, refresh)) {
                            return [2 /*return*/, this.getComments(bug, true)];
                        }
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    hasTagComment: function (comments, tag) {
        return !!comments.find(function (comment) { return comment.tags.includes(tag); });
    },
    isBugAlreadyCommentedOn: function (bug, tag) {
        return __awaiter(this, void 0, void 0, function () {
            var comments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getComments(bug)];
                    case 1:
                        comments = _a.sent();
                        return [2 /*return*/, this.hasTagComment(comments, tag)];
                }
            });
        });
    },
    addCommentTag: function (id, tag, refresh) {
        if (refresh === void 0) { refresh = false; }
        return __awaiter(this, void 0, void 0, function () {
            var token, tagResponse, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, auth_1.getToken(refresh)];
                    case 1:
                        token = _a.sent();
                        auth_1.assertTokenNotNull(token, 'Cannot add tag. Token is null');
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, request_promise_1.default.put("https://bugzilla.string.org.in/rest.cgi/bug/comment/" + id + "/tags?token=" + token, {
                                json: {
                                    add: [tag]
                                }
                            })];
                    case 3:
                        tagResponse = _a.sent();
                        console.log("Tag Added on comment " + id + " ", tagResponse);
                        return [2 /*return*/, tagResponse];
                    case 4:
                        error_2 = _a.sent();
                        if (auth_1.shouldRefresh(error_2, refresh)) {
                            return [2 /*return*/, this.addCommentTag(id, tag, true)];
                        }
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    // Low level function. All logic to whether comment or not must be handled by caller
    comment: function (bug, tag, comment, refresh) {
        if (refresh === void 0) { refresh = false; }
        return __awaiter(this, void 0, void 0, function () {
            var token, commentUrl, response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, auth_1.getToken(refresh)];
                    case 1:
                        token = _a.sent();
                        auth_1.assertTokenNotNull(token, 'Cannot post comments. Token is null');
                        commentUrl = "https://bugzilla.string.org.in/rest.cgi/bug/" + bug + "/comment";
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, request_promise_1.default.post(commentUrl + "?token=" + token, {
                                json: {
                                    comment: comment,
                                    comment_tags: [tag]
                                }
                            })
                            // Unfortunately, we don't have latest bugzilla, so we need to update the comment with a tag instead of adding it
                            // at the time of creation
                        ];
                    case 3:
                        response = _a.sent();
                        // Unfortunately, we don't have latest bugzilla, so we need to update the comment with a tag instead of adding it
                        // at the time of creation
                        console.log("Commented on bug " + bug + " ", response);
                        return [2 /*return*/, this.addCommentTag(response.id, tag)];
                    case 4:
                        error_3 = _a.sent();
                        if (auth_1.shouldRefresh(error_3, refresh)) {
                            return [2 /*return*/, this.comment(bug, tag, comment, true)];
                        }
                        throw error_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    getPullRequestFixingMessage: function (pullRequest) {
        return "Merging of Pull Request " + pullRequest.html_url + " will resolve this bug.\nAuthor: " + pullRequest.user.login;
    },
    addFixComment: function (bug, pullRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var tag;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tag = "gh-pr-" + pullRequest.number;
                        return [4 /*yield*/, this.isBugAlreadyCommentedOn(bug, tag)];
                    case 1:
                        if (!(_a.sent())) {
                            return [2 /*return*/, this.comment(bug, tag, this.getPullRequestFixingMessage(pullRequest))];
                        }
                        return [2 /*return*/];
                }
            });
        });
    },
    addFixCommentForPr: function (pullRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var fixedIssues, promises, _i, fixedIssues_1, issue;
            return __generator(this, function (_a) {
                fixedIssues = links_1.default.getFixedIssueNumbers(pullRequest.body);
                promises = [];
                for (_i = 0, fixedIssues_1 = fixedIssues; _i < fixedIssues_1.length; _i++) {
                    issue = fixedIssues_1[_i];
                    promises.push(this.addFixComment(issue, pullRequest)
                        .catch(console.error));
                }
                return [2 /*return*/, Promise.all(promises)];
            });
        });
    }
};
//# sourceMappingURL=index.js.map