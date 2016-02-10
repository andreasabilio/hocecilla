define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/dom-construct",
    "core/layout/BrowserView",
    "core/AppMenu",
    "core/widgets/appMenuItem",
    "core/AppRegistry"
],function(declare, lang, topic, domConstruct, BrowserView, AppMenu, appMenuItem, AppRegistry){

    return declare("hexa.AppFrame", [BrowserView], {
        baseClass: 'AppFrame BrowserView',

        frameFit: function(){
            this.collectionWidth = 350;

            this.inherited(arguments);
        },

        renderCollection: function(){

            this.collectionView = new AppMenu({
                id: 'AppMenu',
                store: AppRegistry.menu,
                itemWidget: appMenuItem,
                eventId: AppRegistry.app.slug
            });

            domConstruct.place(this.collectionView.domNode, this.collectionNode);
        },

        updateView: function(item){

            // Fetch the requested view
            require([AppRegistry.app.slug + '/views/' + item.slug], lang.hitch(this, 'instanceAndPlaceView', item));
        }
    });
});