const request = require('request');

module.exports = function(RED) {
	'use strict';

	function SmartGarageNode(myNode) {
		RED.nodes.createNode(this, myNode);
		var Platform = this;

		this.config = RED.nodes.getNode(myNode.confignode);
		this.ip = myNode.ip;
		this.channel = parseInt(myNode.channel || 0);

		this.on('input', function (msg) {
			request.post({
				url: 'http://' + Platform.ip + '/config',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': 0,
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
									 'Appliance.GarageDoor.State' :
									 'Appliance.System.All',
						'timestamp': parseInt(Platform.config.timestamp),
						'payloadVersion': 1
					},
					'payload': (typeof msg.payload === 'boolean') ?
					{
						'state': {
							'open': msg.payload ? 1 : 0,
							'channel': Platform.channel,
							'uuid': makeUUID(16)
						}
					} : 
					{}
				}),
				init: function() {
					this.headers["Content-Length"] = this.body.length;
					delete this.init;

					return this;
				}
			}.init(), function(myError, myResponse, myBody) {
				if(myError) {
					Platform.warn('There was an Error: ' + myError);
				} else {
					var j = JSON.parse(myResponse.body);
					try {
						var r = (j.header.method !== undefined && j.header.method === 'SETACK') ?
								msg.payload :
								j.payload.all.digest.garageDoor[Platform.channel].open === 1 ? true : false;
					}
					catch (e) {
						var r = 'Received unexpected data!';
					}
					Platform.send({ payload : r });
				}
			});
		});
	}
	
	function makeUUID(size) {
		let uuid = '';
		const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
		while (uuid.length < size) {
			uuid += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return uuid;
	 }

	RED.nodes.registerType('smartgarage-control', SmartGarageNode);
};
