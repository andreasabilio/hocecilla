define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/store/Memory",
    "dojo/store/Observable",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/json",
    "dojo/topic",
    "core/AppRegistry",
    "core/AppRouter",
    "core/AppFrame",
    "core/utils/Viewport",
    "dojo/text!//andreasabilio.github.io/hocecilla/scripts/manifest.json"
],function(declare, lang, Memory, Observable, dom, domConstruct, JSON, topic, AppRegistry, AppRouter, AppFrame, Viewport, Manifest){

    var AppBase = declare("core.AppBase", null, {

        constructor: function(manifest){

            // Store app info
            AppRegistry.app = manifest.app;

            // Create main menu store
            AppRegistry.menu = new Observable( new Memory({idProperty: 'slug', data: manifest.menu}) );

            // Init viewport manager
            AppRegistry.viewport = new Viewport();

            // Instance the app router
            this.router = new AppRouter();

            // Listen for viewport resize && publish event for app frame
            topic.subscribe('core.viewport.resize', function(viewport){
                topic.publish(AppRegistry.app.slug + '.resize', viewport);
            });
        },

        startup: function(params){

            // Instance app frame
            this.appFrame = new AppFrame({
                id:       'appFrame',
                parent:   AppRegistry.app,
                viewport: AppRegistry.viewport.analyze(),
                eventId:  AppRegistry.app.slug
            }, 'appFrame');

            // Render app banner
            if( params.appBanner )
                domConstruct.place('<div id="AppBanner">' + params.appBanner + '</div>', this.appFrame.domNode);

            // Startup the app frame
            this.appFrame.startup();

            // Startup the app router
            this.router.startup();
        }
    });

    // Instance app base singleton and store in registry
    AppRegistry.appBase = new AppBase(JSON.parse(Manifest));

    // Return the appBase singleton
    return AppRegistry.appBase;
});