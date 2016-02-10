define([
    "dojo/_base/declare",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/dom-construct"
],function(declare, domStyle, domClass, domConstruct){

    return declare("core.utils.PanesManager", [], {

        constructor: function(enter, leave){
            this.enter = enter;
            this.leave = leave;

            this.new  = null;
            this.old  = null;
        },

        updateNodes: function(view){
            if( null !== this.new ){
                // Store new old view
                this.old = this.new;
            }

            // store the new view
            this.new = view;

            domConstruct.place( this.new.domNode, this.leave );

            this.new.startup();
        },

        prepareNext: function(){
            var tmp = this.enter;

            // Update CSS classes
            domClass.remove(this.enter, 'leave');
            domClass.remove(this.leave, 'enter');

            domClass.add(this.enter, 'enter');
            domClass.add(this.leave, 'leave');

            // Place enter pane for slide
            domStyle.set(this.enter, {
                left: (-1) * 100 + '%',
                opacity: 1
            });

            // Update pointers
            this.enter = this.leave;
            this.leave = tmp;


            // Remove old view?
            if( null !== this.old ){
                this.old.destroyRecursive();
                this.old = null;
            }
        }
    });
});