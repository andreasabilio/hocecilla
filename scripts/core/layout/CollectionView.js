define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "core/AppRegistry",
    "core/layout/SimpleView"
],function(declare, lang, AppRegistry, SimpleView){

    return declare("core.layout.CollectionView", [SimpleView], {
        baseClass: 'SimpleContainer ScrollContainer SimpleView CollectionView',

        postCreate: function(){
            //this.inherited(arguments);

            // Render collection if store && item widget are provided
            if( !this.store ){
                console.error('[CollectionView] Error: no collection store provided!');
                return;
            }else if( !this.itemWidget ){
                console.error('[CollectionView] Error: no collection item widget provided!');
                return;
            }

            // Fit body height
            this.fit( AppRegistry.viewport.analyze() );

            // Render the collection
            this.renderCollection();

            // XXX
            //console.log(this);
        },

        renderCollection: function(){

            this.store.query({}).forEach(function(item){
                this.addBody( new this.itemWidget({
                    id: 'Item-' + item.id,
                    item: item,
                    requestId: this.eventId
                }));
            }, this);
        }
    });
});