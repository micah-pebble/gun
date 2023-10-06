var gun = Gun({
   web: config.server.listen(config.port),
   peers: config.peers,
   s3: {
      key:'AKIAV63CB2RVYKHCN63A', // AWS Access Key
      secret: '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', // AWS Secret Token
      bucket: 'pebble-demo'// The bucket you want to save into
   }
});

;(function(){
	var cluster = require('cluster');
	if(cluster.isMaster){
	  return cluster.fork() && cluster.on('exit', function(){ cluster.fork(); require('../lib/crashed'); });
	}

	var fs = require('fs');
	var config = {
		port: process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8765,
		peers: process.env.PEERS && process.env.PEERS.split(',') || []
	};
	var Gun = require('../'); // require('gun')

	if(process.env.HTTPS_KEY){
		config.key = fs.readFileSync(process.env.HTTPS_KEY);
		config.cert = fs.readFileSync(process.env.HTTPS_CERT);
		config.server = require('https').createServer(config, Gun.serve(__dirname));
	} else {
		config.server = require('http').createServer(Gun.serve(__dirname));
	}

	var gun = Gun({web: config.server.listen(config.port), peers: config.peers});

	console.log('Relay peer started on port ' + config.port + ' with /gun');

	module.exports = gun;
}());