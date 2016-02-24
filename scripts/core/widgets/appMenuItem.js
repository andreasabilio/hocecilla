define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/topic",
    "dojo/fx",
    "dojo/fx/easing",
    "dojo/dom-class",
    "dijit/registry",
    "dijit/_TemplatedMixin",
    "core/layout/SimpleContainer",
    "core/utils/_SingleActiveMixin",
    //"//raw.githubusercontent.com/andreasabilio/hocecilla/gh-pages/scripts/core/utils/_SingleActiveMixin.js",
    "core/utils/Ripple",
    "dojo/text!./templates/appMenuItem.html"
],function(declare, lang, on, topic, fx, easing, domClass, registry, _TemplatedMixin, SimpleContainer, _SingleActiveMixin, Ripple, template){

    return declare("core.widgets.appMenuItem", [SimpleContainer, _TemplatedMixin, _SingleActiveMixin], {
        baseClass:      'SimpleContainer simpleCollectionItem collectionItem appMenuItem',
        templateString: template,

        // Attributes //////////////////////////////////////////////////////////////////////////////////////////////////

        ancestor: false,
        _setAncestorAttr: function (/* bool*/ ancestor) {
            this.ancestor = ancestor;

            if(ancestor) {
                domClass.add(this.domNode, 'ancestor');
            } else {
                domClass.remove(this.domNode, 'ancestor');
            }
        },


        // Methods /////////////////////////////////////////////////////////////////////////////////////////////////////

        postCreate: function(){
            this.inherited(arguments);

            // On click event name
            this.onClickEvent = this.requestId + '.request';

            // Setup ripple effect
            this.ripple = new Ripple(this.parentNode);
        },

        addChild: function(){
            this.inherited(arguments);

            domClass.add(this.domNode, 'hasChildren');
        },

        onRequest: function(item){

            // Set item status
            if( item.slug === this.item.slug ){
                //// This is the clicked item

                // Have children?
                if( this.hasChildren() && (!this.get('active') || !this.get('ancestor')) ){

                    // Expand node
                    this.wipeAnimation(fx.wipeIn, this);
                }

                // Unmake ancestor
                this.set('ancestor', false);

                // Make active
                this.set('active', true);

            }else{
                //// This is NOT the clicked item

                // Activating a child node?
                if( item.parent === this.item.slug ){

                    // Is this already an ancestor node?
                    if( !this.get('ancestor') ){

                        // Expand node
                        this.wipeAnimation(fx.wipeIn, this);

                        // Make ancestor
                        this.set('ancestor', true);
                    }
                }else if( this.hasChildren() && (this.get('ancestor') || this.get('active')) ){
                    // This is not an ancestor

                    // Collapse node
                    this.wipeAnimation(fx.wipeOut, this);

                    // Unmake ancestor
                    this.set('ancestor', false);
                }

                // Make inactive
                this.set('active', false);
            }
        },

        wipeAnimation: function(animation, node){

            animation({
                node: node.containerNode,
                duration: 500,
                easing: easing.quadOut,
                onEnd: function(){ topic.publish('AppMenu.resize'); }
            }).play();
        }
    });
});