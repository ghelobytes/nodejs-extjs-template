Ext.define('PGP.Helper', {
	singleton: true,
	
	proxy: 'http://localhost:8000/',
	
	proxify: function(url) {
		return this.proxy + (this.proxy.trim().substring(this.proxy.length,this.proxy.length-1) === '/'?'':'/') + url;
	}
});

