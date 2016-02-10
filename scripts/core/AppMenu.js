define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/dom-construct",
    "dijit/registry",
    "core/AppRegistry",
    "core/utils/Ripple",
    "core/layout/CollectionView"
],function(declare, lang, topic, domConstruct, registry, AppRegistry, Ripple, CollectionView){

    return declare("hexacloud.AppMenu", [CollectionView], {
        baseClass: 'AppMenu SimpleContainer ScrollContainer SimpleView CollectionView',

        postCreate: function(){
            this.inherited(arguments);

            // Set logo
            domConstruct.place('<img id="logo" src="'+AppRegistry.app.logo+'" />', this.bannerNode);

            // Setup logo ripple
            this.ripple = new Ripple(this.bannerNode);

            // Listen for menu resize
            this.own( topic.subscribe('AppMenu.resize', lang.hitch(this, function(){

                //console.log('AppMenu.resize!');

                this.scrollbars.resize();
            })));
        },

        renderCollection: function(){

            // Add menu items
            this.store.query({}).forEach(function(item){

                // Add menu items
                if( null === item.parent ){
                    // Add top level item
                    this.addBody( new this.itemWidget({
                        id:         item.id + 'Menu',
                        item:       item,
                        requestId:  this.eventId
                    }) );
                }else{
                    // Add as child
                    registry.byId( item.parent + 'Menu' ).addChild( new this.itemWidget({
                        id:         item.id + 'Menu',
                        item:       item,
                        requestId:  this.eventId
                    }) );
                }

            }, this);
        }
    });
});