Ext.Loader.setConfig({ disableCaching:false });

(function() {
    Ext.Loader.setConfig({
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
			// create two instance of the 
			// login panel
			items: [
				{
				   	xtype: 'pgp-loginpanel',
					title: 'Login for members',
					postUrl: '/auth/member'
				},
				{
					xtype: 'pgp-loginpanel',
					title: 'Login for admin',
					postUrl: '/auth/admin'
				}
				
			]
			
		});
		
    });
})();