import program from 'commander'
import {Network} from './network'

program.command('create')
    .action( async c => {
        const network = new Network()
        await network.create()
    })

program.command('remove')
    .action( async c => {
        await console.log(`${c} ran succesfully`)
})

program.parse(process.argv)