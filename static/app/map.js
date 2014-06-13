Ext.Loader.setConfig({
	disableCaching: false,
	enabled: true,
	paths: {
	    GeoExt:'lib/geoext',
		PGP: 'js/PGP'
	} 
});


Ext.application({
    name: 'OL3EXT4',
	requires: ['PGP.views.StartEndPanel', 'PGP.views.TDPlotter', 'PGP.Helper'],
    launch: function () {
		
        var mappanel = Ext.create('Ext.panel.Panel', {
            //title: 'Test Map',
			width: 100,
			height: 100,
			layout: 'fit',
			region: 'center',
			map: null,
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
					        	new OpenLayers.Control.Zoom(),
								new OpenLayers.Control.MousePosition({
									displayProjection: 'EPSG:4326'
								})
							],
							fallThrough: true,
							projection: 'EPSG:900913'
						}
					);

					this.map.addLayers([pgp_basemap_cache]);
					this.map.zoomToMaxExtent();	
					
                },
                // The resize handle is necessary to set the map!
				resize: function () {
                    var size = [document.getElementById(this.id + "-body").offsetWidth, document.getElementById(this.id + "-body").offsetHeight];
                    this.map.updateSize(size);
                }
            },
			getMap: function(){
				console.log('getMap', this.map);
				return this.map;
			}
        });
		
		Ext.create('Ext.container.Viewport', {
		    layout: 'border',
		    items: [
				{
		        	region: 'north',
		        	html: '<h1 class="x-panel-header">Just-Another-Routing/Plotting-App</h1>',
		        	border: false,
		        	margins: '0 0 5 0',
					buttons: [
						{
							text: 'Click me',
							handler: function(){
								var tdplotter = this.up('viewport').down('pgp-tdplotter');
								
								var lat = '14 35 02.56';
								var lon = '120 59 00.349';
								var heading = 'N';
								var bearing = 'W'
								var degree = 20;
								var minute = 47;
								var distance = 1241.90;
								
								console.log(tdplotter.getNextPoint(lat, lon, heading, bearing, degree, minute, distance));
							}
						}
					]
		    	}, 
				{
					xtype: 'pgp-startendpanel',
		        	region: 'west',
		        	title: 'Routes',
		        	width: 250,
					split: true,
					mapContainer: mappanel
				},
				{
					xtype: 'pgp-tdplotter',
		        	region: 'east',
		        	title: 'Technical Description',
		        	width: 500,
					split: true,
					mapContainer: mappanel
				},
				mappanel
			]
		});
		
    }
});

