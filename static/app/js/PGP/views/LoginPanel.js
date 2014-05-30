Ext.define('PGP.views.LoginPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pgp-loginpanel',
	title: 'Enter credentials',
    defaultType: 'textfield',
    defaults: {
        anchor: '-10',
        labelWidth: 170,
		padding: 10
    },
	postUrl: '',
    initComponent : function() {
		// initialize UI
        this.items = this.buildItems();
		this.buttons = this.buildButtons();
		
		// must always be called
        this.callParent(arguments);
    },
	buildItems: function(){
        return [
			{
	            xtype: 'textfield',
				itemId: 'username',
				name: 'username',
	            fieldLabel: 'Username'
	        }, 
			{
	            xtype: 'textfield',
				itemId: 'password',
				name: 'password',
	            fieldLabel: 'Password',
				inputType: 'password'
	        }
		];
    },
	buildButtons: function(){
		
		// save a reference to 'this' so you can access
		// component's properties and methods anywhere 
		// within this function
		var me = this;
		return [
			{
	            text: 'Login',
	            handler: function() {
					// create a reference to component with itemId: 'username'
					var username = me.getComponent('username');
					var password = me.getComponent('password');
	
					Ext.Ajax.request({
						method: 'POST',
						url: me.postUrl,
						params: {
							username: username.getValue(),
							password: password.getValue()
						},
						success: function(response, opts) {
							var result = Ext.decode(response.responseText);
							if(result.allowed){
								Ext.MessageBox.show({
									title: 'Success', 
									msg: username.getValue() + ' is allowed',
									icon: Ext.MessageBox.INFORMATION,
									buttons: Ext.MessageBox.OK
								});
							} else {
								Ext.MessageBox.show({
									title: 'Fail', 
									msg: username.getValue() + ' is not allowed',
									icon: Ext.MessageBox.WARNING,
									buttons: Ext.MessageBox.OK
								});
							}
						}
					});
					
					
	            }
	   	 	}
		];
	}
});