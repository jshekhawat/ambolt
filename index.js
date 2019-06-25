#!/usr/bin/env node

import program from 'commander'
import {Network} from './network'

program.command('create')
.option('-c, --channels <channels>', 'number of channels in the network')
.option('-o, --organizations <organizations>', 'number of organizations')
.option('-u, --users <users>', 'number of users')
.option()
    .action( async c => {
        const network = new Network()
        await network.create()
    })

program.command('remove')
    .action( async c => {
        await console.log(`network removed succesfully`)
})

program.command('attach')
    .action(async c => {
        await console.log('attach allows to register the chaincode with a running peer')
    })
    

program.command('install')
    .action( async c => {
        await console.log('installing of chaincode would be supported in the future')
    })



program.parse(process.argv)