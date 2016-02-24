define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/topic",
    "dijit/_TemplatedMixin",
    "core/layout/SimpleContainer",
    "core/utils/_SingleActiveMixin",
    //"//raw.githubusercontent.com/andreasabilio/hocecilla/gh-pages/scripts/core/utils/_SingleActiveMixin.js",
    "core/utils/Ripple",
    "dojo/text!./templates/simpleCollectionItem.html"
],function(declare, lang, on, topic, _TemplatedMixin, SimpleContainer, _SingleActiveMixin, Ripple, template){

    return declare("core.widgets.simpleCollectionItem", [SimpleContainer, _TemplatedMixin, _SingleActiveMixin], {
        baseClass:      'SimpleContainer simpleCollectionItem collectionItem',
        templateString: template,

        postCreate: function(){
            this.inherited(arguments);


            // Setup ripple effect
            this.ripple = new Ripple(this.domNode);
        }
    });
});