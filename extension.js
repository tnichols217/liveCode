const vscode = require('vscode')
// const diff = require("diff_match_patch")
const TreeData = require("./src/TreeData.js")
const panels = require("./src/panels.js")
const git = require("./src/Git.js")
const Socket = require("./src/Socket.js")

var connections = {}


/**
 * @param {vscode.ExtensionContext} context
 */


function activate(context) {

	//temp tests

	context.subscriptions.push(vscode.commands.registerCommand('livecode.tests.helloWorld', function () {
		panels.panels.current.addChild({"name": "appended thing", "children": []})
		panels.panels.current.refresh()
	}))





	//current server panel
	
	context.subscriptions.push(vscode.window.createTreeView("livecode.currentServer", {treeDataProvider: panels.panels.currentServer}))







	/*server panel*/

	//init panel
	panels.panels.server = new TreeData.TreeData("server", [], true, context)

	//panel
	context.subscriptions.push(vscode.window.createTreeView("livecode.server", {treeDataProvider: panels.panels.server}))

	//server refresh command
	context.subscriptions.push(vscode.commands.registerCommand("livecode.server.refresh", () => {
		panels.panels.server.refresh()
	}))

	//add server command
	context.subscriptions.push(vscode.commands.registerCommand("livecode.server.add", () => {
		vscode.window.showInputBox({placeHolder: "My server", title: "Name this server"}).then((name) => {
			vscode.window.showInputBox({placeHolder: "https://example.com:4000", title: "Enter server address"}).then((val) => {
				if (val != undefined) {
					panels.panels.server.addChild({"name": name, "children": [], "address": val})
				}
			}).then(() => {
				panels.panels.server.refresh()
			})
		})
	}))

	//remove server command
	context.subscriptions.push(vscode.commands.registerCommand("livecode.server.removeItem", (a) => {
		a.removeSelf()
		panels.panels.server.refresh()
	}))

	//connect server command
	context.subscriptions.push(vscode.commands.registerCommand("livecode.server.connect", async (serv) => {
		var editor = vscode.window.activeTextEditor
		if (editor) {
			// console.log(editor.document.getText())
			var dir = await git.getGitDir(editor.document.fileName)
			connections[dir] = new Socket.socketClient("http://localhost:4000", dir, editor)
			// connections[dir] = new Socket.socketClient(serv.address, dir, editor)
			connections[dir].socket.emit("requestDocument", dir)
			console.log("requesting doc", dir)
		}
	}))






	/*pages panel*/

	context.subscriptions.push(vscode.window.createTreeView("livecode.pages", {treeDataProvider: panels.panels.pages}))

	context.subscriptions.push(vscode.commands.registerCommand("livecode.pages.refresh", () => {
		panels.panels.server.refresh()
	}))

	/*current document panel*/

	context.subscriptions.push(vscode.window.createTreeView("livecode.current", {treeDataProvider: panels.panels.current}))
	
	context.subscriptions.push(vscode.commands.registerCommand("livecode.current.refresh", () => {
		panels.panels.server.refresh()
	}))

	/*current users panel*/

	context.subscriptions.push(vscode.window.createTreeView("livecode.users", {treeDataProvider: panels.panels.users}))

	context.subscriptions.push(vscode.commands.registerCommand("livecode.users.refresh", () => {
		panels.panels.server.refresh()
	}))
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
