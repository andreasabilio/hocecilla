define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/dom-class",
    "dijit/Viewport"
], function(declare, lang, topic, domClass, Viewport){

    return declare("core.utils.Viewport", [], {

        constructor: function(){
            // Viewport resize listener
            Viewport.on('resize', lang.hitch(this, "onResize") );
        },

        getEffectiveBox: function(){
            return Viewport.getEffectiveBox();
        },

        analyze: function(){
            var box  = this.getEffectiveBox();
            var type = this.getType(box);

            return {
                type: type,
                size: box
            };
        },

        getType: function(box){
            var type;

            if( 400 > box.w )
                type = 'phone_p';
            else if( 400 <= box.w && box.w < 600 )
                type = 'phone_l';
            else if( 600 <= box.w && box.w < 900 )
                type = 'tablet_p';
            else if( 900 <= box.w && box.w < 1024 )
                type = 'tablet_l';
            else if( 1024 <= box.w && box.w < 1400 )
                type = 'desktop_sm';
            else if( 1400 <= box.w && box.w < 1800 )
                type = 'desktop_md';
            else if( 1800 <= box.w )
                type = 'desktop_lg';

            return type;
        },

        onResize: function(){
            // Publish resize events
            topic.publish('core.viewport.resize', this.analyze());
            topic.publish("core.scrollbars.resize");
        }
    });
});