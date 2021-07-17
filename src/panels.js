const TreeData = require('./TreeData');
const path = require('path')
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
                    "name": "test1.1",
                    "children": [
                        {
                            "name" : "test1.1.1"
                        }
                    ]
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
                    "name": "test1.1",
                    "icon": path.join(__filename, '..', '..', 'resources', 'icon16x.svg')
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