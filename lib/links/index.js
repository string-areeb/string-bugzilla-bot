"use strict";
var prefixes = ['bz-', 'bug ', 'issue ', '!'];
function createRegex() {
    var suffix = '(\\d+)';
    var bugRegex = prefixes
        .map(function (prefix) { return "(?:" + prefix + suffix + ")"; })
        .join('|');
    return new RegExp("(?:^|[\\s.,;()?!])(" + bugRegex + ")", 'ig');
}
var regex = createRegex();
module.exports = {
    replaceLinks: function (body) {
        return body.replace(regex, function (match, reference) {
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
    }
};
//# sourceMappingURL=index.js.map