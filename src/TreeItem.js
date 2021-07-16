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
    }
}

module.exports = {
    TreeItem
} 