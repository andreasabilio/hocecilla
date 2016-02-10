define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/fx",
    "dojo/on",
    "dojo/topic",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dijit/_WidgetBase",
    "dijit/registry",
    "core/AppRegistry"
],function(declare, lang, fx, on, topic, domConstruct, domClass, _WidgetBase, registry, AppRegistry) {

    return declare("core.utils._SingleSelected", [_WidgetBase], {

        // Attributes //////////////////////////////////////////////////////////////////////////////////////////////////

        active: false,
        _setActiveAttr: function (/* bool*/ active) {
            this.active = active;

            if (active) {
                domClass.add(this.domNode, 'active');
            } else {
                domClass.remove(this.domNode, 'active');
            }

        },


        // Methods /////////////////////////////////////////////////////////////////////////////////////////////////////

        postCreate: function(){
            // Run parent method
            this.inherited(arguments);

            // On click event name
            this.onClickEvent = this.requestId + '.render';

            // Register events
            this.registerEvents();
        },

        registerEvents: function(){
            // Register click event
            on(this.domNode, 'click', lang.hitch(this, function(e){ this.onClick(e); }));

            // Listen for route updates
            this.own( topic.subscribe( this.requestId + '.render', lang.hitch(this, function(item){
                this.onRequest(item);
            })) );
        },

        onClick: function(e){
            e.stopPropagation();

            if( !this.get('active') )
                topic.publish(this.onClickEvent, this.item );
        },

        onRequest: function(item){
            if( item.id === this.item.id && !this.get('active') )
                this.set('active', true);
            else
                this.set('active', false);
        }
    });
});