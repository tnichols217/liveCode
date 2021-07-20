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
        this.types = {}
        this.string = ""            //to init with document contents eventually
        this.peer = new Peer({initiator: false, trickle: false, wrtc: wrtc})
        this.peer.signal(signal)
        this.peer.on("signal", (thisSignal) => {
            this.socket.emit("joinDocument", {
                dir: this.dir,
                clientSignal: thisSignal
            })
            console.log("joining doc", dir)
        })
        this.peer.on("connect", () => {
            console.log("connected to server")
            this.send("test", "test123")
        })
        this.peer.on("data", (data) => {
            data = JSON.parse(data.toString())
            if (data.hasOwnProperty("type")) {
                if (this.types.hasOwnProperty(data.type)) {
                    this.types[data.type](data.data)
                }
            }
        })


        this.on("update", (data) => {
            console.log(data)
            this.string = data
        })

        this.on("newPatch", (patch) => {
            console.log(patch)


            


        })
    }

    send(type, data) {
        this.peer.send(JSON.stringify({type: type, data: data}))
    }

    on(type, callback) {
        this.types[type] = callback
    }
}

class peerServerInstance {
    constructor(signalCallback) {
        this.peer = new Peer({initiator: true, trickle: false, wrtc: wrtc})
        this.signal = undefined
        this.types = {}
        this.peer.on("signal", (thisSignal) => {
            signalCallback(thisSignal)
        })
        this.peer.on("connect", () => {
            console.log("connected to client")
            // this.send("update", "testestest")                       //for debug purposes
        })
        this.peer.on("data", (data) => {
            data = JSON.parse(data.toString())
            if (data.hasOwnProperty("type")) {
                if (this.types.hasOwnProperty(data.type)) {
                    this.types[data.type](data.data)
                }
            }
        })
    }

    signal(signal) {
        this.peer.signal(signal)
    }

    send(type, data) {
        this.peer.send(JSON.stringify({type: type, data: data}))
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
        this.on("test", (data) => {
            console.log(data)
        })
    }

    updateClock() {
        this.send("update", this.string)
        setTimeout(this.updateClock, UPDATEINTERVAL)
    }

    generateSignal() {
        var newClient = new peerServerInstance((thisSignal) => {
            newClient.signal = thisSignal
            this.socket.emit("generatedSignal", thisSignal)
            console.log("sending signal")
        })
        for (const [type, callback] of Object.entries(this.types)) {
            newClient.on(type, callback)
        }
        this.clients.push(newClient)
    }

    connectClient(otherSignal) {
        console.log(this.clients)
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
        var newString = diff.patch_apply(diff.patch_fromText(patch.patch), this.string)[0];
        if (typeof newString == "string") {
            var newPatch = diff.patch_toText(diff.patch_make(this.string, newString, undefined))
            this.string = newString

            this.send("newPatch", {
                patch: newPatch,
                id: patch.id
            })
        } else {
            this.send("newPatch", {
                patch: undefined,
                id: patch.id
            })
        }
        console.log(this.string, patch.id)
    }
}

module.exports = {
    peerClient,
    peerServer
}
