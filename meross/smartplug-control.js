const axios = require('axios');

module.exports = function(RED) {
	'use strict';

	function SmartPlugNode(myNode) {
		RED.nodes.createNode(this, myNode);
		var Crypto = require('crypto');
		var Platform = this;

		this.config = RED.nodes.getNode(myNode.confignode);
		this.ip = myNode.ip;
		
		this.on('input', function (msg) {
			if(msg !== undefined && msg.ip !== undefined) {
				Platform.ip = msg.ip;
			}

			axios.request({
				method: 'post',
				url: 'http://' + Platform.ip + '/config',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': undefined,
				}, 
				data: {
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
					this.data.header.timestamp = Math.floor(Date.now()/1000);
					this.data.header.messageId = Crypto.createHash('md5').update(
						this.data.header.timestamp.toString()
					).digest('hex');
					this.data.header.sign = Crypto.createHash('md5').update(
						this.data.header.messageId + 
						Platform.config.key +
						this.data.header.timestamp
					).digest('hex');

					if (this.data.payload !== undefined &&
						this.data.payload.state !== undefined)
					{
						this.data.payload.state.uuid = Crypto.createHash('md5').update(
							this.data.header.from
						).digest('hex');
					}

					this.data = JSON.stringify(this.data);
					this.headers["Content-Length"] = this.data.length;

					delete this.init;

					return this;
				}
			}.init()).then(function(myResponse) {
				var j = myResponse.data;
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
			}).catch(function(myError) {
				Platform.error('There was an Error: ' + myError, msg);
			});
		});
	}

	RED.nodes.registerType('smartplug-control', SmartPlugNode);
};
