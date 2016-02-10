require([
    "core/AppBase",
    "dojo/text!dashboard/appBanner.html",
    "dojo/domReady!"
],function(AppBase, appBanner){

    // Start up the app
    AppBase.startup({appBanner: appBanner});
});