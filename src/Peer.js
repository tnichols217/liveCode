const Peer = require("simple-peer")
const wrtc = require("wrtc")
const dmp = require("diff_match_patch")
const diff = new dmp.diff_match_patch()
const uuid = require("uuid")


class peerClient {
    constructor(signal, socket, dir, document, errorCallback) {
        this.socket = socket
        this.dir = dir
        this.document = document
        this.types = {}
        this.string = ""            //to init with document contents eventually
        this.idealString = ""
        this.outGoingID = undefined
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
            this.send("test", "test123")                                //for debug
            this.send("update")                                         //to get a fresh document
        })
        this.peer.on("data", (data) => {
            data = JSON.parse(data.toString())
            if (data.hasOwnProperty("type")) {
                if (this.types.hasOwnProperty(data.type)) {
                    this.types[data.type](data.data)
                }
            }
        })
        this.peer.on("error", () => {
            this.peer.destroy()
            errorCallback()
        })


        this.on("update", (data) => {
            console.log(data)
            this.string = data
            this.outGoingID = undefined
            //add update to document text
        })

        this.on("newPatch", (patch) => {
            console.log(patch)

            var temp = diff.patch_apply(diff.patch_fromText(patch.patch), this.string)[0]
            if (typeof temp == "string") {
                this.string = temp
                this.setText()
                //set text
            } else {
                this.send("update", () => {})
            }
            if (patch.id == this.outGoingID) {
                this.outGoingID = undefined
            }
        })
    }

    send(type, data) {
        this.peer.send(JSON.stringify({type: type, data: data}))
    }

    on(type, callback) {
        this.types[type] = callback
    }

    setText() {
        //set this.text to document.text
    }

    sendDelta(a, b) {
        if (this.outGoingID != undefined) {
            var c = diff.patch_toText(diff.patch_make(a, b, undefined))
            var id = uuid.v4()
            this.outGoingID = id
            this.send("newPatch", {patch: c, id: id})
        }
    }

    disconnect() {
        this.peer.destroy()
    }
}

const UPDATEINTERVAL = 5000

class peerServerInstance {
    constructor(signalCallback, errorCallback) {
        this.peer = new Peer({initiator: true, trickle: false, wrtc: wrtc})
        this.types = {}
        this.peer.on("signal", (thisSignal) => {
            signalCallback(thisSignal)
        })
        this.peer.on("connect", () => {
            console.log("connected to client")
        })
        this.peer.on("data", (data) => {
            data = JSON.parse(data.toString())
            if (data.hasOwnProperty("type")) {
                if (this.types.hasOwnProperty(data.type)) {
                    this.types[data.type](data.data, this)
                }
            }
        })
        this.peer.on("error", () => {
            this.disconnect()
            errorCallback()
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

    disconnect() {
        this.peer.destroy()
    }
}

class peerServer {
    constructor(socket, initText) {
        this.socket = socket
        this.clients = []
        this.types = {}
        this.string = initText
        this.ID = uuid.v4()
        this.IDs = [this.ID]
        this.strings = {}
        this.strings[this.IDs[0]] = initText
        this.newConnected = false
        this.on("newPatch", (patch) => {
            this.applyPatch(patch)
        })
        this.on("update", (_, peer) => {
            this.sendUpdate(peer)
        })
        this.on("updatePatch", () => {
            this.sendUpdatePatch()
        })
        this.on("test", (data) => {
            console.log(data)
        })
        this.updateClock()      //init the constant update
    }

    updateClock() {
        this.sendUpdatePatch()
        setTimeout(this.updateClock, UPDATEINTERVAL)
    }

    generateSignal() {
        if (!this.newConnected) {
            this.destroy(this.clients[0])
        }
        var newClient = new peerServerInstance((thisSignal) => {
            this.socket.emit("generatedSignal", thisSignal)
            console.log("sending signal")
        }, () => {
            this.destroy(newClient)
        })
        for (const [type, callback] of Object.entries(this.types)) {
            newClient.on(type, callback)
        }
        this.clients.unshift(newClient)
    }

    connectClient(otherSignal) {
        if (!this.newConnected) {
            console.log(this.clients)
            this.clients[0].signal(otherSignal)
        }
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

    sendUpdatePatch() {
        var oldID = this.ID
        this.ID = uuid.v4()
        this.IDs.push(this.ID)
        this.strings[this.ID] = this.string
        var newPatch = diff.patch_toText(diff.patch_make(this.strings[oldID], this.string, undefined))
        this.send("updatePatch", {patch: newPatch, prevID: oldID, ID: this.ID})
    }

    sendUpdate(client) {
        this.sendUpdatePatch()
        client.send("update", {string: this.string, ID: this.ID})
    }

    destroy(client) {
        client.disconnect()
        this.clients.splice(this.clients.indexOf(client), 1)
    }

    disconnect() {
        this.clients.forEach((item) => {item.disconnect()})
    }
}

module.exports = {
    peerClient,
    peerServer
}
