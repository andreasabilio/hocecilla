define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_Container",
    "dijit/_Contained"
],function(declare, _WidgetBase, _Container, _Contained){

    return declare("core.layout.simpleContainer", [_WidgetBase, _Container, _Contained], {
        baseClass:  'SimpleContainer'
    });
});