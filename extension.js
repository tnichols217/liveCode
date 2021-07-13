const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */


class TreeData {
    constructor(Tree) {
        this.tree = Tree
        this._onDidChangeTreeData = (new vscode.EventEmitter())
        this.onDidChangeTreeData = this._onDidChangeTreeData.event
    }

    getChildren(a) {
        if (a == undefined) {
            return this.tree
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
}

class TreeItem {
	constructor(Tree) {
		this.name = Tree.name
		this.children = Tree.children
	}
	
}

var tree = {
    server: [
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
    ],
    pages: [
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
    ],
    current: [
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
    ],
    users: [
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
    ]
}


var panels = {
    server: new TreeData(tree.server),
    pages: new TreeData(tree.pages),
    current: new TreeData(tree.current),
    users: new TreeData(tree.users)
}

function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('livecode.helloWorld', function () {
        vscode.window.showInformationMessage('Hello World from livecode!')
        tree.server.push({"name": "appended thing", "children": []})
    }))


    context.subscriptions.push(vscode.commands.registerCommand("livecode.serverRefresh", () => {
        panels.server.refresh()
    }))
    context.subscriptions.push(vscode.window.registerTreeDataProvider("livecode.server", panels.server))


    context.subscriptions.push(vscode.commands.registerCommand("livecode.pagesRefresh", () => {
        panels.server.refresh()
    }))
    context.subscriptions.push(vscode.window.registerTreeDataProvider("livecode.pages", panels.pages))


    context.subscriptions.push(vscode.commands.registerCommand("livecode.currentRefresh", () => {
        panels.server.refresh()
    }))
    context.subscriptions.push(vscode.window.registerTreeDataProvider("livecode.current", panels.current))


    context.subscriptions.push(vscode.commands.registerCommand("livecode.usersRefresh", () => {
        panels.server.refresh()
    }))
    context.subscriptions.push(vscode.window.registerTreeDataProvider("livecode.users", panels.users))

}


function deactivate() {}

module.exports = {
    activate,
    deactivate
}
