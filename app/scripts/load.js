/**
    This file is part of JiraRTL Chrom plugin.
    Copyright (C)Evgeny Tsirkin

    JiraRTL is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JiraRTL is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of 
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Foobar.  If not, see <https://www.gnu.org/licenses/>.
 */

var Rtl = require("./rtl.js");
var scriptEl = document.getElementById("jira-rtl-script");
if (!scriptEl) {
    var s = document.createElement('script');
    // TODO: add "script.js" to web_accessible_resources in manifest.json
    s.src = chrome.extension.getURL('rtl.js');
    s.onload = function () {
        if (global.jiraRtl) return;
        let oRtl = global.jiraRtl = new Rtl();
        oRtl.startRtlWatching();
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}
