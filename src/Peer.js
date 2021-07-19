const Peer = require("simple-peer")
const wrtc = require("wrtc")
const dmp = require("diff_match_patch")
const diff = new dmp.diff_match_patch()

const UPDATEINTERVAL = 5000

class peerClient {
    constructor(signal, socket, dir, document) {
        this.socket = socket
        this.dir = dir
        this.document = document
        this.peer = new Peer({initiator: false, trickle: false, wrtc: wrtc})
        this.peer.signal(signal)
        this.peer.on("signal", (thisSignal) => {
            this.socket.emit("joinDocument", {dir: this.dir, clientSignal: thisSignal})
            console.log("joining doc", dir, thisSignal)
        })
    }
}
class peerServerInstance {
    constructor() {
        this.peer = new Peer({initiator: true, trickle: false, wrtc: wrtc})
        this.signal = undefined
        this.types = {}
        this.peer.on("connect", () => {
            this.peer.send
        })
        this.peer.on("data", (data) => {
            if (data.hasOwnProperty("type")) {
                if (this.types.hasOwnProperty(data.type)) {
                    this.types[data.type](data.data)
                }
            }
        })
    }

    send(type, data) {
        this.peer.send({type: type, data: data})
    }

    on(type, callback) {
        this.types[type] = callback
    }
}

class peerServer {
    constructor(socket) {
        this.socket = socket
        this.clients = []
        this.types = {}
        this.string = ""
        this.on("newPatch", (patch) => {
            this.applyPatch(patch)
        })
        this.on("update", () => {
            this.send("update", this.string)
        })
    }

    updateClock() {
        this.send("update", this.string)
        setTimeout(this.updateClock, UPDATEINTERVAL)
    }

    generateSignal() {
        var newClient = new peerServerInstance()
        for (const [type, callback] of Object.entries(this.types)) {
            newClient.on(type, callback)
        }
        newClient.peer.on("signal", (thisSignal) => {
            newClient.signal = thisSignal
            this.socket.emit("generatedSignal", thisSignal)
            console.log("sending signal", thisSignal)
        })
        this.clients.push(newClient)
    }

    connectClient(otherSignal) {
        this.clients[this.clients.length - 1].signal(otherSignal)
    }

    send(type, data) {
        this.clients.forEach((item) => {
            item.send(type, data)
        })
    }

    on(type, callback) {
        this.types[type] = callback
        this.clients.forEach((item) => {
            item.on(type, callback)
        })
    }
    
    applyPatch(patch) {
        var newString =  diff.patch_apply(diff.patch_fromText(patch.patch), this.string)[0];
        if (typeof newString == "string") {
            var newPatch = diff.patch_toText(diff.patch_make(this.string, newString, undefined))
            this.string = newString

            this.send("newPatch", {patch: newPatch, id: patch.id})
        } else {
            this.send("newPatch", {patch: undefined, id: patch.id})
        }
        console.log(this.string, patch.id)
    }
}


module.exports = {
    peerClient,
    peerServer
}