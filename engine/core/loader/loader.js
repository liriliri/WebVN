WebVN.extend('loader', function (exports, util)
{
    var ajaxSettings = {
        type: 'GET',
        beforeSend: empty,
        success: empty,
        error: empty,
        context: null,
        async: true,
        xhr: function () { return new window.XMLHttpRequest() },
        timeout: 0
    };

    var ajax = function (options)
    {
        var settings = util.merge(ajaxSettings, options);

        var dataType = settings.dataType,
            context  = settings.context,
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            xhr      = settings.xhr();

        return new Promise(function (resolve, reject)
        {
            xhr.onload = function ()
            {
                clearTimeout(abortTimeout);

                var status = xhr.status,
                    result = xhr.responseText;

                if ((status >= 200 && status < 300) ||
                    status == 304                   ||
                    (status == 0 && protocol === 'file:'))
                {
                    try {
                        switch (dataType)
                        {
                            case 'script': eval(result); break;
                            case 'xml'   : result = xhr.responseXML; break;
                            case 'json'  : result = JSON.parse(result); break;
                        }
                    } catch(e) {}
                    settings.success.call(context, result, 'success', xhr);
                    resolve(result, xhr);
                } else error();

            };

            if (settings.beforeSend.call(context, xhr, settings) === false) abort();

            xhr.onerror = error;

            if (settings.timeout > 0)
            {
                var abortTimeout = setTimeout(function ()
                {
                    abort();
                }, settings.timeout);
            }

            xhr.open(settings.type, settings.url, settings.async);
            xhr.send(settings.data ? settings.data : null);

            function abort()
            {
                xhr.abort();
                error();
            }

            function error()
            {
                settings.error.call(context, xhr, 'ajaxError', xhr);
                reject(xhr);
            }
        });
    };

    exports.get = function (url, data, success, dataType)
    {
        return ajax({
            type    : 'get',
            url     : url,
            data    : data,
            success : success,
            dataType: dataType
        });
    };

    exports.post = function (url, data, success, dataType)
    {
        return ajax({
            type    : 'post',
            url     : url,
            data    : data,
            success : success,
            dataType: dataType
        });
    };

    function empty() {}
});
