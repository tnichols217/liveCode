const io = require('socket.io-client')
const Peer = require("./Peer.js")

class socketClient{
    constructor(addr, dir, editor) {
        this.address = addr
        this.dir = dir
        this.editor = editor
        this.isPeerServer = false
        this.server = undefined
        this.client = undefined
        this.socket = io.io(addr)
        this.socket.on("documentAddress", (otherSignal) => {
            console.log("got doc", otherSignal)
            if (otherSignal == undefined) {
                this.socket.emit("requestStartDocument", this.dir)
                console.log("requesting to start doc", this.dir)
            } else {
                this.client = new Peer.peerClient(otherSignal, this.socket, this.dir)
            }
        })
        this.socket.on("startDocument", (confirm) => {
            console.log("start doc", confirm)
            if (confirm == true) {
                this.isPeerServer = true
                this.server = new Peer.peerServer(this.socket)
            } else {
                this.socket.emit("requestDocument", dir)
                console.log("requesting doc", dir)
            }
        })
        this.socket.on("requestGenerateSignal", () => {
            console.log("got request for signal")
            if (this.isPeerServer) {
                this.server.generateSignal()
            }
        })
        this.socket.on("newClient", (otherSignal) => {
            console.log("got new client")
            if (this.isPeerServer) {
                this.server.connectClient(otherSignal)
            }
        })
    }
    
    delete() {
        this.socket.disconnect()

    }
}

module.exports = {
    socketClient
}