import {join, resolve} from 'path'
import os from 'os'
import R from 'ramda'
import {getConfigTx, getCryptoConfig, getDockerComposer} from './config/hf-config'
import {createFile, TX_CONFIG, CRYPTO_CONFIG, DOCKER_COMPOSE, exec} from './fileUtils'
import {getBootstrap, generateMaterials, dockerUp} from './config/scriptUtils'
import {logger} from './logUtil'


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

        logger.info(`Initialising the ambolt base dir: ${path}`)

        const configPath = path ? resolve(os.homedir(), path) : join(os.homedir(), path)

        logger.info('Generating the Network Participants')

        const [or, chs, usrs] = generateNetworkParticipants([{name: 'Org', size: orgs}
                                        , {name: 'Channel', size: channels}
                                        , {name: 'User', size: users} 
                                        ])
        
        logger.info(`Creating Crypto Config File @ ${path}/${CRYPTO_CONFIG}`)

        await createFile(join(path, CRYPTO_CONFIG), getCryptoConfig(or, users))
        
        logger.info(`Creating the configuration transaction file @ ${path}/${TX_CONFIG}`)
        
        await createFile(join(this.defaultPath, TX_CONFIG), getConfigTx(or))
                
        logger.info(`Downloading binaries and fabric images`)

        await exec(getBootstrap({FAB_VER:"1.4.1", TP_VER:"0.4.14", DOWN_BIN:true}), path)
        
        logger.info(`Generating the crypto materials`)

        await exec(generateMaterials(path, chs, or))

        logger.info(`creating the docker compose file`)

        const dockercontent = await getDockerComposer(or,
            {FAB_VER: "1.4.1", TP_VER:"0.4.14", ROOT_DIR: this.defaultPath})

        await createFile(join(this.defaultPath, DOCKER_COMPOSE), dockercontent)

        logger.info(`bringing up the docker network`)

        await exec(dockerUp(join(this.defaultPath, 'docker-compose.yaml')))
        
    }

    async remove() {

    }
}