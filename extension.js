const vscode = require('vscode');
const socket = require("socket.io")
const io = require("socket.io-client")
var client
const diff = require("diff_match_patch");


/**
 * @param {vscode.ExtensionContext} context
 */

class TreeData {
    constructor(Name, Tree, persistent = false, context = undefined) {
        this._onDidChangeTreeData = (new vscode.EventEmitter())
        this.onDidChangeTreeData = this._onDidChangeTreeData.event
        this.persistent = persistent
        this.name = Name
        this.globalStateString = "livecode.treedata." + Name
        this.context = context
        if (persistent) {
            if (context == undefined) {
                console.log("Need context pls")
            }
            this.children = Array.from(context.globalState[this.globalStateString], x => new TreeItem(x, this))
        } else {
            this.children = Array.from(Tree, (x) => {
                return new TreeItem(x)
            })
        }
    }

    getChildren(a) {
        if (a == undefined) {
            return this.children
        }
        return a.children
    }

    getTreeItem(child) {
        if (!child.hasOwnProperty("children") || child.children.length == 0) {
            return new vscode.TreeItem(child.name, vscode.TreeItemCollapsibleState.None)
        }
        return new vscode.TreeItem(child.name, vscode.TreeItemCollapsibleState.Collapsed)
    }

    refresh() {
        this._onDidChangeTreeData.fire(undefined)
    }

    addChild(child) {
        this.children.push(new TreeItem(child, this))
        this.context.globalState[this.globalStateString].push(child)
    }

    removeChild(child) {
        this.children.splice(this.children.indexOf(child), 1)
        this.context.globalState[this.globalStateString].splice(this.context.globalState[this.globalStateString].indexOf(child), 1)
    }
}

class TreeItem {
    constructor(Tree, parent = undefined) {
        this.name = Tree.name
        this.children = []
        this.parent = parent
        if (Tree.hasOwnProperty("children")) {
            this.children = Array.from(Tree.children, x => new TreeItem(x, this))
        }
    }

    addChild(child) {
        this.children.push(new TreeItem(child))
    }

    removeChild(child) {
        this.children.splice(this.children.indexOf(child), 1)
    }

    removeSelf() {
        this.parent.removeChild(this)
        console.log("remove")
    }


}

var panels = {
    currentServer: new TreeData("currentServer", []),
    server: new TreeData("server", []),
    pages: new TreeData("pages", [
        {
            "name": "test1",
            "children": [
                {
                    "name": "test1.1"
                }
            ]
        }, {
            "name": "test2"
        }
    ]),
    current: new TreeData("current", [
        {
            "name": "test1",
            "children": [
                {
                    "name": "test1.1"
                }
            ]
        }, {

            "name": "test2"
        }
    ]),
    users: new TreeData("users", [
        {
            "name": "test1",
            "children": [
                {
                    "name": "test1.1"
                }
            ]
        }, {
            "name": "test2"
        }
    ])
}

function activate(context) {

	//temp tests

    context.subscriptions.push(vscode.commands.registerCommand('livecode.tests.helloWorld', function () {
        panels.server.addChild({"name": "appended thing", "children": []})
        panels.server.refresh()
    }))

	//current server panel

	context.subscriptions.push(vscode.window.createTreeView("livecode.currentServer", {treeDataProvider: panels.currentServer}))

    context.subscriptions.push(vscode.commands.registerCommand("livecode.server.connect", (serv) => {
        client = io.io(serv.address)
        client = io.io("http://localhost:4000")
    }))

	//server panel

    context.subscriptions.push(vscode.window.createTreeView("livecode.server", {treeDataProvider: panels.server}))

    if (context.globalState["livecode.treedata.server"] == undefined) {
        context.globalState["livecode.treedata.server"] = []
    }

    panels.server = new TreeData("server", undefined, true, context)

    context.subscriptions.push(vscode.commands.registerCommand("livecode.server.refresh", () => {
        panels.server.refresh()
    }))

    context.subscriptions.push(vscode.commands.registerCommand("livecode.server.add", () => {
        vscode.window.showInputBox({placeHolder: "My server", title: "Name this server"}).then((name) => {
            vscode.window.showInputBox({placeHolder: "https://example.com:4000", title: "Enter server address"}).then((val) => {
                if (val != undefined) {
                    panels.server.addChild({name: name, address: val})
                }
            }).then(() => {
                panels.server.refresh()
            })
        })
    }))

    context.subscriptions.push(vscode.commands.registerCommand("livecode.server.removeItem", (a) => {
        a.removeSelf()
        panels.server.refresh()
    }))

	//pages panel

    context.subscriptions.push(vscode.window.createTreeView("livecode.pages", {treeDataProvider: panels.pages}))

    context.subscriptions.push(vscode.commands.registerCommand("livecode.pages.refresh", () => {
        panels.server.refresh()
    }))

	//current document panel

    context.subscriptions.push(vscode.window.createTreeView("livecode.current", {treeDataProvider: panels.current}))
    
	context.subscriptions.push(vscode.commands.registerCommand("livecode.current.refresh", () => {
        panels.server.refresh()
    }))

	//current users panel

    context.subscriptions.push(vscode.window.createTreeView("livecode.users", {treeDataProvider: panels.users}))

	context.subscriptions.push(vscode.commands.registerCommand("livecode.users.refresh", () => {
        panels.server.refresh()
    }))
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
