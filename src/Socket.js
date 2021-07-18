const io = require('socket.io-client')
const Peer = require("simple-peer")
const wrtc = require("wrtc")

class socketClient{
    constructor(addr, dir, editor) {
        this.address = addr
        this.dir = dir
        this.editor = editor
        this.isPeerServer = false
        this.connections = []
        this.socket = io.io(addr)
        this.socket.on("documentAddress", (otherSignal) => {
            console.log("got doc", otherSignal)
            if (otherSignal == undefined) {
                this.socket.emit("requestStartDocument", this.dir)
                console.log("requesting to start doc", this.dir)
            } else {
                var newPeer = new Peer({initiator: false, trickle: false, wrtc: wrtc})
                newPeer.signal(otherSignal)
                newPeer.on("signal", (thisSignal) => {
                    this.socket.emit("joinDocument", {dir: dir, clientSignal: thisSignal})
                    console.log("joining doc", dir, thisSignal)
                })
                this.connections.push(newPeer)
                //define peer client here
            }
        })
        this.socket.on("startDocument", (confirm) => {
            console.log("start doc", confirm)
            if (confirm == true) {
                this.isPeerServer = true
            } else {
                this.socket.emit("requestDocument", dir)
                console.log("requesting doc", dir)
            }
        })
        this.socket.on("requestGenerateSignal", () => {
            console.log("got request for signal")
            if (this.isPeerServer) {
                var newPeer = new Peer({initiator: true, trickle:false, wrtc: wrtc})
                this.connections.push(newPeer)
                newPeer.on("signal", (thisSignal) => {
                    this.socket.emit("generatedSignal", thisSignal)
                    console.log("sending signal", thisSignal)
                })
                console.log(this.editor)
                //define peer server here
            }
        })
        this.socket.on("newClient", (otherSignal) => {
            console.log("got client", otherSignal)
            if (this.isPeerServer) {
                this.connections[this.connections.length - 1].signal(otherSignal)
            }
        })
    }
}

module.exports = {
    socketClient
}