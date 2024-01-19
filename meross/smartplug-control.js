const request = require('request');

module.exports = function(RED) {
	'use strict';

	function SmartPlugNode(myNode) {
		RED.nodes.createNode(this, myNode);
		var Crypto = require('crypto');
		var Platform = this;

		this.config = RED.nodes.getNode(myNode.confignode);
		this.ip = myNode.ip;
		if(msg !== undefined && msg.ip !== undefined) {
			this.ip = msg.ip;
		}
		
		this.on('input', function (msg) {
			request.post({
				url: 'http://' + Platform.ip + '/config',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': undefined,
				}, 
				body: {
					'header': {
						'messageId': undefined,
						'method': (typeof msg.payload === 'boolean') ?
								  'SET' :
								  'GET',
						'from': 'http://' + Platform.ip + '/config',
						'sign': undefined,
						'namespace': (typeof msg.payload === 'boolean') ?
									 'Appliance.Control.ToggleX' :
									 (msg.payload.namespace !== undefined) ?
									 msg.payload.namespace :
									 'Appliance.System.All',
						'timestamp': undefined,
						'triggerSrc': "NodeRedPluginLocal",
						'payloadVersion': 1
					},
					'payload': (typeof msg.payload === 'boolean') ?
					{
						'togglex': {
							'onoff': msg.payload ? 1 : 0,
							'channel': msg.channel || 0
						}
					} : 
					{}
				},
				init: function() {
					this.body.header.timestamp = Math.floor(Date.now()/1000);
					this.body.header.messageId = Crypto.createHash('md5').update(
						this.body.header.timestamp.toString()
					).digest('hex');
					this.body.header.sign = Crypto.createHash('md5').update(
						this.body.header.messageId + 
						Platform.config.key +
						this.body.header.timestamp
					).digest('hex');

					this.body = JSON.stringify(this.body);
					this.headers["Content-Length"] = this.body.length;

					delete this.init;

					return this;
			}}.init(), function(myError, myResponse, myBody) {
				if(myError) {
					Platform.warn('There was an Error: ' + myError);
				} else {
					var j = JSON.parse(myResponse.body);
					try {
						switch (j.header.namespace) {
							case 'Appliance.Control.Electricity':
								r = j.payload;
								break;

							default:
								var r = (j.header.method !== undefined && j.header.method === 'SETACK') ?
								msg.payload :
								j.payload.all.digest.togglex[msg.channel || 0].onoff === 1 ? true : false;
						}
					}
					catch (e) {
						var r = 'Received unexpected data!';
					}

					Platform.send(
						{
							origin: msg,
							payload : r
						}
					);
				}
			});
		});
	}

	RED.nodes.registerType('smartplug-control', SmartPlugNode);
};
