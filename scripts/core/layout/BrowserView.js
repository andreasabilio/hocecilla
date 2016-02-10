define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/fx",
    "dojo/topic",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/fx",
    "dojo/fx/easing",
    "dijit/_TemplatedMixin",
    "core/AppRegistry",
    "core/layout/SimpleContainer",
    "core/utils/PanesManager",
    "core/layout/CollectionView",
    "core/widgets/simpleCollectionItem",
    // XXX
    "dojo/store/Memory",
    // XXX
    "dojo/text!./templates/BrowserView.html"
], function(declare, lang, fx, topic, domClass, domConstruct, domStyle, FX, easing,_TemplatedMixin, AppRegistry, SimpleContainer, PanesManager, CollectionView, simpleCollectionItem, Memory, template){

    // XXX
    var data = [];
    for( var i = 0; i < 40; i++){
        data.push({
            id: i,
            slug: 'test-' + i
        });
    }
    var store = new Memory({data: data});



    return declare("core.layout.BrowserView", [SimpleContainer, _TemplatedMixin], {
        baseClass:          'BrowserView',
        templateString:     template,
        transitionDuration: 1000,
        transitionActive:   false,

        // Default methods /////////////////////////////////////////////////////////////////////////////////////////////

        buildRendering: function(){
            this.inherited(arguments);

            // Setup panes manager
            this.panes = new PanesManager( this.contentOddNode, this.contentEvenNode );

            // Register event listeners
            this.registerEvents();

            // XXX: DEMO
            this.store = this.store || store;
        },

        postCreate: function(){
            this.inherited(arguments);

            // Wait for parent transition to finish
            this.own( topic.subscribe(this.parent.eventId + '.updateView.finish', lang.hitch(this, 'renderInitial')) );

            // Render the collection
            this.renderCollection();
        },

        startup: function(){
            // Fit into viewport
            this.frameFit();

            // Collection view startup
            this.collectionView.startup();
        },


        // View setup methods //////////////////////////////////////////////////////////////////////////////////////////

        registerEvents: function(){

            // Set event identifier
            this.eventId = this.eventId || this.id;

            // Catch render event
            this.own( topic.subscribe(this.eventId + '.render', lang.hitch(this, 'updateView')) );

            // Catch viewport resize event
            this.own( topic.subscribe(this.parent.slug + ".resize", lang.hitch(this, 'frameFit')) );
        },

        frameFit: function(){
            // Set collection width
            this.collectionWidth = this.collectionWidth || Math.min(500, this.viewport.size.w * 0.4);
            domStyle.set( this.collectionNode, 'width', this.collectionWidth + 'px' );

            // Calculate new view viewport
            this.viewViewport = {
                //touch: this.viewport.touch,
                type:  this.viewport.type,
                size: {
                    w: this.viewport.size.w - this.collectionWidth,
                    h: this.viewport.size.h,
                    t: 0,
                    l: this.collectionWidth
                }
            };

            // Set app container width
            domStyle.set(this.contentNode, {
                width: this.viewViewport.size.w + 'px',
                left:  this.collectionWidth + 'px'
            });

            // Set view panel positions
            domStyle.set(this.panes.leave, {
                left: (-1) * 100 + '%',
                opacity: 1
            });
        },


        // Content view management /////////////////////////////////////////////////////////////////////////////////////

        renderInitial: function(){
            // Render the first item in the collection
            topic.publish(this.eventId + '.render', this.store.query({})[0]);
        },

        renderCollection: function(){

            // Instance collection view
            this.collectionView = new CollectionView({
                id:         this.id + 'Collection',
                store:      this.store,
                itemWidget: simpleCollectionItem,
                eventId:    this.eventId
            });

            // Place in the collection container
            domConstruct.place(this.collectionView.domNode, this.collectionNode);
        },

        updateView: function(item){

            // Build path
            var path = AppRegistry.app.slug + '/views/' + this.id.replace('View', 'Body');

            // Load the requested view
            require([path], lang.hitch(this, 'instanceAndPlaceView', item));
        },

        instanceAndPlaceView: function(item, View){

            // Instance the new view
            this.view = new View({
                id:      item.slug + 'View',
                item:    item,
                parent:  this,    // REVIEW
                viewport:this.viewViewport
            });

            // Place the new view
            this.placeView( this.view );
        },

        placeView: function(viewInstance){

            // Store new view instance
            this.panes.updateNodes( viewInstance );


            // Only one transition at a time
            if( this.transitionActive )
                return;
            else
                this.transitionActive = true;


            // Fade out animation
            fx.fadeOut({
                node: this.panes.enter,
                duration: this.transitionDuration,
                easing: easing.quadOut,
                onEnd: lang.hitch(this, function(){

                    // Switch pane roles
                    this.panes.prepareNext();

                    // Publish completion event
                    topic.publish(this.eventId + '.updateView.finish');

                    // Mark transition as complete
                    this.transitionActive = false;
                })
            }).play();

            // Slide in animation
            FX.slideTo({
                node: this.panes.leave,
                duration: this.transitionDuration,
                easing: easing.quadOut,
                left: 0,
                unit: 'px',
                onBegin: lang.hitch(this, function(){

                    // Add motion transition class
                    domClass.add(this.panes.leave, 'sliding');
                }),
                onEnd: lang.hitch(this, function(){

                    // Remove transition class
                    domClass.remove(this.panes.leave, 'sliding');
                })
            }).play();
        }


    });
});