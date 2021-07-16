const TreeData = require('./TreeData');
var panels = {
    currentServer: new TreeData.TreeData("currentServer", []),
    pages: new TreeData.TreeData("pages", [
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
    current: new TreeData.TreeData("current", [
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
    users: new TreeData.TreeData("users", [
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

module.exports = {
    panels
}