Ext.define('PGP.views.TDPlotter', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.pgp-tdplotter',
	requires: [
		'Ext.form.Panel',
		'Ext.grid.plugin.RowEditing'
	],
	layout: 'anchor',
	mapContainer: null,
	initComponent: function(){

		Ext.define('BearingDistanceRecord', {
			extend: 'Ext.data.Model',
			fields: [
				{ name: 'ns', type: 'string' },
				{ name: 'deg', type: 'int', allowNull: true },
				{ name: 'min', type: 'int', allowNull: true },
				{ name: 'ew', type: 'string' },
				{ name: 'distance', type: 'float', allowNull: true }
			]
		});

		this.items = this.buildItems();
		this.buttons = this.buildButtons();
		this.callParent(arguments);
	},
	plotTD: function(){
		var me = this;
		var map = me.mapContainer.map;
		var grid = me.down('grid');
		var store = grid.getStore();
		var form = me.down('form');
		
		var lat = form.getComponent('latitude').getValue();
		var lon = form.getComponent('longitude').getValue();
		
		// make sure points are in decimal degree
		lat = me.toDD(lat);
		lon = me.toDD(lon);
		
		var geometries = [];
		
		
		// tie point
		var currentPoint = new OpenLayers.Geometry.Point(lon,lat).transform('EPSG:4326','EPSG:900913');
		geometries.push(currentPoint);
		
		for(var index in store.data.items){
			var rec = store.data.items[index];

			var heading = rec.get('ns');
			var bearing = rec.get('ew');
			var degree = rec.get('deg');
			var minute = rec.get('min');
			var distance = rec.get('distance');
			
			// corners
			var corner = me.getNextPoint(currentPoint.y, currentPoint.x, heading, bearing, degree, minute, distance);
			currentPoint = new OpenLayers.Geometry.Point(corner.lon, corner.lat);
			geometries.push(currentPoint);
		}
		
		
		var lineString = new OpenLayers.Geometry.LineString(geometries);
		geometries.splice(0,0,lineString);

		var geometry = new OpenLayers.Geometry.Collection(geometries);
		var features = new OpenLayers.Feature.Vector(geometry);
		var vectorLayer = new OpenLayers.Layer.Vector("Technical Description", {
		    styleMap: new OpenLayers.StyleMap({'default':{
				strokeWidth: 1,
				pointRadius: 3,
				fillColor: '#ff6644'
		    }})
		});
		
		vectorLayer.addFeatures([features]);
		map.addLayer(vectorLayer);
		
		map.zoomToExtent(vectorLayer.getDataExtent());
		
			
	},
	toDD: function(coord){
		if(typeof coord === 'string') {
			coord = coord.split(' ');
			coord = parseFloat(coord[0]) + (parseFloat(coord[1])/60) + (parseFloat(coord[2])/3600);
		}
		return coord;
	},
	getNextPoint: function(lat, lon, heading, bearing, degree, minute, distance){

		var me = this;
		
		// make sure this coordinates is in decimal degress
		
		lat = me.toDD(lat);
		lon = me.toDD(lon);
		
		console.log([lon, lat]);

	    var DEG2RAD = 4 * Math.atan(1) / 180;
	    var azimuth = degree + (minute / 60);

	    var hb = heading + bearing;

	    switch (hb.toUpperCase())
	    {
	        case "NE":
	            // do nothing
	            break;
	        case "NW":
	            azimuth = 0 - azimuth;
	            break;
	        case "SE":
	            azimuth = 180 - azimuth;
	            break;
	        case "SW":
	            azimuth = -180 + azimuth;
	            break;
	        default:
	            azimuth = 0;
	            break;
	    }

	    azimuth = azimuth * DEG2RAD;

	    var endX = lon + Math.sin(azimuth) * distance;
	    var endY = lat + Math.cos(azimuth) * distance;

	    return { lon: endX, lat: endY };
		
	},
	getBearingDistanceStore: function(){
		return Ext.create('Ext.data.Store', {
		    model: 'BearingDistanceRecord',
		    data: [
				{ns: 'N', deg: 20, min: 47, ew: 'W', distance: 1241.90},
				{ns: 'S', deg: 69, min: 14, ew: 'W', distance: 5.75},
				{ns: 'S', deg: 59, min: 05, ew: 'W', distance: 10.93},
				{ns: 'S', deg: 54, min: 18, ew: 'W', distance: 8.31},
				{ns: 'S', deg: 52, min: 05, ew: 'W', distance: 5.45},
				{ns: 'S', deg: 48, min: 23, ew: 'W', distance: 5.51},
				{ns: 'S', deg: 46, min: 20, ew: 'W', distance: 0.91},
				{ns: 'N', deg: 17, min: 47, ew: 'W', distance: 29.72},
				{ns: 'S', deg: 72, min: 13, ew: 'W', distance: 2.30},
				{ns: 'N', deg: 17, min: 47, ew: 'W', distance: 4.95},
				{ns: 'N', deg: 72, min: 13, ew: 'E', distance: 2.30},
				{ns: 'N', deg: 17, min: 47, ew: 'W', distance: 16.30},
				{ns: 'S', deg: 72, min: 13, ew: 'W', distance: 2.30},
				{ns: 'N', deg: 17, min: 47, ew: 'W', distance: 4.95},
				{ns: 'N', deg: 72, min: 13, ew: 'E', distance: 2.30},
				{ns: 'N', deg: 17, min: 47, ew: 'W', distance: 9.34},
				{ns: 'N', deg: 72, min: 13, ew: 'E', distance: 105.30},
				{ns: 'S', deg: 17, min: 47, ew: 'E', distance: 55.31}
		    ]
		});	
	},
	buildItems: function(){
		return [

			{
				xtype: 'form',
				defaults: {
					xtype: 'textfield',
					padding: '5 5 5 5',
					anchor: '50%'
				},
				items: [
					{
						fieldLabel: 'Longitude',
						emptyText: '120 59 00.349',
						itemId: 'longitude',
						value: '120 59 00.349'
					},
					{
						fieldLabel: 'Latitude',
						emptyText: '14 35 02.568',
						itemId: 'latitude',
						value: '14 35 02.568'
					}
				]
			},

			{
				xtype: 'grid',
				anchor: '100% -60',
				columns:[
					{ 
						text: 'N/S',  
						dataIndex: 'ns', 
						editor: { 
									xtype: 'combo', 
									store: ['N','S'],
									editable: false
						},
						width: 80								
				    },
			        { text: 'Deg', dataIndex: 'deg', editor: 'textfield', width: 60 },
					{ text: 'Min', dataIndex: 'min', editor: 'textfield', width: 60 },
					{ 
						text: 'E/W',  
						dataIndex: 'ew', 
						editor: { 
									xtype: 'combo', 
									store: ['E','W'],
									editable: false
						},
						width: 80							
				    },
					{ text: 'Distance', dataIndex: 'distance', editor: 'textfield', width: 100},
					{
			            xtype:'actioncolumn',
						flex: 1,
						align: 'center',
			            items: [
							{
				                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAABmJLR0QA/wD/AP+gvaeTAAAgAElEQVR4nO3dd7hmZXnv8e9s6lCGPtQRUJrShjowgIgCFrBFsbfEmuTE1CvmSjsnnphocmJiorGHUcQS1NCV3osgUpQuSFHp0uu088ezX2aX9937LWut+1lrfT/X9buGgVHu/T6bfd/rWW0OkupgHrA5sBmwcY9sAowB6wJrAmsDc4E1gPUG/PetBB4Z/+tHgRXAE8BS4GngN1Py0PivDwAPjueZgb9KSZWZE12A1HLzgAXAtsA249kW2ILU8DclNf01owocwePA/aSh4AHgLuCX47kTuBv4NfBcVIFSmzkASOXbANhxPDuNp/P7DQPrysFK0mBw64TcMv7rL0g7DpJK4AAgFWcBsMt4XgzsPP7rlpFF1dhS4HbgBuBm4CbgxvFfHwusS2oEBwBpcOsAewP7TMgO1HObvq4eJg0GV03IjaRrFST1wQFAmt3WwOLxHAAsJF1gp7zcD1wBXAZcClwJPBlakZQxBwBpstWAPYGDWdX0F4RWpGEtA65l1UBwIfCr0IqkjDgAqO02IjX7g4DDgT1It82pme4j7QxcDFwC/AgvNFRLOQCobeaQtvCPBI4gNf+1QitSpPuAs8ZzJnBvbDlSdRwA1AbzgVeTmv7h47+XploJ/JQ0DJxBOmXwbGhFUokcANREqwMvA14LHA28MLQa1dUzpFMFpwL/Q3pegdQYDgBqijWAw4A3AkfhhXsq1grStQOnAN8n3XIo1ZoDgOpsHvAG4BjgFaTn3ktVuAs4ETiBdIeBzx9Q7TgAqG7WJp3PfyvpSH/Ql9xIRbsd+B7wLeDq4FqkvjkAqA7WBF4PvId0EZ8P4VGu7iZdL3AC6foBKVsOAMrZXsD7gLeQ3o4n1cmPgeOBb5BejyxlxQFAuZkP/PZ4dg6uRSrCCuBc4Euk6wZ88JCy4ACgHMwBDgXeD7wJL+ZTc90FHDueO4NrUcs5ACjSAuD3gXeRXrgjtclVpF2B44Cng2tRCzkAqGpzSA/n+Sjpvv3VYsuRwt0HLAG+DNwWW4okFW8t0gV915IeuWqMmZxlpLsHFiNVwB0AlW0B8GfAe4ENgmuR6uJa4D/x9IBK5ACgsuwC/DHwbryoTxrWncB/kE4PPBZciyT1NIf0Ap6Lid9ONaZJeQL4DLAtkpSR1UlP6bua+B+UxjQ5y0kvJNoPSQo0BrwduJ74H4zGtCnLge8CeyBJFVod+BDwC+J/EBrT9pyFOwKSSmbjNybfnAXsiyQV7GjgGuJ/yBljemc56dbBFyFJIzoG+CnxP9iMMf1nOfDfwA5IPfgcAPWyH/AJ4IjoQiQN7WnSA4U+ia8k1hQOAJpqN+BfgcOjC5FUmKdIDxT6B3ygkMb5IhZ1bA58GvgibhtKTbMGcDDwQeA54MekUwVqMXcAtCbwu8DfAJsE1yKpGj8G/hS4MLoQxXEAaLf3kM7zbxNdiKQQZ5NezX1jdCGqngNAO+0K/Dvw8uhCJIVbCnwe+Gvg8eBaVCGvAWiXecA/AV/B8/ySktWARaRXdj8IXBdbjqriDkB7vBL4ArBdcB2S8nYq6bqgX0YXonKNRReg0m1NenvYD7H5S5rd0cAtwMdwl7jR3AForjmkW34+BWwYXIukeroW+ADprgE1jANAM+0MfBk4JLoQSbW3jPQ0wb8EngyuRQVyAGiWNYC/Av4cmBtci6RmuQ34MHBOdCEqhgNAc+xLurp/z+hCJDXWSuAbwB8DDwXXohF5EWD9rQH8LXAxNn9J5ZoDvBu4inRnkWrMHYB62x34FunBPpJUteNItwx6bUANuQNQX38I/Aibv6Q47ybdIbBXdCEanPd41s8mwDeBPyJt/0tSpE2B3yH1kwvxLYO14SmAenkVsIT06l5Jys05pJeM/Tq6EM3OUwD1sCbwGeB0bP6S8vUK4BrgtdGFaHaeAsjfTsBpwBtxx0ZS/tYF3gZsBZxLetugMmRDydvbSC/w2SC6EEkawlXAO0jvFlBmPAWQp3VIt9d8C5u/pPrah/Q+gd+OLkTTeQogP9sDZwJHRhciSQVYHXg96ZTAmcDy2HLU4SmAvLwSOJ50q58kNc0lwDHAPdGFyFMAuRgDPgn8AJu/pOY6iHRK4LDoQuQpgBxsCPw36UEa7shIarp1gXcCz5F2BBTEASDWbsDZwIHRhUhShcaAw4GdgR/irYIhPOKM8xbgq8B60YVIUqDrgN8CbosupG28BqB6c4D/A3wbm78k7QFcBhwaXUjbeAqgWusA3wE+grsvktSxLunNgg8CVwbX0hoOANXZHDiDdN5LkjTZGHAUsDHpeQG+VbBkDgDVeAlwHrBrdCGSlLlFwO7AqXhxYKnchi7fq0nb/utHFyJJNfIj0hME74supKm8CLBcHwFOxuYvSYNaRLo48MXRhTSVA0A5xoDPAJ8nPQdbkjS47UkPC/LJgSXwGoDizQW+iW+/kqQizCU9OfB+0uuFVRAHgGKtD5wEHB1diCQ1SOcOgaeAS4NraQwHgOJsCpwLLI4uRJIaaA5wBLAZ6cVpGpEDQDG2It3mt3t0IZLUcPsDWwCn47MCRuIAMLoFpCP/XaILkaSW2BfYgXSX1YrgWmrLAWA0OwDnAy8KrkOS2mYP0oHXSTgEDMUHAQ1vV9KrfLeILkSSWuw04M3AM9GF1I0DwHD2AM4C5kcXIkniPOB1wBPRhdSJDwIa3CLStr/NX5LycBjposB50YXUiTsAg1lM+ibbILoQSdI0PwZeBTwUXUgdOAD0bz/SKyo3jC5EktTTJcArgSejC8mdpwD681LSOSabvyTl7SDSwdp60YXkzgFgdgcApwDrRhciSerLYuB/gLWjC8mZA8DMFgFn4IUlklQ3hwPfAdaILiRXPgiot91It/ptFF2IJGkoOwMvID0x0McGT+EA0N0upFv9Ng2uQ5I0moXAdjgETOMAMN0LSBf8bRldiCSpEAtJB3SnRxeSEweAyTYhPd53h+hCJEmF2p90J9cZ0YXkwgFglbnAqaS3TEmSmucA0vMBLo0uJAcOAMnqwInAK6ILkSSV6kjgftJTA1vNASD5AvDW6CIkSZU4ErgCuC26kEg+Chj+DPjn6CIkSZV6HDgEuDa6kChtHwDeAXwDPwdJaqNfk64LuDu6kAhtbnyLgXPwUZGS1GY/Aw4GHo0upGptfRTwTqSHQtj8JanddgO+TboYvFXaeBHgZqQH/WwdXYgkKQs7kHrCydGFVKltA8DawGmkp0JJktSxN/AMcEl0IVVp0wAwBhwPvDq6EElSll5BujXwuuhCqtCmawA+BhwTXYQkKVtzgC8Ce0YXUoW23AVwFOncTpsGHknScO4G9gEeiC6kTG0YAHYAriS9BEKSpH6cS3pi4PLoQsrS9GsA1ia9/vGF0YVoZGcB84G1oguRZnElsALYILoQjWT78V/PjyyiTE3fEv8v0jaO6u3rpIs3Xwb8JrYUaUbnkb5PD6Llz5lviL/Ba8dq6Q+Blab2+RqTd6r2Bh7KoC5jpuZcYB1WWQD8PIO6zGh5HHgJqo1DgaXEf+OY0TK1+XfshUOAyStTm3+HQ0AzchMwD2Vva+Be4r9hzGjp1fw7HAJMLunV/DscApqRE2nHhfO1tSZwGfHfKGa0zNb8OxwCTHRma/4dDgHNyJ9PXVjl41+I/wYxo+U7DPZSjsXAYxnUbdqXyxnsSv8XAndmULcZPs8Bh0xdWMU7hvhvDjNaljDcranuBJiq0++R/1TuBNQ/9wGbT11YxdmK9MSm6G8MM3yWMNptqQ4BpqoM2/w7HALqnxOnrapCzAHOJP4bwgyfJRTzTAqHAFN2Rm3+HQ4B9c+Hpq2qKuf9/vXOEop9IJVDgCkrRTX/DoeAeudJYOdpq6rK7El6f3P0N4IZLkso52mUDgGm6BTd/DsWALdm8PWZ4XIV6e4zVWwucD3x3wBmuCyh3EdR7wU8mMHXaeqfspp/xzY4BNQ5/zB9SVW2fyV+4c1wWUI176FwCDCjpuzm3+EQUN8sBw6bvqQqy2tIb9uKXngzeJZQ7UuoHALMsKmq+Xc4BNQ3dwMbT19SFW1z0n2Y0QtuBs8SYt5A6RBgBk3Vzb/DIaC++W6X9VTBvkP8QpvB820Ge8Jf0Q4EHu1SlzFTcxmDPeGvaNsDdxD/OZjB85bpy6mivJP4BTaDZwkxR/5TuRNgZkvUkf9U7gTUM4+QXkings3HH951zBLyaP4dC/H7yHRPLs2/wyGgnvFUQAmOJ35hzWBZQl7Nv8MhwExNbs2/wyGgnvmtboup4byO+AU1g2UJeTb/DocA00muzb/DIaB+uQfYqNtiajDr4ys065Yl5N38OxwCTO7Nv8MhoH75cteV1EA+S/xCmv6zhHo0/w6HgPamLs2/YwvgBuI/N9NfVgCHd11J9eVg0lOWohfS9JdjqVfz73AIaF/q1vw7HALqlVtIj63XgNYGbiJ+AU1/+QLp1cx15RDQntS1+Xc4BNQrn+q+jJrJ/yV+4Ux/qXvz73AIaH7q3vw7HALqk6XAPt2XUd3sRfrQohfOzJ6mNP8Oh4DmpinNv8MhoD65Flij+zJqojnARcQvmJk93wRW676MtbaI9ESv6M/XFJfLgHk0z7bA7cR/vmb2fLTHGmqC9xG/UGb2fJ5mHflP5U5Ac9K0I/+ptgCuJ/5zNjPnMWCrHmsoYEN8018d0vTm3+EQUP80vfl3bI5DQB3ytV4LKPg08QtkZk5bmn+HQ0B905bm3+EQkH9WAIf0WsA22x0v/Ms9bWv+HQ4B9Uvbmn+HQ0D++QnNvHZqJKcTvzCmd46n3d+0XhhYn1xKMy/469cL8MLA3PO+XovXRkcRvyCmd9p65D+VOwH5p61H/lO5E5B37qPdQ+rz1gBuJH5BTPfY/CdzCMg3Nv/JHALyzid6L117/C7xC2G6x+bfnUNAfrH5d+cQkG+eJj3HobU2AO4nfiHM9Nj8Z7YQeID4dTI2/9k4BOSb42ZYt8b7OPELYKan7Rf89Wt/vDAwOm2/4K9fLwBuI369zOQsJz36vnUWkLZAohfATI5H/oPZE3cConIOHvkPwp2APHPBTIvWVF8k/oM3k/Of2PyH4RBQfWz+w3EIyDNHzLRoTbMLsIz4D92sis1/NA4B1cXmPxqHgPzyY1r08/fbxH/gZlVs/sVwCCg/Nv9iOATklzfNuGINsTfpecjRH7ZJsfkXyyGgvNj8i7U58DPi19Wk3AysPuOKNcBJxH/QJuUbeLV/GfYDHiZ+fZsUr/YvxwLg58Svr0l518zLVW/7E/8BmxSP/MvlTkBx8ci/XO4E5JOf0+BdgJOJ/4CNzb8qDgGjx+ZfDYeAfPKeWdaqlvYl/oM1Nv+qOQQMH5t/tebjEJBDbqWBuwDfJ/6DbXts/jEcAgaPzT+GQ0AeeedsC1Une+KV/9Gx+cdyCOg/Nv9YDgHxuQEYm22h6uIbxH+gbc5xeLV/Drw7YPZ4tX8etiFtRUd/P7Q5r5t1lWpgR3zqX2Q+h0f+OXEnoHc88s+LOwGxuWT2Jcqfz/yPi80/Tw4B02Pzz5NDQGwWz75E+doKeIb4D7GNsfnnbQ8cAjqx+edtPvBT4r9P2pjv9bE+2foU8R9gG2PzrweHAJt/XTgExGQ56TR67czDC54i8nW84K9O9gV+Q/z3TUQuwQv+6mRr4Bbiv2/als/0szi5+RPiP7i2xSP/emrjToBH/vXkTkD1eRLYtJ/FycVqwB3Ef3Btis2/3to0BNj8680hoPr8TV8rk4k3EP+BtSk2/2ZowxBg828Gh4Bqcx8wt6+VycB5xH9gbYnNv1maPATY/JvFIaDafLC/ZYm1J/EfVFti82+mJg4BNv9mcgioLjdRg8cDf4H4D6oN+Rpe7d9k+9CcuwO82r/ZtgJuJv77rA05ss81CbER8BTxH1LT45F/O7wYuIf477dR4pF/O7gTUE1O7ndBInyU+A+o6bH5t0udhwCbf7vMB64j/vuuyVkObNvvglRpDukVhtEfUJNj82+nOg4BNv922gyHgLLz8b5Xo0KHEv/BNDk2/3ar0xBg8283h4Bycw+wRt+rUZFvEf/BNDWfxeavegwBNn+BQ0DZeVP/S1G+jYGnif9Qmpgl1ODWD1Vmb/K9O+ASYP3yvnTVzFakW9eivy+bmFMHWIfS/RHxH0gT45G/utmF/HYCPPJXN+4ElJPlwAsGWIdSeftH8bH5ayY5DQE2f83EIaCcZPF+gH2J/yCaFpu/+pHDEGDzVz8cAorP7WRwevhzxH8QTYrNX4OIHAJs/hqEQ0DxOWygFSjYWsBDXYoyw+VYMpjoVDt7U/1/h17wp2FsCdxI/M/apuTYwT7+Yh3ToygzeDzy1yiq3AnwyF+jcCeguDwJrDfYx1+c7/dRoJk9Nn8VoYohwOavIjgEFJd3DPjZF2Ie3vtfRO4F1h3ws5d62YvyTge47a8ivZz4n79NyImDfvBFeP+QxZrpuQh/sKo4uwC/ptjvUY/8VaQmve46Os8Bmw728Y/u7AIKN6tyMQ4BKk6RQ4DNX0XaF5t/0fnIQCswos2BZSV8EW3PmcDcAdZBmkkRpwMcTFWkl5BOe0b/rG1azh1kEUb1ByV9EcYfuCrWKDsBHvmrSB75l5flpHcvVOK8Cr6gNschQEUaZgiw+atINv/y83t9r8YI5uP2fxVxCFCRBhkCbP4qks2/mpzT74KM4oNBX1wb4xCgIvUzBNj8VSSbf3VZRnq+Qql+kMEX2qY4BKhIMw0BNn8VyeZffd7f18oMaR7wTAZfZNtyNv5gVnEWAg8y+XvMQVNF2hWv9o/IKf0szrDensEX2Nb4A1pFmrgT4ICpIu0LPEz8z8w25hlK7BPHZfAFtjn+oFaRFgIn4WCp4njkH5/Xz7pKQ1gdz+fkEHcCJOXII/888tXZFmoYh2bwhZkUX8oiKSc2/3xyHzA283Ilff2hca8d4M+qXIuBH+IQICnevsBZwIbRhQhIz+rZr58/OMgA8JrhalFJFpNeA+k1AZKi7Aqchs0/N68u8v9se+K3NUz3eDpAUgS3/fPNlTOs2/P63QE4vM8/p+p5OkBS1dz2z9vewKaz/aF+B4AjRqtFJXMIkFQVm3/+xoDD+vlD/fyZl49cjsrmECCpbDb/+pj1wL2fAWBvYJPRa1EFOkPAvOhCJDWOzb9ejpztD/QzALj9Xy+LSS9scgiQVJT9sPnXzbbADjP9gX4GgEOLqUUV8hZBSUXZDTgVm38dzdi/ZxsA1gAOLq4WVegw0sTuToCkYe0HXER6uIzqZ8YLAWcbAPYB1i2uFlXMawIkDWs/4Ew88q+zkXYA3P6vvwNxCJA0GJt/M2wDvLDXP5xtAHhpsbUoiEOApH7Z/Jul54H8TAPAanj+v0kcAiTNxubfPD0P5GcaAHbDZtE0BwIn43UdkqbbDV/s00SLe/2DmQaAA0soRPEOxbsDJE3Wudp/s+hCVLgd6fFegJkGgEXl1KIMeDpAUofb/s02hx793AGgvRwCJNn822GgAWBDYJfyalEmHAKk9rL5t8dAA8C+pG0DNZ9DgNQ+Nv92WUSXft9rANiv3FqUmQOBU/DuAKkNdser/dtmA7q8GKjXALBPubUoQy8FLgA2ii5EUmn2Ay7Eq/3baFpf7zUA7FVyIcrTPqRbBB0CpOZx27/dpvX1bgPARsD25deiTDkESM1j81dfA8CeeAFg2zkESM1h8xf0OQDsXUEhyp9DgFR/Nn91bAIsmPg3eu0ASJCGgJOA9aILkTQwr/bXVJP6e7cBYPeKClE9HAKcD2wcXIek/u2PV/truj0m/mbqADCGTwDUdJ3TAQ4BUv72B87AI39N9+KJv5k6AGwPzK2uFtXI3jgESLmz+Wsmu078zdQBYFek3hwCpHzZ/DWbXZjQ96cOAC+pthbVkEOAlB+bv/oxlwnP+Zk6ALwYaXYOAVI+bP4axPMH+lMHgJ0rLkT1tTfpFsH1owuRWmwPvNVPg9mp8xdTB4AdKy5E9XYw3iIoRenc6rdpdCGqlef7/MQBYGP8Qa7BeTpAqt7+pCf8bRBdiGrn+dcCj3X7m9KAHAKk6tj8NQoHABXOIUAqn81fo1oArA0OACqWQ4BUHpu/ijDG+K2AEweA7bv/WWkgewMn490BUpH2JF3tb/NXEV4IkweAbYMKUfMcBFyAOwFSEfYn/ffk1f4qygtg8gCwoMcflIaxF3A2DgHSKNz2VxkWwKoBYA6wTVwtaiiHAGl4Nn+VZdIAsCnjVwVKBXMIkAZn81eZJp0C8OhfZXIIkPpn81fZJu0AOACobHsBpwDzoguRMubV/qrCVsDY2ITfSGVbTHp3wCbBdUg5WoRX+6saawEbdwaAzSMrUavsRXpYkEOAtMoi0it9PfJXVTZ3AFAEhwBpFZu/IjgAKIxDgGTzV5z5DgCK1Lk7wCFAbWTzV6TndwDmh5ahNluIQ4Dax+avaPMnPghIirIQOBVvEVQ7LMRb/RRvszHSswA2jK5ErXcA6RYodwLUZIvwVljlYaMx0mtbx2b7k1IFPB2gJnPbXznZ0KN/5cYhQE1k81duHACUJYcANYnNXznacAzYKLoKqQuHADWBzV+52mgMvzGVL6+WVp35/aucbTAGrBddhTQDr5pWHfl9q9ytPgasE12FNAtPB6hO3PZXLYwBc6OLkPrgEKA6sPmrNtwBUJ04BChnNn/VijsAqhuHAOXI5q/acQdAddQZAnyHhXJg81ctjQFrRxchDaFzi5UPslKkvYDTsfmrhsaA1aOLkIa0P+lWK3cCFOEA4Dxg4+hCpGGMAatFFyGNYE88HaDqHQD8EI/8VWMOAGoChwBVyeavRnAAUFM4BKgKNn81hgOAmsQhQGWy+atRHADUNHuSrsr27gAVaW98sY8aZiy6AKkE9wFPRRehRnkIeCy6CKlIY8Dy6CKkAp0KvBl4LroQNcqdwMuAO2LLkIrjAKAm6TT/Z6MLUSM5BKhRHADUFDZ/VcEhQI0xBiyLLkIakc1fVXIIUCO4A6C6s/krwp3AYTgEqMYcAFRn5wNvw+avGHcArwHuDa5DGsoY3i6lejoVeBXwZHQharUbgQNxJ0A1NAY8HV2ENKDTcNtf+bgDOAL4ZXAd0kAcAFQ3pwFvwuavvPycdE2AQ4Bqw1MAqhObv3LmEKBacQdAdWHzVx04BKg23AFQHdj8VSedIeBX0YVIMxnDq6iVtwuAt2LzV738nHRh4H3RhUg9LBsDHo6uQurhNOCVOKSqnm4EDsGdAOXp4THgkegqpC7c9lcT3IqnA5SnRxwAlCObv5rEIUA5cgBQdmz+aiKHAOXmkTHgcXwfgPJg81eTOQQoJ4+MASuBR6MrUet5tb/a4FbgSLw7QPEeGRv/iwdCy1DbebW/2uQGvDtA8e7vDABOo4ritr/ayNMBinafA4Ai2fzVZg4BiuQOgMLY/CWHAMVxB0AhzgaOweYvgUOAYjw/ANwfWoba5GzgdfgWSmkihwBV7flTAPeElqG2uBB4IzZ/qZtbSXfDeECmsj3L+LsAAO6KrEStcDbwKuCJ6EKkjF0PHIw7ASrX3cCKsQm/kcritr/UP08HqGx3A3QGgN/gQ1hUDpu/NLjOEPDr6ELUSHfBqgEA3AVQ8Wz+0vAcAlSWSTsAz/8NqSA2f2l0t+AQoOI5AKg0F+HV/lJRbiHdHeA7W1SUaacAbgsqRM1yNumHlVf7S8X5GenuAHcCVITbYPIA8POgQtQcbvtL5fF0gIqwFPgFOACoODZ/qXwOARrVXcAycABQMWz+UnUcAjSK50/3TxwAHsOLTDQ4m79UPYcADev5g/2xKf/ACwE1CK/2l+LcQnq8tgduGsTtnb+YOgDcVHEhqi+v9pfi/RTvDtBgbuz8xdQB4IaKC1E9ue0v5cPTARrE833eAUCDsvlL+XEIUD+eAO7s/GbqAHB9tbWoZmz+Ur5uAV6OQ4B6uwlY2fnN1AHgTjynq+5s/lL+bsYhQL1NOsifOgCsxAsBNZ3NX6oPhwD1cuPE30wdAMDrADTZxXirn1Q3NwOvBh6MLkRZmXEHAOCqigpR/s4GjsTTQlIdXYe3CGqyn0z8TbcB4OqKClHe3PaX6s/TAeq4jynfB90GgGuBFZWUo1ydg81fagqHAAFcM/VvdBsAHsNHAreZzV9qns4QcE90IQozbXe/2wDQ9Q+qFTrN/6noQiQV7mbSw4IcAtqp7wFg2laBGq9ztb/NX2ou7w5or75OAQBcVnIhyss5pBf7PB5diKTSXUu6O8CdgPZ4ELh16t/sNQBcCSwrtRzlwm1/qX08HdAuP2LCI4A7eg0AT+J7AdrA5i+1l0NAe/yo29/sNQAAXF5SIcqDzV+SQ0A7dO3nMw0AXScGNYLNX1KHQ0CzrWCIHYAryqlFwS7Bq/0lTXYz8BrgoehCVLibSM/3mWamAeAG4P5SylGUc0jP9vdqf0lTXQMchDsBTXNhr38w0wCwknS0qGZw21/SbHxiYPNc1OsfzDQAzPg/VK3Y/CX16yYcAprkgl7/YLYBoOfWgWrD5i9pUA4BzXA78Kte/3C2AeAa4JFCy1GVbP6ShuUQUH8zHsTPNgAsx9sB68qr/SWN6ibgKLw7oK4unukfzjYAAJxdUCGqzrl4tb+kYlyN7w6oqxn7dz8DwJkFFaJqnAu8Fo/8JRXH0wH1czNw50x/oJ8B4Ke46HVh85dUls4QcG90IerLWbP9gX4GgJWki8mUN5u/pLLdRHpssENA/goZAPr6P1Iom7+kqjgE5G8pcN5sf6jfAeBMurxLWFmw+UuqmkNA3i6nj4vA+x0A7iVdC6C8XAq8AZu/pOp1bhH8TXQhmqavi/f7HQAATh6yEJXjXOAIvNVPUpyfkF4g5E5AXgrv1weQTgOY+JwDrDPzcklSZXYh3S0W/bPRwB0zL9Uqg+wAXAHcN8CfVzk85y8pN14TkI/T+/2DgwwAK4AzBq9FBfKcv6M5bocAABQbSURBVIq0EDgJWD+6EDVC55qAh6MLabkflPV//GbitzfaGrf9VaRFpBd9rQSuAjaOLUcN8mI8HRCVJ4G5sy/RcOYBz2TwRbYtl4x/9lIRFgIPMvl77GLcCVBx9iHdHRD9s7NtOaWfxRnFSRl8kW2KR/4q0sQj/6lxJ0BFcieg+ry7r5UZwXsz+CLbEpu/ijRT8+/EIUBF2gN4gPifpW3Is8CG/S3L8DYc/xdFf7FNj81fReqn+XfiEKAiOQRUk9Iu/pvqjIq+oLbG5q8iDdL8O3EIUJEcAsrPB/pejRF9uKIvqI2x+atIwzT/ThwCVCSHgPKyFNi0/6UYzebAspK/oDbmUrzaX8XpdrX/oLkI7w5Qcbw7oJycO8giFOH0ggo3KR75q0ijHPlPjTsBKpI7AcXndwZagQK8u6DCjc1fxSqy+XfiEKAiOQQUl6cI2DmeBzw9YuEmPTvbbX8VpYht/17xdICKdCTxP3+bkBMH/eCL8u0+CzQz58sM9l4GqZsyjvynxp0AFWEL4Ebif/Y2IW8e8LMvzOv7LNDMHocAjaKK5t+JQ4BGYfMvLo8Aaw/28RdnLeChWQo0/effgDkDrYBU7rZ/r1wErFfFF6dG2Zg0QEb/rG1Kjh3s4y/ep4n/EJqUr+BOgPpX5ZH/1LgToEF45F98Fg+0AiXYjfgPoWlxCFA/Ipt/Jw4B6seW2PyLzg0DrUCJriD+w2haHAI0kxyafycOAZqJzb+c/Pkgi1Cm3yX+w2hiHALUTU7NvxOHAHVj8y8nz5GeyJuFjfGZAGXlM3hhoFaJuOCv31yIFwZqlU2AnxD/fdnEnDrAOlRiCfEfSlPjToAgzyP/qXEnQOCRf9k5uv+lqMYBxH8oTY5DQLvVofl34hDQbjb/cvMLMu0F3t9ZbhwC2qlOzb+Tq4CNyvgwlDWbf/n5675Xo2IfJv7DaXocAtqljs2/kx/jENAmNv/y8xzpeQpZWg94lPgPqelxCGiHOjf/ThwC2mFL4Cbiv9+anhP6XZAoXyD+Q2pD/h3vDmiynK/2HzTeHdBsmwBXE/991oa8ss81CbMTsJz4D6oN+SruBDRRE478p8adgGbyyL+6XNvnmoT7IfEfVlviENAsTWz+nTgENIvNv9p8sL9lifdq4j+sNsUhoBma3Pw7cQhoBpt/tXkAmNvXymRgDl4NWnUcAuqtDc2/E4eAerP5V59P9LUyGfl94j+0tsUhoJ7a1Pw7cQiop62w+Ved58Y/91qZBzxM/IfXtvwH3h1QJ0262n/QXIB3B9TJpsA1xH/ftC3f7mdxcvR3xH94bYw7AfXQxiP/qXEnoB488o/JCmD3PtYnS5sAjxP/IbYxDgF5s/mvikNA3mz+ccnurX+D+gzxH2Jb4xCQJ5v/9DgE5MnmH5tDZl+ivG0DPEv8B9nWOATkxebfOw4BebH5x+bi2ZeoHr5B/IfZ5nwWLwzMQZsv+Os3FwDrDvsBqzCbkZ48F/390Oa8cdZVqokdgaXEf6BtjjsBsTzy7z+Xku4iUgyP/ONzJQ07aHMXID4OATFs/oPHISDGVsDNxK9/2/OG2RaqbtwFyCMOAdWy+Q8fh4Bq2fzzSOOO/juOJ/7DNQ4BVbH5jx6HgGrY/PNJ447+O3YElhH/ARuHgLLZ/IuLQ0C5bP75pLFH/x3fIf5DNimfo+HfbEG82r/4nI93B5RhM+A64tfXpLx55uWqvx1ILzeI/qBNyn/hTkCRPPIvL+4EFMsj/7xy2czL1RxfJP7DNqviEFAMm3/5cQgohs0/vxwx44o1yFbAU8R/4GZVHAJGY/OvLg4Bo7H555dzZ1yxBvoX4j90MzkOAcOx+Vcfh4Dh2Pzzywpg/5kWrYk2BR4l/sM3k+MQMBibf1wcAgazNTb/HBP2xr/Vov7FpFMA6wCHBtag6fYC5gOnRxdSAwuBM/AFNlEWAIuBE0gPGVNv84GzgBdHF6JJVgBvB+6NLiTCXOAu4icwMz3uBMzMI/984k7AzLYGbiF+ncz0fGmGdWuF9xG/CKZ7HAK6s/nnF4eA7mz++eZR0s5Mq42R3gMevRimexwCJrP55xuHgMls/nnnr3svXbu8jPjFML1zLA4BYPOvQxwCEpt/3rmTdApc404nflFM73yedj822Mf71ifn0e7HBm8O/Iz4dTC9875ei9dWLwSeJn5hTO8cSzt3Ajzyr1/auhPgkX/+uYB2H0z19PfEL46ZOcfSriHA5l/ftG0IsPnnn2WkW63VxVzgDuIXycycY2nHEGDzr3/aMgTY/OuRz/daQCVvIX6RzOw5lmYPATb/5qTpQ4DNvx55ANi4xxpq3BzgIuIXy8yeL9DMc1le8Ne8nEd68mjTbA5cT/zna2bPR3usoabYEd8WWJccS7N2Ajzyb26athPgkX99chEZ/pyMfBfATH4DLAcOjy5Es1oIbAucQvpGr7NFpGf7bxBdiEqxgPTuke8CzwbXMqptSLsaO0YXolk9A7yGtKuoPq2OTwisU44lwwl3AB75tyeXUO+dgG2AW4n/HE1/+dvuy6jZ7Ak8R/wCmv7yLfLdVZqJzb99qesQYPOvV34KrNl1JdWXTxG/iKb/1G0IsPm3N3UbAmz+9coyYP+uK6m+zcULXeqWugwBNn9TlyFgO+AXxH9epv/8W7eF1OAOBVYQv6Cm/+Q+BNj8TSe5DwHbYfOvW26jmbedhvkS8YtqBkuuQ4DN30zNJcD65Gc7bP51ywrg5V3WUiOYB9xN/OKawfIt0h0dubD5m17JbQjYDpt/HfO1LmupAhxN/OKawZPLEGDzN7MllyFgO3wvSh1zLz7ut1TfIX6RzeD5IrGPDfbxvqbfnEvs+dstgRu71GXyz1u6rKcKtAFui9U1UTsBHvmbQRO1E7AdHvnXNV+atpoqxUGkeyyjF9wMnqqHAJu/GTZVDwHbYfOva24C1p26oLnL8QrtftwNrAG8NLoQDWw3YCfgJNLVsmXy2f4aRefdASeQnkhapu2A80nv1VC9PAccBdwZXUibrA5cRvzkZ4bLtyl3J8Ajf1NUyt4J2A6P/Oucv5y6oKrGi4DHiP8GMMOlrCHA5m+KTllDwPbY/Oucc6n3S9Bq7/3EfxOY4VP0EGDzN2Wl6CHA5l/vPER6P4OCeWtgvVPUEGDzN2WnqCHA5l//vHnqoirGRsBdxH9DmOEz6hBg8zdVZdQhwOZf/xw3dVEV63BgOfHfGGb4DDsE2PxN1Rl2CLD51z+/oCF3FtX1NsBubictyoHRhWhouwFbAaeR/kPrx0LSrX4blVWU1MUC0uD5XWBpn/+brYCzSRcvq56WAm8kvaJemRkDfkD8hGhGS787AR75m+j0uxPgkX8z8hGUtY1J72KO/kYxo2W2IcDmb3LJbEPA9qSHxETXaUbLV6curPK0J/Ak8d8wZrT0GgJs/ia3XEz3IcDm34xcCayNauNdxH/TmNEzdQiw+ZtcM3UIsPk3Iw8AL6CBmnQR4FTXAVsA+0YXopHsBuwCnAjsh8/2V75eQHo/yQnA1qRn+zeycbTIcuANwDXRhZQh8v3sVVibNJXvE12IRvY94GXAJsF1SLM5j/SEuB2jC9HIPg787+giytL0AQBgS+Cq8V8lSerH94BjSKcBGqkNAwCkI8ezqPY99JKkeroBOAB4PLqQMjX5GoCJ7gCWAa8IrkOSlLengNeQHi/faG0ZACBdCzCfdCGZJElTLSM96e/i6EKq0KYBANIV5HsBO0cXIknKzoeB/44uoiptuQZgovWBC0nPkJckCeCfgI9FF1GlNg4AkF7KcTnphR6SpHY7Hng3Db7iv5u2DgAAu5Ke4e1DZSSpvS4hvU7+mehCqjYWXUCg64G3ki76kCS1zy3A62lh84f2XQQ41W3Ar4HXRRciSarU/cBhpB7QSm0fAACuBtYCDokuRJJUiaeAVwI/iy4kkgNAci7wQtJrhCVJzbWC9LbYs6ILidbmawAmWkm6//P84DokSeX6C9IbG1vPAWCVp4GjSM8IkCQ1z18B/xxdRC7afBtgL/OAc4B9owuRJBXmH4G/jC4iJw4A3W1KOh2wa3AdkqTRfRr40+gicuMA0Nt80ukA3xsgSfX1FeBDtOwpf/1wAJjZAtIQsF1wHZKkwX0HeCewPLqQHDkAzG4H0hCwZXQhkqS+nUZ6te/S6EJy5QDQn92B84BNoguRJM3qfOA1pLu71IMDQP/2B84mvU5YkpSnS0hP+XsyupDc+RyA/l0BvBZ4PLoQSVJXVwFvwObfFweAwVwAHAo8EF2IJGmSs0g/nx+MLqQuHAAGdzXwUuBX0YVIkgA4kbRD65H/ABwAhnMTcDDpdcKSpDgnAG8Bno0upG4cAIZ3B+kVwtcH1yFJbfVfwNvxVr+hOACM5h7gFcC10YVIUsv8G/ABfMjP0BwARncfcBhweXQhktQSHwf+GB/vOxKfA1Cc9YCTgJdHFyJJDfYXwKeii2gCdwCK8wTp/tNzoguRpAZaCXwMm39hVosuoGGeA44nPTJ4/+BaJKkpngLeCnw1upAmcQAo3krgdOAR4Eg8zSJJo7gPeBXurhbOAaA8PyLdIvhaYI3gWiSpjm4kXVfl7dYl8Oi0fAcAJwObRRciSTVyPvBbwMPBdTSWFwGW73LgQODm6EIkqSa+QXqjn82/RA4A1bgNWAxcFF2IJGXu74D3kC6qVom8BqA6TwPfBF4E7B5ciyTlZinwQdIT/lQBB4BqLSe9tWpDYFFwLZKUi8eAtwHfiS6kTbwIMM7rgK8DG0QXIkmBrgCOAe6KLqRtvAYgzsmkXYAboguRpCBfAQ7F5h/CASDWzaTbBL8bXYgkVehp4L2kc/7PBNfSWl4DEO850gDwNOmtgg5lkprsF6Qn+/0wupC28xqAvLwM+DaweXAdklSGM4B3Ag9FFyKPNnNzPrAv6aIYSWqKFaTX+L4am382PAWQn8eA44AtgL2Da5GkUT0MvAU4NroQTeYAkKflwCnA/aTrAnyZkKQ6uop01H95dCGazlMAefs8sCtwcXQhkjSA5aRH+h4A3BJci3pwByB/j5BOCawEDsGhTVLebgeOJr3QZ0VwLZqBdwHUyyLSf1Q7RBciSV0cD/we6VomZc6jyXr5EbAP8KXoQiRpgidID/Z5Fzb/2nAHoL6OAb4IbBRdiKRWu5R0b/8dwXVoQO4A1NcJwELgwuhCJLVS50K/Q7H515IXAdbbo6RzbsuAxcDqseVIaok7gHcAX8UL/WrLUwDNsT3ptsFXRhciqbGeA/4R+CS+xKf2HACa5xjgc8Bm0YVIapTLSW/v+1l0ISqG1wA0zwnAzqQ7BVYG1yKp/h4DPkw6zWjzbxB3AJrtUNIgsFN0IZJq6XvAHwD3RBei4nkRYLPdSbpIZxlwEK63pP78knRP/9+T7vFXA7kD0B4HknYDdosuRFLWjgP+BHgwuhCVy2sA2uMyYE/S07r8D1vSVFcA+wLvwZ8RreAA0C4rgK+TLhL8d7x/V1Jq9u8l7RJeFVyLKuQpgHbbF/hPYL/oQiRVbgXwWdLT/H4TXIsCeFFYu/0a+BrwEGkIWCe2HEkV+THpSX5fBJ4OrkVB3AFQx7rA/wL+Clg/uBZJ5bgV+FPglOhCFM8dAHUsBS4hXSOwHulFQ14jIjXD/aQr+z8I3BhcizLhDoB62Q/4BHBEdCGShvY06TqfT+KV/ZrCAUCzWUQaBF4RXYikvj1NutPn/2HjlzSio4FrSO8XMMbkmeWkB/m8CEkq2OGkB4ZE/6AzxqzKUtIV/dshSSU7HLiS+B98xrQ5Nn5JIcaAtwPXE/+D0Jg2ZTnwXWAPJCnYwaR7i1cQ/8PRmKbmCeAzeMSvAngXgIq2I+mBQh8E5gbXIjXFPaTG/1W8ql8FcQBQWbYF/hD4AD5ZUBrWncB/AF8GHguuRZIGsi7wIeAm4rdPjalDVpBOpx2OT+OU1ABrkt4z7rMEjOmeZcAJwGKkCngKQBH2Ie0KvIP03gGpzW4gnd8/AXg4uBa1iAOAIq1Puo3wI8BewbVIVVoKnAh8CTiHtAMgVcoBQDmYA7wU+G3gzaTrBqQmup30xs0lpAv8pDAOAMrNWsDrSNcLvApYPbYcaWQPAt8kNf6rgmuRnucAoJy9iDQIvBNfbqJ6WQGcT3oxz3dJD/CRsuIAoLrYFXg3aSDYMrgWqZuVwKWkI30v6FP2HABUN2sCryZdPHgU3kWgeLeTjvKPB64LrkXqmwOA6mw14EDgmPG4M6AqdI70TyA9sOf22HKk4TgAqCnWAA4D3kjaGVgQW44aZgXp9denAN8HbowtRxqdA4Ca6oXAa4GjSbcYrhlbjmroXuBk4FTgXODJ2HKkYjkAqA3mk64bOJL0fPX5seUoUyuBnwJnAWcAFwLPhlYklcgBQG0zB1hIGgaOAA4mPXtA7XQfqeGfBZxJOuqXWsEBQG23GrALcBBpd+BlwGaRBak0K4CrgUuAi8d//XVoRVIgBwBpstWAPUk7A4vG40OI6ulZ0tsnfwRcTtrS/1VoRVJGHACk2W0K7E8aBvYH9sbrCHKzAriVdKX+FeO5GngusigpZw4A0nC2Jr3BcC/SNQV7AduHVtQezwI/IzX4a8Z/vQ4ftysNxAFAKs4awE7AS0iPLu78ujPp1IIG8wRwLXA9cMOEXz1vLxXAAUAq3wbAjuPZaTyd328YWFcOVgJ3kbbvO7ll/NdfAEvjSpOazQFAijWP9NTCbYFtxrMtsAWwOen6g82o54OMHgfuBx4Yz13AL8dzJ3A36Wje8/RSAAcAqR7mkQaCzUg7ChtO+HVi1gTWB9YhPd+g8/cmvjRpox7/jmeBp8b/eiXwyIS/9xipUT8GPA08Ov7Pp/764IQ8M9JXLKlU/x+z7p4wDHgiSgAAAABJRU5ErkJggg==', 
				                tooltip: 'Delete',
				                handler: function(grid, rowIndex, colIndex) {
				                    var rec = grid.getStore().getAt(rowIndex);
									grid.getStore().remove(rec);
				                }
				            }
						]
			        }
					
				],
				store: this.getBearingDistanceStore(),
				plugins: [
			        Ext.create('Ext.grid.plugin.RowEditing', {
			            clicksToEdit: 2
			        })
			    ]
			}
		];
	},
	buildButtons: function(){
		return [
		
			{
				text: 'Add',
				handler: function(){
					var me = this.up('pgp-tdplotter');
					var grid = me.down('grid');
					var store = grid.getStore();
					
					var newRec = Ext.create('BearingDistanceRecord',{
						ns: '[new]'
					});
					store.add(newRec);
				}
			},
			{
				xtype: 'tbfill'		// you can use '->' instead
			},
			{
				text: 'Plot',
				handler: function(){
					var me = this.up('pgp-tdplotter');
					me.plotTD();
				}
			}
			
			
		
		
		];
		
	}
});
