

export class CryptoConfig {


    constructor({orgs, users}) {
        this.orgs = orgs
        this.users = users
    }

    config = `
    
    OrdererOrgs:

        - Name: Orderer
          Domain: example.com

          Specs:
            - Hostname: orderer

    
    PeerOrgs:

    ${this.orgs.map(o=> {
        `- Name: ${o}
           Domain: ${o}.example.com
           EnableNodeOUs: true


        Template:
            Count: 1

        Users:
            Count: ${this.users}
        `
    }).join('')}
    `


}