import * as fs from 'fs-extra'
import * as memfs from 'mem-fs'
import * as editor from 'mem-fs-editor'


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