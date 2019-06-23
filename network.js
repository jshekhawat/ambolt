import {join, resolve} from 'path'
import os from 'os'
import R from 'ramda'
import {CryptoConfig} from './config'


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

const generateConfigtx = () => {

}

const generateCryptoConfig = () => {

}

const generateDockerCompose = () => {

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
        

        //generate the materials
        
                                        


    }
}