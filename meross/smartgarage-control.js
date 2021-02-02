const request = require('request');

module.exports = function(RED) {
    'use strict';

    function SmartGarageNode(myNode) {
        RED.nodes.createNode(this, myNode);
        var Platform = this;

        this.config = RED.nodes.getNode(myNode.confignode);
        this.ip = myNode.ip;
        this.uuid = myNode.uuid;

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
                                     'Appliance.GarageDoor.State' :
                                     'Appliance.System.All',
                        'timestamp': parseInt(Platform.config.timestamp),
                        'payloadVersion': 1
                    },
                    'payload': (typeof msg.payload === 'boolean') ?
                     {
                        'state': {
                            'open': msg.payload ? 1 : 0,
                            'channel': 0,
                            'uuid': Platform.uuid +'0'
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
                        var r = (j.header.method !== undefined && j.header.method === 'SETACK') ?
                                msg.payload :
                                j.payload.all.digest.togglex[0].onoff === 1 ? true : false;
                    }
                    catch (e) {
                        var r = 'Received unexpected data!';
                    }
                    Platform.send({ payload : r });
                }
            });       
        });
    }

    RED.nodes.registerType('smartgarage-control', SmartGarageNode);
};
