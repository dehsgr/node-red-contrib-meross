const request = require('request');

module.exports = function(RED) {
	'use strict';

	function SmartPlugNode(myNode) {
		RED.nodes.createNode(this, myNode);
		var Platform = this;

		this.config = RED.nodes.getNode(myNode.confignode);
		this.ip = myNode.ip;

		this.on('input', function (msg) {
			request.post({
				url: 'http://' + Platform.ip + '/config',
				headers: {
					'Content-Type': 'application/json'
				}, 
				body: JSON.stringify({
					'header': {
						'messageId': Platform.config.messageid,
						'method': (typeof msg.payload === 'boolean') ?
								  'SET' :
								  'GET',
						'from': 'http://' + Platform.ip + '/config',
						'sign': Platform.config.token,
						'namespace': (typeof msg.payload === 'boolean') ?
									 'Appliance.Control.ToggleX' :
									 (msg.payload.namespace !== undefined) ?
									 msg.payload.namespace :
									 'Appliance.System.All',
						'timestamp': parseInt(Platform.config.timestamp),
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
				})
			}, function(myError, myResponse, myBody) {
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

					Platform.send({ payload : r });
				}
			});	   
		});
	}

	RED.nodes.registerType('smartplug-control', SmartPlugNode);
};
