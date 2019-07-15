"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prefixes = ['bz-', 'bug ', 'issue ', '!'];
var fixVerbs = ['Fixes', 'Closes', 'Resolves'];
function createBugRegex(prefix, suffix) {
    if (prefix === void 0) { prefix = ''; }
    if (suffix === void 0) { suffix = ''; }
    var bugNumber = '(\\d+)';
    return prefixes
        .map(function (keyword) { return "(?:" + prefix + keyword + bugNumber + suffix + ")"; })
        .join('|');
}
var bugRegex = createBugRegex();
function createIssueRegex() {
    return new RegExp("(?:^|[\\s.,;()?!])(" + bugRegex + ")", 'ig');
}
function createFixesIssueRegex(prefix, suffix) {
    if (prefix === void 0) { prefix = undefined; }
    if (suffix === void 0) { suffix = undefined; }
    var bugRegexString = (!prefix && !suffix) ? bugRegex : createBugRegex(prefix, suffix);
    var fixRegex = fixVerbs.map(function (verb) { return "(?:" + verb + ")"; })
        .join('|');
    return new RegExp("(?:^|[\\s.,;()?!])(?:(?:(" + fixRegex + ")) )(" + bugRegexString + ")", 'ig');
}
var issueRegex = createIssueRegex();
var fixesIssueRegex = createFixesIssueRegex();
var fixesRenderedIssueRegex = createFixesIssueRegex('\\[?', '\\]?');
function extractIssues(regex, body) {
    var matched = (body || '').match(regex);
    if (matched != null) {
        return matched.map(function (match) {
            var issue = match.match('\\d+');
            if (issue != null) {
                return parseInt(issue[0]);
            }
            else {
                return null;
            }
        }).filter(function (item) { return item != null; });
    }
    return [];
}
function getBugzillaLink(bug, reference) {
    if (reference === void 0) { reference = bug; }
    return "[" + reference + "](https://bugzilla.string.org.in/show_bug.cgi?id=" + bug + ")";
}
exports.getBugzillaLink = getBugzillaLink;
function replaceLinks(body) {
    return (body || '').replace(issueRegex, function (match, reference) {
        var possibleCaptures = Array.from(arguments).slice(2, arguments.length - 2);
        var capture = null;
        for (var _i = 0, possibleCaptures_1 = possibleCaptures; _i < possibleCaptures_1.length; _i++) {
            var possibleCapture = possibleCaptures_1[_i];
            if (possibleCapture !== undefined) {
                capture = possibleCapture;
                break;
            }
        }
        return match.replace(reference, getBugzillaLink(capture, reference));
    });
}
exports.replaceLinks = replaceLinks;
function getFixedIssueNumbers(body) {
    return extractIssues(fixesIssueRegex, body);
}
exports.getFixedIssueNumbers = getFixedIssueNumbers;
function getFixedRenderedIssueNumbers(body) {
    return extractIssues(fixesRenderedIssueRegex, body);
}
exports.getFixedRenderedIssueNumbers = getFixedRenderedIssueNumbers;
//# sourceMappingURL=index.js.map