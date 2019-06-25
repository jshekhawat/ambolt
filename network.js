import {join, resolve} from 'path'
import os from 'os'
import R from 'ramda'
import {getConfigTx, getCryptoConfig, getDockerComposer} from './config/hf-config'
import {createFile, TX_CONFIG, CRYPTO_CONFIG, DOCKER_COMPOSE} from './fileUtils'

const makeArrayFromName = (name, size) => {
    
    return R.range(1, size+1).map(i=> {
        return `${name}${i}`
    })
    
}

const generateNetworkParticipants = participants => {
    return participants.map(p => {
        return makeArrayFromName(p.name, p.size)
    })
}

export class Network {

    constructor() {
        this.defaultPath = './.hf-network'
    }

    async create(orgs=1, channels=1, path=this.defaultPath, users=1) {

        const configPath = path ? resolve(os.homedir(), path) : join(os.homedir(), path)

        const [or, chs, usrs] = generateNetworkParticipants([{name: 'Org', size: orgs}
                                        , {name: 'Channel', size: channels}
                                        , {name: 'User', size: users} 
                                        ])
        
        
        createFile(join(this.defaultPath, CRYPTO_CONFIG), getCryptoConfig(or, users))
        createFile(join(this.defaultPath, TX_CONFIG), getConfigTx(or))
        createFile(join(this.defaultPath, DOCKER_COMPOSE), getDockerComposer(or, {FAB_VER: "1.4.1", TP_VER:"0.14.0", ROOT_DIR: this.defaultPath}))

        

    }
}