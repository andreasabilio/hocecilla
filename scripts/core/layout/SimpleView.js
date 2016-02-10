define([
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/dom",
    "core/AppRegistry",
    "core/utils/Viewport",
    "core/layout/ScrollContainer",
    "dojo/text!./templates/SimpleView.html",
    "dojo/domReady!"
],function(declare, domConstruct, domStyle, dom, AppRegistry, Viewport, ScrollContainer, template){

    //var bannerHeight = domStyle.get( dom.byId('frameBanner'), 'height');

    return declare("core.layout.SimpleView", [ScrollContainer], {
        baseClass:      'SimpleContainer ScrollContainer SimpleView',
        templateString: template,
        bannerHeight:   null,

        postCreate: function(){
            this.inherited(arguments);

            //if( this.banner ) this.addBanner(this.banner);
            //if( this.body   ) this.addBody(this.body);

            // XXX: DEMO
            if( this.banner ) domConstruct.place(this.banner, this.bannerNode);
            if( this.body   ) domConstruct.place(this.body, this.bodyNode);


            // Fit body height
            this.fit( AppRegistry.viewport.analyze() );
        },

        fit: function( viewport ){

            // Get banner height
            if( null === this.bannerHeight ){
                this.bannerHeight = domStyle.get( this.bannerNode, 'height');
            }


            // Set body height
            domStyle.set(this.viewMask, 'height', viewport.size.h - this.bannerHeight + 'px');
        },

        addBanner: function(banner){
            domConstruct.place(banner.domNode, this.bannerNode);
        },

        addBody: function(body){
            domConstruct.place(body.domNode, this.bodyNode);
        }
    });
});