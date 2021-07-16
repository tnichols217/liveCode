const vscode = require('vscode')
const TreeItem = require('./TreeItem.js').TreeItem

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
            if (context.globalState[this.globalStateString] == undefined) {

                context.globalState[this.globalStateString] = []
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
        if (this.persistent) {
            this.context.globalState[this.globalStateString].push(child)
        }
    }

    removeChild(child) {
        this.children.splice(this.children.indexOf(child), 1)
        if (this.persistent) {
            this.context.globalState[this.globalStateString].splice(this.context.globalState[this.globalStateString].indexOf(child), 1)
        }
    }
}

module.exports = {
    TreeData
}
