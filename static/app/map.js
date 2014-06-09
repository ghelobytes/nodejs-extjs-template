Ext.Loader.setConfig({
disableCaching: false,
enabled: true,
paths: {
    GeoExt:'lib/geoext'
} 
});


Ext.application({
    name: 'OL3EXT4',
    launch: function () {
		
		
		/*
        var map = new OpenLayers.Map({});
        
        var wms = new OpenLayers.Layer.WMS(
            "OpenLayers WMS",
            "http://vmap0.tiles.osgeo.org/wms/vmap0?",
            {layers: 'basic'}
        );
        s
        map.addLayers([wms]);
        
        mappanel = Ext.create('GeoExt.panel.Map', {
            title: 'The GeoExt.panel.Map-class',
            map: map,
            center: '12.3046875,51.48193359375',
            zoom: 6,
            stateful: true,
            stateId: 'mappanel',
//            extent: '12.87,52.35,13.96,52.66',
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: [{
                    text: 'Current center of the map',
                    handler: function(){
                        var c = GeoExt.panel.Map.guess().map.getCenter();
                        Ext.Msg.alert(this.getText(), c.toString());
                    }
                }]
            }]
        });

        Ext.create('Ext.container.Viewport', {
            layout: 'fit',
            items: [
                mappanel
            ]
        });
		*/
		
			
		
        var mappanel = Ext.create('Ext.panel.Panel', {
            title: "Test Map",
            layout: 'fit',
			showHeader: false,
            listeners: {
                afterrender: function () {
					
					var wh = this.ownerCt.getSize();
					Ext.applyIf(this, wh);

					var pgp_basemap_cache = new OpenLayers.Layer.NAMRIA(
						'NAMRIA Basemap',
						'http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer',
						{
							isBaseLayer: true
						}
					);

					var municipal_boundary = new OpenLayers.Layer.WMS( 
						'Admin Boundary',
						'http://geoserver.namria.gov.ph/geoserver/geoportal/wms', 
						{
							layers: 'geoportal:adminbnd_munic',
							transparent: true 
						},
						{
							isBaseLayer: false,
							opacity: 0.5
						}
					);

					this.map = new OpenLayers.Map(
						// render the map to the body of this panel
						this.body.dom.id,
						{ 
							controls: [
					        	new OpenLayers.Control.Navigation(),
					        	new OpenLayers.Control.LayerSwitcher(),
					        	new OpenLayers.Control.Zoom()
							],
							fallThrough: true,
							projection: 'EPSG:900913'
						}
					);
		
					this.map.addLayers([municipal_boundary, pgp_basemap_cache]);
					this.map.zoomToMaxExtent();	
					
					
                },
                // The resize handle is necessary to set the map!
				resize: function () {
                    var size = [document.getElementById(this.id + "-body").offsetWidth, document.getElementById(this.id + "-body").offsetHeight];
                    console.log(size);
                    this.map.updateSize(size);
                }
            }
        });
        Ext.create('Ext.container.Viewport', {
            layout: 'fit',
            items: [
                mappanel
            ]
        });
		
		
    }
});

