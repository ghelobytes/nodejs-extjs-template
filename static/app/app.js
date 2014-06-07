
Ext.Loader.setConfig({
	disableCaching: false,
    enabled: true,
    paths: {
        PGP:'js/PGP'
    } 
});

Ext.require('PGP.views.LoginPanel');

Ext.onReady(function() {
   
	Ext.create('Ext.container.Viewport', {
		id: 'viewport',
	    layout: {
			type: 'vbox',
			align: 'center',
			pack: 'center'
	    },
		
		// create an instance of pgp-loginpanel
		items: [
			{
			   	xtype: 'pgp-loginpanel',
				title: 'Login for members',
				postUrl: '/auth/member'
			}
		]
		
	});
	
});
