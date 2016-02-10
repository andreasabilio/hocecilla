define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/sniff",
    "dojo/has",
    "dojo/topic",
    "dojo/mouse",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dnd/move",
    "dijit/Destroyable"
],function(declare, lang, on, sniff, has, topic, mouse, domStyle, domConstruct, domGeometry, domClass, move, Destroyable){

    // Scroll manager //////////////////////////////////////////////////////////////////////////////////////////////////
    var ScrollDom = declare("core.utils.ScrollDom", null, {

        // Common properties
        railSize:      8,
        activeTimeout: 2000,

        constructor: function(params){

            // Mixin params
            lang.mixin(this, params);

            // Private properties
            this.scrollbar      = {'vertical': {}, 'horizontal': {}};
            this.isActive       = {'vertical': false, 'horizontal': false};
            this.isMoving       = {'vertical': false, 'horizontal': false};
            this.isPrepared     = false;
            this.proportion     = {};

            this.haveVertical   = false;
            this.haveHorizontal = false;

            this.needVertical   = false;
            this.needHorizontal = false;
        },

        // Measure nodes and store values
        measure: function(){

            // Measure nodes
            this.dimensions = {
                container: {
                    w: domStyle.get(this.containerNode, "width"),
                    h: domStyle.get(this.containerNode, "height")
                },
                content: {
                    w: domStyle.get(this.contentNode, "width"),
                    h: domStyle.get(this.contentNode, "height")
                }
            };

            // Calculate scroll sizes dependent on container and content sizes
            this.calculate();
        },

        calculate: function(){

            // Compare nodes to determine whether any scrollbar is needed
            this.needVertical   = (this.dimensions.content.h > this.dimensions.container.h);
            this.needHorizontal = (this.dimensions.content.w > this.dimensions.container.w);

            // Determine scroll handles size
            this.scrollbar.vertical.handleSize   = this.getHandleSize(this.dimensions.container.h, this.dimensions.content.h);
            this.scrollbar.horizontal.handleSize = this.getHandleSize(this.dimensions.container.w, this.dimensions.content.w);

            // Determine visible proportion
            this.proportion.vertical   = this.dimensions.container.h / this.dimensions.content.h;
            this.proportion.horizontal = this.dimensions.container.w / this.dimensions.content.w

        },

        // Calculate handle size
        getHandleSize: function(containerSize, contentSize){
            // Calculate size
            var size = Math.round( (containerSize / contentSize) * containerSize );

            // Make sure there is a minimum size
            return Math.max(size, this.railSize);
        },


        // Scrollbar status
        setActive: function(type, duration){

            // If active then reset else set active class
            if( this.isActive[type] )
                clearTimeout(this.isActive[type]);
            else
                domClass.add(this.scrollbar[type].rail, 'active');

            // Set active timeout
            var that = this;
            this.isActive[type] = setTimeout(function(){
                // Remove class
                domClass.remove(that.scrollbar[type].rail, 'active');

                // Clear timeout
                clearTimeout(that.isActive[type]);
                that.isActive[type] = false;
            }, duration || this.activeTimeout);
        },

        setInactive: function(type){
            if( this.isActive[type] ){
                clearTimeout(this.isActive[type]);
                domClass.remove(this.scrollbar[type].rail, 'active');
            }
        },

        setMoving: function(type){

            // If moving then reset else set moving class
            if( this.isMoving[type] )
                clearTimeout(this.isMoving[type]);
            else
                domClass.add(this.scrollbar[type].rail, 'moving');

            // Set active timeout
            var that = this;
            this.isMoving[type] = setTimeout(function(){
                // Remove class
                domClass.remove(that.scrollbar[type].rail, 'moving');

                // Clear timeout
                clearTimeout(that.isMoving[type]);
                that.isMoving[type] = false;
            }, this.activeTimeout);
        },



        // Render methods //////////////////////////////////////////////////////////////////////////////////////////////

        render: function(type){

            // Prepare container and content?
            if( !this.isPrepared ){
                domStyle.set(this.containerNode, {position: 'relative', overflow: "hidden"});
                domStyle.set(this.contentNode, {position: "absolute", top: "0px", left: "0px", right: "auto"});
            }


            // Determine scroll type
            switch(type){
                case 'vertical':
                    this._renderVertical();
                    break;
                case 'horizontal':
                    this._renderHorizontal();
                    break;
            }
        },

        _renderVertical: function(){

            // Render vertical rail
            this.scrollbar.vertical.rail = domConstruct.create("div", {
                    class: "ScrollbarRail verticalScrollbar",
                    style: "overflow: hidden; position: absolute; right: 0px;top: 0;  height: 100%; width: "+this.railSize+"px; "
                }, this.containerNode);

            // Render vertical scroll handle
            this.scrollbar.vertical.handle = domConstruct.create("div", {
                    class: "ScrollbarHandle verticalHandle",
                    style: "position: absolute; right: 0; top: 0; width: 100%; height: "+this.scrollbar.vertical.handleSize+"px;"
                }, this.scrollbar.vertical.rail);

            // Set flag
            this.haveVertical = true;
        },

        _renderHorizontal: function(){

            // Render horizontal rail
            this.scrollbar.horizontal.rail = domConstruct.create("div", {
                    class: "ScrollbarRail horizontalScrollbar",
                    style: "overflow: hidden; position: absolute; right: 0; bottom: 0px;  width: 100%; height: "+this.railSize+"px;"
                }, this.containerNode);

            // Render scroll bar
            this.scrollbar.horizontal.handle = domConstruct.create("div", {
                    class: "ScrollbarHandle horizontalHandle",
                    style: "position: absolute; top: 0; left: 0; height: 100%; width: "+this.scrollbar.horizontal.handleSize+"px;"
                }, this.scrollbar.horizontal.rail);

            // Set flag
            this.haveHorizontal = true;
        },


        // Destroy methods /////////////////////////////////////////////////////////////////////////////////////////////

        destroy: function(type){
            // Determine scroll type
            switch(type){
                case 'vertical':
                    this._destroyVertical();
                    break;
                case 'horizontal':
                    this._destroyHorizontal();
                    break;
            }
        },

        _destroyVertical: function(){
            domConstruct.destroy(this.scrollbar.vertical.handle);
            domConstruct.destroy(this.scrollbar.vertical.rail);
        },

        _destroyHorizontal: function(){
            domConstruct.destroy(this.scrollbar.horizontal.handle);
            domConstruct.destroy(this.scrollbar.horizontal.rail);
        }
    });



    // Scroller class: does the actual scrolling ///////////////////////////////////////////////////////////////////////
    var Scroller = declare("core.utils.Scroller", null, {

        // Common properties
        positionLabel: {vertical: 'top', horizontal: 'left'},

        constructor: function(scrollDom){
            // Store scrollDom object
            this.scrollDom = scrollDom;

            // Set upper max content offset
            this.contentMax = this.scrollDom.dimensions.container.h - this.scrollDom.dimensions.content.h;
            this.handleMax  = this.scrollDom.dimensions.container.h - this.scrollDom.scrollbar.vertical.handleSize;

            // Set position deltas
            this.contentDelta = 25;
            this.handleDelta  = Math.round( (-1) * this.contentDelta * (this.scrollDom.dimensions.container.h / this.scrollDom.dimensions.content.h) );
        },

        scroll: function(params){
            // XXX
            //console.log('direction = ', direction);

            // Make scrollbar active
            this.scrollDom.setActive(params.type);

            // Determine scroll type
            if( !params.position && 0 !== params.position ){
                this.scrollContent(params);
                this.scrollHandle(params);
            }else{
                this.contentJump(params);
                this.handleJump(params);
            }
        },

        scrollContent: function(params){
            // Calculate new position
            var current  = domStyle.get(this.scrollDom.contentNode, 'top');
            var updated  = current + this.contentDelta * params.direction;

            // XXX
            //console.log('Current  = ', current);
            //console.log('Updated  = ', updated);
            //console.log('UpperMax = ', this.contentMax);
            //console.log('    next = ', updated + this.contentDelta * direction);
            //console.log('          ');

            // Apply new position
            if( 0 < updated )
                domStyle.set(this.scrollDom.contentNode, 'top', '0px');
            else if( this.contentMax > updated || this.contentMax > updated + this.contentDelta * params.direction )
                domStyle.set(this.scrollDom.contentNode, 'top', this.contentMax + 'px');
            else
                domStyle.set(this.scrollDom.contentNode, 'top', updated + 'px');
        },

        scrollHandle: function(params){

            // Calculate new position
            var current  = domStyle.get(this.scrollDom.scrollbar.vertical.handle, 'top');
            var updated  = current + this.handleDelta * params.direction;

            // XXX
            //console.log('Current  = ', current);
            //console.log('Updated  = ', updated);
            //console.log('UpperMax = ', this.handleMax);
            //console.log('    next = ', updated + this.handleDelta * direction);
            //console.log('          ');

            // Apply new position
            if( 0 > updated )
                domStyle.set(this.scrollDom.scrollbar.vertical.handle, 'top', '0px');
            else if( this.handleMax < updated || this.handleMax < updated + this.handleDelta * params.direction )
                domStyle.set(this.scrollDom.scrollbar.vertical.handle, 'top', this.handleMax + 'px');
            else
                domStyle.set(this.scrollDom.scrollbar.vertical.handle, 'top', updated + 'px');
        },

        contentJump: function(params){
            domStyle.set(this.scrollDom.contentNode, ('vertical' === params.type)? 'top' : 'left', params.position + 'px');
        },

        handleJump: function(params){
            var position = Math.round( Math.abs(params.position * this.scrollDom.proportion[params.type]) );
            domStyle.set(this.scrollDom.scrollbar[params.type].handle, ('vertical' === params.type)? 'top' : 'left', position + 'px');
        }
    });



    // Scrollbar class /////////////////////////////////////////////////////////////////////////////////////////////////
    return declare("core.utils.ScrollManager", [Destroyable], {

        // Scroll direction map
        scrollDirection: {forth: -1, back: 1},

        // Determine if UA needs scrollbars
        //isScrollableUA: !( has('touch') || has('mac') ),
        isScrollableUA: !has('touch'),

        constructor: function(params){

            // Verify params
            if( !params.containerNode || !params.contentNode ){
                console.error('[Scrollbars] Error: missing containerNode or contentNode');
                return;
            }

            // Private methods
            this.events  = {vertical: {}, horizontal: {}};
            this.yScroll = true;
            this.xScroll = true;

            // Mixin params
            lang.mixin(this, params);

            // Setup scroll DOM?
            if( !this.isScrollableUA )
                return;

            // Instance scrollbars dom manager
            this.scrollDom = new ScrollDom({
                containerNode: params.containerNode,
                contentNode:   params.contentNode
            });
        },

        resize: function(){
            // Just render again
            this.render();
        },

        // Render methods //////////////////////////////////////////////////////////////////////////////////////////////

        render: function(){

            // Measure nodes?
            if( !this.isScrollableUA )
                return;

            // Measure nodes && determine scrollbar(s) need
            this.scrollDom.measure();

            // Instance scroll handler
            this.scroller = new Scroller(this.scrollDom);

            // Render vertical scrollbar?
            if( this.scrollDom.needVertical && this.yScroll )
                this._renderScroll('vertical');
            else if( this.scrollDom.haveVertical )
                this._destroyScroll('vertical');

            // Render horizontal scrollbar?
            if( this.scrollDom.needHorizontal && this.xScroll )
                this._renderScroll('horizontal');
            else if( this.scrollDom.haveHorizontal )
                this._destroyScroll('horizontal');

            // Chaining
            return this;
        },

        _renderScroll: function(type){
            // Render
            this.scrollDom.render(type);

            // Events
            this.registerEvents(type);
        },

        _destroyScroll: function(type){
            // Destroy rendering
            this.scrollDom.destroy(type);

            // XXX
            // console.log(this.events);

            // Remove events
            for(var key in this.events[type]){
                if( this.events[type].hasOwnProperty(key) ){
                    var event = this.events[type][key];
                    if( event.hasOwnProperty('remove') )
                        event.remove();
                    else if( event.hasOwnProperty('destroy') )
                        event.destroy();
                }
            }
        },


        // Event handling //////////////////////////////////////////////////////////////////////////////////////////////

        registerEvents: function(type){

            // Mouse wheel scroll
            this.registerWheelScroll(type);

            // Rail click
            this.railClick(type);

            // Handle drag
            this.handleDrag(type);

            // Hover reveal
            // XXX: Not that nice after all
            //this.hoverReveal(type);
        },

        registerWheelScroll: function(type){

            // Mouse wheel
            this.events[type].wheelScroll = on(this.containerNode, (!has("mozilla") ? "mousewheel" : "DOMMouseScroll"), lang.hitch(this, function(e){
                // Prevent default scrolling
                e.preventDefault();

                // Normalize for Mozilla based UA
                var scroll = e[(!has("mozilla") ? "wheelDelta" : "detail")] * (!has("mozilla") ? 1 : -1);

                // TODO: Normalize for mac? -> Values change sign on single scroll action.

                // Do scroll
                this.scroller.scroll({
                    type:      type,
                    direction: scroll/Math.abs(scroll)
                });
            }));
        },

        railClick: function(type){

            // Get constant data
            //var railSize     = this.scrollDom.dimensions.container[ ('vertical' === type)? 'h' : 'w' ];
            var handleSize   = this.scrollDom.scrollbar[type].handleSize;
            var delta        = domStyle.get(this.scrollDom.containerNode, ('vertical' === type)? 'height' : 'width') * 0.8;


            this.events[type].railClick = on(this.scrollDom.scrollbar[type].rail, 'click', lang.hitch(this, function(e){

                // Stop event propagation
                e.stopPropagation();

                // Store click coordinates in relation to rail
                var click = {t: e.layerY, l: e.layerX};

                // Get current content && handle offset
                var contentOffset = domStyle.get(this.scrollDom.contentNode, ('vertical' === type)? 'top' : 'left');
                var handleOffset  = domStyle.get(this.scrollDom.scrollbar[type].handle, ('vertical' === type)? 'top' : 'left');

                // Scroll jump position && direction
                var position;
                var direction;

                // Where was the click in relation to handle?
                if( click.t < handleOffset ){

                    // Set scroll direction
                    direction = this.scrollDirection.back;

                    // Determine position
                    if( 0 < contentOffset + delta * direction )
                        position = 0;
                    else
                        position = contentOffset + delta * direction;

                }else if(click.t > handleOffset + handleSize ){

                    // Set scroll direction
                    direction = this.scrollDirection.forth;

                    // Determine position
                    if( contentOffset + delta * direction < this.scroller.contentMax )
                        position = this.scroller.contentMax;
                    else
                        position = contentOffset + delta * direction;
                }else{
                    return;
                }

                // Do the scroll!
                this.scroller.scroll({
                    type:       type,
                    direction:  direction,
                    position:   position
                })

            }));
        },

        handleDrag: function(type){
            // Move class
            var handleDrag = declare([move.boxConstrainedMoveable], {
                onMoved: lang.hitch(this, function(mover, leftTop){

                    // Set moving status
                    this.scrollDom.setMoving(type);

                    // Calculate position
                    var position = Math.round( leftTop.t /  this.scrollDom.proportion[type] * (-1) );

                    // XXX
                    // TODO: Content jumps up when dragging to bottom
                    //console.log('position = ', position);

                    // Adjust content position
                    this.scroller.contentJump({
                        type:     type,
                        position: position
                    });
                })
            });

            // Drag container box
            var dragBox = {l: 0, t: 0, w: this.scrollDom.railSize, h: this.scrollDom.dimensions.container.h};

            // Move instance
            this.events[type].handleDrag = new handleDrag(
                this.scrollDom.scrollbar[type].handle,
                {box: dragBox, within: true}
            );
        },

        hoverReveal: function(type){

            // Hover reveal
            on(this.scrollDom.containerNode, mouse.enter, lang.hitch(this, function(){
                var duration = 1500;

                // Vertical?
                if( this.scrollDom.haveVertical )
                    this.scrollDom.setActive('vertical', duration);

                // Horizontal
                if( this.scrollDom.haveHorizontal )
                    this.scrollDom.setActive('horizontal', duration);
            }));

            // TODO: is boggus
            // Exit hide
            //on(this.scrollDom.containerNode, mouse.leave, lang.hitch(this, function(){
            //    var duration = 1500;
            //
            //    // Vertical?
            //    if( this.scrollDom.haveVertical )
            //        this.scrollDom.setInactive('vertical');
            //
            //    // Horizontal
            //    if( this.scrollDom.haveHorizontal )
            //        this.scrollDom.setInactive('horizontal');
            //}));

        }
    });
});
