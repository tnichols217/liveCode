const fs = require('fs').promises

const searchDir = async (dir, query) => {
    return await fs.readdir(dir).then((contents) => {
        return contents.includes(query)
    })
}

const getGitDir = async (file) => {
    var dir = file
    var found = false
    while (found == false && dir != "/")
    {
        dir = dir.substr(0, dir.lastIndexOf('/'))
        found = await searchDir(dir, ".git")
    }
    if (!found) {
        return undefined
    }
    var conf = await fs.readFile(dir+"/.git/config").then((d) => {
        var L = d.toString().split("\n")
        var I = L.indexOf("[remote \"origin\"]") + 1
        if (I <= 0) {
            throw "Cannot find origin remote"
        }
        var P = L[I].split(" ")
        return P[P.length - 1]
    })
    return conf + file.replace(dir, "")
}

module.exports = {
    searchDir,
    getGitDir
}