define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/router",
    "dojo/hash",
    "dojo/topic",
    "core/AppRegistry",
    "dojo/i18n!../nls/labels"
],function(declare, lang, router, hash, topic, AppRegistry, labels){
    
    return declare("core.AppRouter", [], {
        
        constructor: function(){
            // Query menu items
            var menuItems = AppRegistry.menu.query({});

            // Listen for changes in menu items
            this.menuListener(menuItems);

            // Prepare nodes and register routes
            this.registerRoutes(menuItems);

            // Listen for route request
            topic.subscribe(AppRegistry.app.slug + '.request', lang.hitch(this, function(node){
                router.go( node.uri );
            }));
        },

        startup: function(){
            // Startup the app router
            router.startup();

            // Render main view?
            if('' === hash())
                router.go(AppRegistry.menu.query({})[0].uri);

        },

        // Routing methods /////////////////////////////////////////////////////////////////////////////////////////////

        // Listen for changes in menu items
        menuListener: function(menuItems){

            this.menuObserveHandle = menuItems.observe(lang.hitch(this, function(node, removedFrom, insertedInto){

                // Publish route change?
                if( node.active ){
                    topic.publish(AppRegistry.app.slug + '.render', node);
                }


            }), true);
        },

        // Prepare nodes and register routes
        registerRoutes: function(menuItems){

            // Setup menu items and corresponding route callbacks
            menuItems.forEach(lang.hitch(this, function(item){

                // Set item id
                item.id = item.slug;

                // Set l10n item name
                item.name = labels[item.slug + 'Name'];

                // Set item URI
                item.uri = this.buildRoute(item);

                // Make sure all items have a parent property (event at null)
                item.parent = item.parent || null;

                // Set activation flags
                item.active   = false;
                item.ancestor = false;

                // Register the route callback
                router.register(item.uri, lang.hitch(this, 'routeUpdate', item));

                // Save changes to menu store
                AppRegistry.menu.put(item, {overwrite: true});
            }));
        },

        // React to a route change (This is the route callback)
        routeUpdate: function(newNode){

            // Get currently active node
            var oldNode = this.getActiveNode();

            // Make sure we got a node
            if( null !== oldNode ){

                // Update old node
                oldNode.active = false;
                AppRegistry.menu.put(oldNode);

                // Deactivate parent iff newNode is not a sibling
                if( oldNode.parent && null !== oldNode.parent && newNode.slug !== oldNode.parent )
                    this.updateParent( AppRegistry.menu.get(oldNode.parent), false);
            }


            // Activate new node
            newNode.active = true;
            AppRegistry.menu.put(newNode);


            // Mark parent as active ancestor?
            if( null !== newNode.parent )
                this.updateParent( AppRegistry.menu.get(newNode.parent), true);
        },



        // Helper methods //////////////////////////////////////////////////////////////////////////////////////////////

        // Build a node's route
        buildRoute: function(node){
            var route;

            if( null === node.parent )
                route = '/' + node.slug;
            else
                route = this.buildRoute( AppRegistry.menu.get(node.parent) ) + '/' +node.slug;

            return route;
        },

        // Get currently active node
        getActiveNode: function(){
            var active = AppRegistry.menu.query({active: true});
            return active[0] || null;
        },

        // Update parent's flag
        updateParent: function(parent, /* bool */ value){

            // Update parent
            parent.ancestor = value;

            // Save parent
            AppRegistry.menu.put(parent);
        }
    });
});