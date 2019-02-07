"use strict";
module.exports = {
    replaceLinks: function (body) {
        var regex = /bz-(\d+)/g;
        return body.replace(regex, function (match, capture) {
            return "[" + match + "](https://bugzilla.string.org.in/show_bug.cgi?id=" + capture + ")";
        });
    }
};
//# sourceMappingURL=index.js.map