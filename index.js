#!/usr/bin/env node

import program from 'commander'
import {Network} from './network'

program.command('create', 'creates a local network')
.option('-c, --channels <channels>', 'number of channels in the network')
.option('-o, --organizations <organizations>', 'number of organizations')
.option('-u, --users <users>', 'number of users')
    .action( async c => {
        const network = new Network()
        await network.create()
    })

program.command('remove', 'removes and cleans a local network')
    .action( async c => {
        await console.log(`network removed succesfully`)
})

program.command('attach', 'registers a local copy of the chaincode to a remote peer for debug')
	.option('-a, --address <address>', 'endpoint to the peer')
    .action(async c => {
        await console.log('attach allows to register the chaincode with a running peer')
    })
    

program.command('install')
    .action( async c => {
        await console.log('installing of chaincode would be supported in the future')
    })

program.parse(process.argv)
