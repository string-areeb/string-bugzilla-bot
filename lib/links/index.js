"use strict";
module.exports = {
    replaceLinks: function (body) {
        var regex = /(?:^|[\s.,;()?!])(bz-(\d+))/g;
        return body.replace(regex, function (match, reference, capture) {
            return match.replace(reference, "[" + reference + "](https://bugzilla.string.org.in/show_bug.cgi?id=" + capture + ")");
        });
    }
};
//# sourceMappingURL=index.js.map