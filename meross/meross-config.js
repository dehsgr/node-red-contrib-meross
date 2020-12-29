module.exports = function(RED) {
    function MerossNode(MyNode) {
        RED.nodes.createNode(this, MyNode);
        this.messageid = MyNode.messageid;
        this.token = MyNode.token;
        this.timestamp = MyNode.timestamp;
    }

    RED.nodes.registerType("meross-config", MerossNode, {
        messageid: { type: "text" },
        token: { type: "text" },
        timestamp: { type: "text" }
    });
};