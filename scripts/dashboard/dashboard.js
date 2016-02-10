require([
    "core/AppBase",
    "dojo/text!//andreasabilio.github.io/hocecilla/scripts/dashboard/appBanner.html",
    "dojo/domReady!"
],function(AppBase, appBanner){

    // Start up the app
    AppBase.startup({appBanner: appBanner});
});