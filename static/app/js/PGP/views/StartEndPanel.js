Ext.define('PGP.views.StartEndPanel', {
	extend: 'Ext.form.Panel',
	alias: 'widget.pgp-startendpanel',
	defaultType: 'textfield',
	mapContainer: null,
	initComponent: function(){
		this.defaults = {
			padding: '5 5 5 5',
			labelWidth: 80,
			width: 230,
			labelSeparator: ''
		}
		this.items = this.buildItems();
		this.buttons = this.buildButtons();
		this.callParent(arguments);
	}, 
	getMyValues: function(){
		var origin = this.getComponent('origin');
		var destination = this.getComponent('destination');
		
		var obj = {
			a: origin,
			b: destination
		}
		return obj;
	},
	buildItems: function(){
		return [
			{
				fieldLabel: 'Origin',
				itemId: 'origin',
				value: 'lawton avenue taguig',
				emptyText: 'street or location'
			},
			{
				fieldLabel: 'Destination',
				itemId: 'destination',
				value: 'market market taguig',
				emptyText: 'street or location'
			},
			{
				itemId: 'description'
			}
		];
	},
	buildButtons: function(){
		var me = this;
		return [
			{
				text: 'Route',
				handler: function(){

					me.plotPoints();
				}
			}
		];
		
	},
	geocode: function(search, callback){

		var restUrl = 'https://maps.googleapis.com/maps/api/geocode/json?region=ph&address=' + search;
		Ext.Ajax.request({
			url: PGP.Helper.proxify(restUrl),
			success: function(response){
				var obj = Ext.decode(response.responseText);
				var location = obj.results[0].geometry.location;
				callback({ lat: location.lat, lon: location.lng});
			},
			failure: function(response){
				var obj = Ext.decode(response.responseText);
				alert('Error!');	
			}
		});
	},
	plotPoints: function(){
		var me = this;
		var map = me.mapContainer.map;
		
		var origin = this.getComponent('origin').getValue();
		var destination = this.getComponent('destination').getValue();
		
		this.requestRoutes(origin, destination, function(result){
			
			var coordinates = result.data.coordinates;
			var points = [];

			for(var index in coordinates){
				var coordinate = coordinates[index];
				points.push(new OpenLayers.Geometry.Point(coordinate[0], coordinate[1]));
			}
			var lineString = new OpenLayers.Geometry.LineString(points).transform('EPSG:4326', 'EPSG:900913');
			var lineFeatures = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Collection([lineString]));
			var linesLayer = new OpenLayers.Layer.Vector("Lines Layer", {
			    styleMap: new OpenLayers.StyleMap({'default':{
					strokeWidth: 5
			    }})
			});
			
			linesLayer.addFeatures([lineFeatures]);
			map.addLayer(linesLayer);
			
			
			var description = me.getComponent('description');
			//description.html = result.data.properties.description;
			
			description.setHtml(result.data.properties.description);
			
			console.log(result.data.properties.description);
			
		});
	},
	requestRoutes: function(origin, destination, callback){
		var me = this;
		
		var flat = 14.566731903574,
			flon = 121.05882473004,
			tlat = 14.54931965,
			tlon = 121.05600330064;
		
		me.geocode(origin,function(result1){

			me.geocode(destination, function(result2){
				
				flat = result1.lat;
				flon = result1.lon;
				tlat = result2.lat;
				tlon = result2.lon
				
				var restUrl = 'http://www.yournavigation.org/api/dev/route.php' + 
							  '?flat=' + flat +  
							  '&flon=' + flon +
							  '&tlat=' + tlat + 
							  '&tlon=' + tlon +  
							  '&v=motorcar&fast=0&layer=mapnik&instructions=1&format=geojson';
				
				console.log(PGP.Helper.proxify(restUrl));	  
				Ext.Ajax.request({
					url: PGP.Helper.proxify(restUrl),
					success: function(response){
						var obj = Ext.decode(response.responseText);
						console.log(obj);
						callback({ success: true, data: obj });
					},
					failure: function(response){
						var obj = Ext.decode(response.responseText);
						callback({ success: false, data: obj });	
					}
				});
				
			});
		});
		
		
		
			
		
		
	}
	
	
});
