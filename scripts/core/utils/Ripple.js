define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/on",
  "dojo/dom-construct",
  "dojo/dom-class",
  "dijit/_Container"
], function(declare, lang, on, domConstruct, domClass, _Container){

  return declare("core.utils.Ripple", [_Container], {

    constructor: function(targetNode){
      this.inherited(arguments);

      // Store target node
      this.targetNode = targetNode || this.domNode;

      // Set target style
      domConstruct.create(this.targetNode, {style: {position: 'relative', overflow: 'hidden'}});

      // Create ripple carrier
      this.ripple = domConstruct.create("div", {
        style: {
          position: "absolute",
          top: 0,
          left: 0
        },
        class: "ripple"
      }, this.targetNode);

      // Hook ripple animation to click event
      on(this.targetNode, 'click', lang.hitch(this, function(e){

        domConstruct.create(this.ripple, {
          style: {
            top:  e.layerY+'px',
            left: e.layerX+'px'
          },
          class: 'ripple active'
        });

        // Deactivate
        setTimeout((function(){
          domClass.remove(this.ripple, 'active');
        }).bind(this), 500);
      }));
    }
  });
});
