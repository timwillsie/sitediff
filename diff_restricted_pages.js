// Render Multiple URLs to file

"use strict";
var RenderUrlsToFile, confFile, config, login, system;

system = require("system");

login = function(config, cb)
{
    var page = require('webpage').create(),
        data = 'username=' + config.login.credentials.username + '&password=' + config.login.credentials.password;

    page.settings.userAgent = config.userAgent;

    page.open(config.login.url, 'post', data, function (status) {
        if (status !== 'success') {
            cb('Unable to post!', null);
        } else {
            cb(null, page);
        }
        phantom.exit();
    });
};


if (system.args.length > 1) {
    confFile = Array.prototype.slice.call(system.args, 1);
} else {
    console.log("Usage: phantomjs diff_restricted_pages.js [confFile]");
    confFile = "./conf.d/default.json";
}

config = require(confFile);

login(config, function(err, page)
{
    if (err)
    {
        console.log(err);
    }
    else
    {
        console.log(page.content);

        var cookies = page.cookies;

        console.log('Listing cookies:');
        for(var i in cookies) {
            console.log(cookies[i].name + '=' + cookies[i].value);
        }
    }
});

// Login durchführen (Cookie speichern)
// Seiten rendern und in einem TEMP-Ordner ablegen
// Bilder mit erwarteten Ergebnissen vergleichen
    // Unterschiede sammeln
    // Mail vorbereiten
    // Mail versenden

/*
RenderUrlsToFile(confFile, (function(status, url, file) {
    if (status !== "success") {
        return console.log("Unable to render '" + url + "'");
    } else {
        return console.log("Rendered '" + url + "' at '" + file + "'");
    }
}), function() {
    return phantom.exit();
});
*/

/*
 Render given urls
 @param array of URLs to render
 @param callbackPerUrl Function called after finishing each URL, including the last URL
 @param callbackFinal Function called after finishing everything
 */
RenderUrlsToFile = function(urls, callbackPerUrl, callbackFinal) {
    var getFilename, next, page, retrieve, urlIndex, webpage;
    urlIndex = 0;
    webpage = require("webpage");
    page = null;
    getFilename = function() {
        return "rendermulti-" + urlIndex + ".png";
    };
    next = function(status, url, file) {
        page.close();
        callbackPerUrl(status, url, file);
        return retrieve();
    };
    retrieve = function() {
        var url;
        if (urls.length > 0) {
            url = urls.shift();
            urlIndex++;
            page = webpage.create();
            page.viewportSize = {
                width: 800,
                height: 600
            };
            page.settings.userAgent = "Phantom.js bot";
            return page.open("http://" + url, function(status) {
                var file;
                file = getFilename();
                if (status === "success") {
                    return window.setTimeout((function() {
                        page.render(file);
                        return next(status, url, file);
                    }), 200);
                } else {
                    return next(status, url, file);
                }
            });
        } else {
            return callbackFinal();
        }
    };
    return retrieve();
};
