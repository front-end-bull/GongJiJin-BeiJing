// 用于包装所有的app bridge相关的代码
var appBridge = (function() {
    // 一些特定功能从哪个APP版本开始支持
    var FEATURE_LEAST_VERS = {
        CRM_IMPORT: 1.2,
        APP_SHARE: 1.2,
        APP_VIEW: 1.2,
        H5_APP: 1.0
    };

    // 当前APP和设备的信息
    var APP_INFO = (function(ua) {
        var appMatches = /WeiYi\/(\d\.\d)\b/i.exec(ua);

        var verStr = appMatches && appMatches[1] || '',
            verNum = parseFloat(verStr) || 0.0;
        var isAndroid = /AndroidApp/i.test(ua);
        var isIos = /AppleApp/i.test(ua);

        return {
            IS_APP: !!appMatches && appMatches.length > 0,
            VER: verNum,
            IS_ANDROID: isAndroid,
            IS_IOS: isIos
        };
    })(navigator.userAgent.toLowerCase());

    var NOOP_FUNC = function() {};

    function checkAppFeature(featureName) {
        return APP_INFO.IS_APP && APP_INFO.VER >= (FEATURE_LEAST_VERS[featureName] || 0);
    }
    function isH5App() {
        return APP_INFO.IS_APP && APP_INFO.VER == FEATURE_LEAST_VERS['H5_APP'];
    }

    function isApp() {
        return APP_INFO.IS_APP;
    }
    // iOS 桥接调用，通过调用本函数间接调用原生handler，或注册JS开放给原生的接口。callback会被传入唯一参数bridge。
    //connectIosBridge(function (bridge) {
    //    //调用原生hander的例子如下：
    //    bridge.callHandler('iosHandlerName', {foo: 'bar'});
    //    //注册JS接口给原生调用的例子如下：
    //    bridge.registerHandler('jsHandlerName', someGlobalFunc);
    //});
    function connectIosBridge(callback) {
        if (window.WebViewJavascriptBridge) {
            callback(WebViewJavascriptBridge)
        } else {
            document.addEventListener('WebViewJavascriptBridgeReady', function() {
                callback(WebViewJavascriptBridge)
            }, false)
        }
    }

    // Android桥接调用。
    // JS调用原生只需直接调用window.app.androidHandlerName()
    // 注册JS接口给原生调用只需在window.androidHandler下附加类型为function的属性
    var androidBridge = window.app;
    window.androidHandler = {};

    function initSwipeBack() {
        if (!APP_INFO.IS_APP || !APP_INFO.IS_IOS) {
            return false;
        }
        connectIosBridge(function (bridge) {
            bridge.init(function (message, responseCallback) {
                if (message == -1) {
                    responseCallback(1);
                    goBack();
                }
            });
        });
    }

    // 目前约定原生回调JS均传入唯一参数，类型为基本类型或map（一般Object）
    function registerJSHandler(hdlName, hdlFunc) {
        if (APP_INFO.IS_IOS) {
            connectIosBridge(function (bridge) {
                bridge.registerHandler(hdlName, hdlFunc);
            });
        } else if (APP_INFO.IS_ANDROID) {
            window.androidHandler[hdlName] = hdlFunc;
        }
    }

    // 目前约定JS调原生均传入唯一参数，类型为基本类型
    // 由于Android Javascript Interface只接受基本类型，所以对于Object做序列化。
    // 貌似Android Javascript Interface要求参数个数匹配。
    function callAppBridge(hdlName, argObj) {
        if (APP_INFO.IS_IOS) {
            connectIosBridge(function (bridge) {
                bridge.callHandler('ios' + hdlName, argObj);
            });
        } else if (APP_INFO.IS_ANDROID) {
            var primitiveArg = typeof argObj === 'object' ? JSON.stringify(argObj) : argObj;
            androidBridge && androidBridge['android' + hdlName] && (argObj == undefined ? androidBridge['android' + hdlName]() : androidBridge['android' + hdlName](primitiveArg));
        }
    }

    // 需要向后兼容的一键分享桥接
    function oneKeyShareLegacy(argObj) {
        var str = JSON.stringify(argObj);

        if (APP_INFO.IS_IOS) {
            connectIosBridge(function (bridge) {
                bridge.send(str);
            });
        }  else if (APP_INFO.IS_ANDROID) {
            androidBridge && androidBridge.share && androidBridge.share(str);
        }
    }

    // 分享功能，兼容App 1.0的第三方SDK库和App 1.2的自己代码的分享库
    function share(argObj) {
        var content = argObj.content || argObj.desc || '',
            shareUrl = argObj.shareUrl || argObj.link || '#';

        if (checkAppFeature('APP_SHARE')) {
            callAppBridge('Share', {
                title: argObj.title,
                content: content,
                shareUrl: shareUrl,
                imgUrl: argObj.imgUrl
            });
        } else {
            oneKeyShareLegacy({
                title: argObj.title,
                desc: content,
                link: shareUrl,
                imgUrl: argObj.imgUrl
            });
        }
    }

    return {
        checkAppFeature: checkAppFeature,
        isH5App: isH5App,
        isApp: isApp,
        initSwipeBack: initSwipeBack,
        share: share,
        importContact: checkAppFeature('CRM_IMPORT') ? callAppBridge.bind(null, 'GetContactInfo') : NOOP_FUNC,
        onContactImport: checkAppFeature('CRM_IMPORT') ? registerJSHandler.bind(null, 'jsUpdateContactInfo') : NOOP_FUNC,
        autoImportRecipient: checkAppFeature('CRM_IMPORT') ? callAppBridge.bind(null, 'AutoPopulateRecipientInfo') : NOOP_FUNC,
        notifyShareInfo: checkAppFeature('APP_SHARE') ? callAppBridge.bind(null, 'ShowShareItem') : NOOP_FUNC,
        notifyFavouriteInfo: checkAppFeature('APP_SHARE') ? callAppBridge.bind(null, 'ShowFavouriteItem') : NOOP_FUNC,
        gotoAppView: checkAppFeature('APP_VIEW') ? callAppBridge.bind(null, 'GotoView') : NOOP_FUNC,
        onSessionLost: checkAppFeature('APP_VIEW') ? callAppBridge.bind(null, 'GotoView', 'login') : NOOP_FUNC,
        onAppBackToInputPage: checkAppFeature('APP_VIEW') ? registerJSHandler.bind(null, 'jsOnBackToInputPage') : NOOP_FUNC
    };
})();
