const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */


class TreeData {
    constructor(Tree) {
        this.children = Array.from(Tree, (x) => {
            return new TreeItem(x)
        })
        this._onDidChangeTreeData = (new vscode.EventEmitter())
        this.onDidChangeTreeData = this._onDidChangeTreeData.event
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
        this.children.push(new TreeItem(child))
    }

    addTreeItemChild(child) {
        this.children.push(child)
    }
}

class TreeItem {
    constructor(Tree) {
        this.name = Tree.name
        this.children = []
        if (Tree.hasOwnProperty("children")) {
            this.children = Array.from(Tree.children, x => new TreeItem(x))
        }
    }

    addChild(child) {
        this.children.push(new TreeItem(child))
    }

    addTreeItemChild(child) {
        this.children.push(child)
    }


}

var panels = {
    server: new TreeData(
        [
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
    ),
    pages: new TreeData(
        [
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
    ),
    current: new TreeData(
        [
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
    ),
    users: new TreeData(
        [
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
    )
}

function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('livecode.helloWorld', function () {
        panels.server.addChild({"name": "appended thing", "children": []})
        panels.server.refresh()
    }))


    context.subscriptions.push(vscode.commands.registerCommand("livecode.serverRefresh", () => {
        panels.server.refresh()
    }))
    context.subscriptions.push(vscode.window.createTreeView("livecode.server", {treeDataProvider: panels.server}))


    context.subscriptions.push(vscode.commands.registerCommand("livecode.pagesRefresh", () => {
        panels.server.refresh()
    }))
    context.subscriptions.push(vscode.window.createTreeView("livecode.pages", {treeDataProvider: panels.pages}))


    context.subscriptions.push(vscode.commands.registerCommand("livecode.currentRefresh", () => {
        panels.server.refresh()
    }))
    context.subscriptions.push(vscode.window.createTreeView("livecode.current", {treeDataProvider: panels.current}))


    context.subscriptions.push(vscode.commands.registerCommand("livecode.usersRefresh", () => {
        panels.server.refresh()
    }))
    context.subscriptions.push(vscode.window.createTreeView("livecode.users", {treeDataProvider: panels.users}))
}


function deactivate() {}

module.exports = {
    activate,
    deactivate
}
