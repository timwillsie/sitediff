// Render Multiple URLs to file

"use strict";
var RenderUrlsToFile, confFile, config, login, system;

system             = require("system");
var CATCH_FUNCTION = function (err)
{
    for (var key in err)
    {
        console.log('CATCH!!! key: ' + key + ' => value: ' + err[key]);
    }
};
phantom.onError    = CATCH_FUNCTION;

var createPage = function()
{
    var page = require('webpage').create();

    page.settings.userAgent       = config.userAgent;
    page.settings.resourceTimeout = 2000;
    page.onError                  = phantom.onError;
    page.onResourceTimeout        = CATCH_FUNCTION;

    return page;
};

login = function (config, cb)
{
    var page = createPage(),
        data = '';

    page.viewportSize = {
        width : 1024,
        height: 800
    };

    for (var key in config.login.credentials)
    {
        if (data.length > 0)
        {
            data += "&";
        }
        data += key + "=" + config.login.credentials[key];
    }

    try
    {
        page.open(config.login.url, 'post', data, function (status)
        {
            if (status !== 'success')
            {
                cb('Unable to post!', null);
            }
            else
            {
                page.render('./current/login.png');

                page.close();
                cb();
            }
            phantom.exit();
        });
    }
    catch (err)
    {
        CATCH_FUNCTION(err);
    }
};

/*
 Render given urls
 @param array of URLs to render
 @param callbackPerUrl Function called after finishing each URL, including the last URL
 @param callbackFinal Function called after finishing everything
 */
RenderUrlsToFile = function (pages, callbackPerUrl, callbackFinal)
{
    console.log("LOGIN: pages: " + pages[0].name);

    var urlIndex = 0,
        // crypto   = require('crypto'),
        retrieve, next, getFilename, getMd5Sum, page;

    getMd5Sum = function (string)
    {
        // return crypto.createHash('md5').update(string).digest('hex');
        return string;
    };

    getFilename = function (url)
    {
        return "./current/" + urlIndex + ".png";
        // return "./current/" + getMd5Sum(pages[urlIndex].url) + ".png";
    };

    next = function (status, url, file)
    {
        page.close();
        callbackPerUrl(status, url, file);
        return retrieve();
    };

    retrieve = function ()
    {
        var url;
        if (pages.length > 0)
        {
            url = pages.shift();
            urlIndex++;
            page = createPage();

            console.log('RENDER: trying to render: ' + url.name);
            try
            {
                return page.open(url.url, function (status)
                {
                    var file = getFilename(url.url);
                    console.log('RENDER: got filename ' + file);
                    if (status === "success")
                    {
                        console.log('RENDER: Successfully rendered ' + url.url);

                        return window.setTimeout((function ()
                        {
                            page.render(file);
                            return next(status, url.url, file);
                        }), 200);
                    }
                    else
                    {
                        console.log('RENDER: ERROR: ' + url.url);
                        return next(status, url.url, file);
                    }
                });
            }
            catch (err)
            {
                CATCH_FUNCTION(err);
            }
        }
        else
        {
            console.log('RENDER: reached end of pages.length. exit now');
            return callbackFinal();
        }
    };
    return retrieve();
};


if (system.args.length > 1)
{
    confFile = Array.prototype.slice.call(system.args, 1);
}
else
{
    console.log("Usage: phantomjs diff_restricted_pages.js [confFile]");
    confFile = "./conf.d/default.json";
}

config = require(confFile);

// Login durchführen (Cookie speichern)
login(config, function (err, page)
{
    if (err)
    {
        // Error
        console.log(err);
    }
    else
    {
        // Success
        // Seiten rendern und in einem TEMP-Ordner ablegen
        console.log('SUCCESS: logged in. Now trying to render the pages');
        try
        {
            RenderUrlsToFile(
                config.pages,
                page,
                function (status, url, file)
                {
                    if (status !== "success")
                    {
                        return console.log("Unable to render '" + url + "'");
                    }
                    else
                    {
                        // Bilder mit erwarteten Ergebnissen vergleichen
                        // Unterschiede sammeln
                        // Mail vorbereiten
                        // Mail versenden
                        return console.log("Rendered '" + url + "' at '" + file + "'");
                    }
                }
                ,
                function ()
                {
                    page.close();
                    return phantom.exit();
                }
            );
        }
        catch (err)
        {
            CATCH_FUNCTION(err);
        }
    }
});
