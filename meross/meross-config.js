module.exports = function(RED) {
    function MerossNode(MyNode) {
        RED.nodes.createNode(this, MyNode);
        this.token = MyNode.token;
        this.timestamp = MyNode.timestamp;
    }

    RED.nodes.registerType("meross-config", MerossNode, {
        token: { type: "text" },
        timestamp: { type: "text" }
    });
};