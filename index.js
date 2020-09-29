#!/usr/bin/env node

import program from 'commander'
import {Network} from './network'

program.command('create')
    .description('creates a new local network')
    .option('-c, --channels', 'number of channels in the network')
    .option('-o, --organizations', 'number of organizations in the network')
    .option('-u, --users', 'number of users in the network')
    .action(async c=> {
        const network = new Network()
        await network.create()
    })

program.command('remove')
    .description('removes a running local network')    
    .action(async c => {
        const network = new Network()
        await network.remove()
    })

program.command('install <lang> <name> <version>')
    .description('install a nodejs or golang chaincode')
    .option('-d, --debug', 'run in debug mode')
    .action(async c => {
        await console.log('installed the chaincode successfully')
    })

program.command('join <peer-address> <path>')
    .description('join a running network')
    .action(async c=> {
        await console.log('joined to the network succesfully')
    })

program.parse(process.argv)
