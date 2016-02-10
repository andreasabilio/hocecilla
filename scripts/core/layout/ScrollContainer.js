define([
    "dojo/_base/declare",
    "dijit/_TemplatedMixin",
    "core/layout/SimpleContainer",
    "core/utils/ScrollBars",
    "dojo/text!./templates/ScrollContainer.html"
],function(declare, _TemplatedMixin, SimpleContainer, ScrollBars, template){

    return declare("core.widget.scrollContainer", [SimpleContainer, _TemplatedMixin], {
        baseClass:      'SimpleContainer ScrollContainer',
        templateString: template,

        startup: function(){
            this.inherited(arguments);

            // Init scrollbars
            this.scrollbars = new ScrollBars({
                containerNode: this.domNode,
                contentNode:   this.containerNode
            }).render();
        }
    });
});