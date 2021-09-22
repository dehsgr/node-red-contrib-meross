module.exports = function(RED) {
	function MerossNode(MyNode) {
		RED.nodes.createNode(this, MyNode);
		this.key = MyNode.key;
	}

	RED.nodes.registerType("meross-config", MerossNode, {
		key: { type: "password" }
	});
};