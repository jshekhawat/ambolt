import * as fs from 'fs-extra'
import * as memfs from 'mem-fs'
import * as editor from 'mem-fs-editor'
import * as shell from 'shelljs'


export const CRYPTO_CONFIG = "crypto-config.yaml"
export const TX_CONFIG = "configtx.yaml"
export const DOCKER_COMPOSE = "docker-compose.yaml"

export const write = (path, content, callback) => {
    const ed = editor.create(memfs.create())

    ed.write(path, content)
    ed.commit([], callback)

}

export const remove = path => {
    return fs.remove(path)
}

export const createFile = (path, content) => {
    return new Promise((resolve, reject)=> {
        try {
            write(path, content, resolve)
        } catch (e) {
            reject(e)
        }
    })
}


export const enumFiles = (folderPath) => {
    return new Promise((resolve, reject) => {
        fs.readdir(folderPath, (e,r) => {
            resolve(r)
        })
    })
}

export const getContents = (path) => {
    const edit = editor.create(memfs.create())
    return edit.read(path)
}

export const exec = (contents, wd) => {
    shell.exec([`cd ${wd}`, contents].join('\n'))
}

export const execFile = (path) => {
    exec(getContents(path))
}