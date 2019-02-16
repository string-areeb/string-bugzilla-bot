"use strict";
var prefixes = ['bz-', 'bug ', 'issue ', '!'];
var fixVerbs = ['Fixes', 'Closes', 'Resolves'];
function createBugRegex() {
    var suffix = '(\\d+)';
    return prefixes
        .map(function (prefix) { return "(?:" + prefix + suffix + ")"; })
        .join('|');
}
var bugRegex = createBugRegex();
function createIssueRegex() {
    return new RegExp("(?:^|[\\s.,;()?!])(" + bugRegex + ")", 'ig');
}
function createFixesIssueRegex() {
    var fixRegex = fixVerbs.map(function (verb) { return "(?:" + verb + ")"; })
        .join('|');
    return new RegExp("(?:^|[\\s.,;()?!])(?:(?:(" + fixRegex + ")) )(" + bugRegex + ")", 'ig');
}
var issueRegex = createIssueRegex();
var fixesIssueRegex = createFixesIssueRegex();
module.exports = {
    replaceLinks: function (body) {
        return body.replace(issueRegex, function (match, reference) {
            var possibleCaptures = Array.from(arguments).slice(2, arguments.length - 2);
            var capture = null;
            for (var _i = 0, possibleCaptures_1 = possibleCaptures; _i < possibleCaptures_1.length; _i++) {
                var possibleCapture = possibleCaptures_1[_i];
                if (possibleCapture !== undefined) {
                    capture = possibleCapture;
                    break;
                }
            }
            return match.replace(reference, "[" + reference + "](https://bugzilla.string.org.in/show_bug.cgi?id=" + capture + ")");
        });
    },
    getFixedIssueNumbers: function (body) {
        var matched = body.match(fixesIssueRegex);
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
};
//# sourceMappingURL=index.js.map