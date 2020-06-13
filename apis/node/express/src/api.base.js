// TODO: move this into the API? I did - but move it back if we want others to extend it?
// - or were we wanting this as a helper for other sites?

const express = require('express')
// can this move to configs, since I'm doing configs like this also anyway?
// no need, now that we have the # privates!
// var replacer = (key, value) => {
//     // TODO: why not just a starts with _?
//     if (key === '_private') return undefined // filtering out properties named _private
//     //    if (key === '_parent') return undefined // I may do this soon, so (I put it IN _private, duh)
//     return value
// }



export class ApiBase {
    constructor(path) {
        this.path = '/' + path
        this.router = express.Router()
    }

    // get(path, func) {
    //     this.router.get(this.path + path, func)
    // }




    // custom send to set type and replacer more susinctly
    send(res, obj) { // TODO: custom replacer for more things?
        res.type('json').send(JSON.stringify(obj)) //, replacer
    }
}

