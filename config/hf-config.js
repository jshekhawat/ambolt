

export const getCryptoConfig = (orgs, users) => {
    return `

OrdererOrgs:

    - Name: Orderer
      Domain: example.com

      Specs:
        - Hostname: orderer

    
PeerOrgs:
    ${orgs.map(o => { return `
    - Name: ${o}
      Domain: ${o}.example.com
      EnableNodeOUs: true


      Template:
        Count: 1

      Users:
        Count: ${users}
        `
    }).join('')}
    `
}

export const getConfigTx = (orgs) => {
  return `
  
Organisations:
  - &OrdererOrg
    Name: OrdererOrg
    ID: OrdererMSP
    MSPDir: ./channel-artifacts/crypto-config/ordererOrganizations/example.com/msp
    
${orgs.map(o => {
  return `
  - &${o}
    Name: ${o}MSP
    ID: ${o}MSPID
    MSPDir: ./channel-artifacts/crypto-config/peerOrganizations/${o}.example.com/msp
    AnchorPeers:
      - Host: peer.${o}.example.com
        Port: 7051
  `
}).join('')}    


Capabilities:
  Channel: &ChannelCapabilities
    V1_3: true
  Orderer: &OrdererCapabilities
    V1_1: true
  Application: &ApplicationCapabilities
    V1_3: true
    V1_2: true
    V1_1: true

Application: &ApplicationDefaults

  Organizations:


  Capabilities:
    <<: *ApplicationCapabilties

Orderer: &OrdererDefaults
  OrdererType: solo

  Addresses:
    -orderer.example.com:7050

  BatchTimeout: 2s

  BatchSize:
    MaxMessageCount: 10
    AbsoluteMaxBytes: 99 MB
    PreferredMaxBytes: 512 KB

  Organizations:

Channel: &ChannelDefaults

  Capabilities:
    <<: *ChannelCapabilities


Profiles:
  
  ExampleGenesis:
    Orderer:
      <<: *OrdererDefaults
      Organizations:
        - *OrdererOrg
      Capabilities:
        <<: *OrdererCapabilities
    Consortiums:
      ExConsortium:
        Organizations:
          ${orgs.map(o=> {
            return `- *${o}`
          }).join('')}

  ExampleChannel:
    Consortium: ExConsortium
    <<: *ChannelDefaults
    Application:
      <<: *ApplicationDefaults
      Capabilities:
          <<: *ApplicationCapabilities
      Organizations:
          ${orgs.map(o=> {
          return `- *${o}`
          }).join('')}
  `
}

export const getDockerComposer = (orgs, opts) => {

  const {FAB_VER, TP_VER} = opts

  return `
  
version: '2'

networks:
  example_com

services:
  orderer.example.com:
    container_name: orderer.example.com
    image: hyperledger/fabric-orderer:${FAB_VER}
    environment:
    - ORDERER_GENERAL_LOGLEVEL=debug
    - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
    - ORDERER_GENERAL_GENESISMETHOD=file
    - ORDERER_GENERAL_GENESISFILE=/etc/hyperledger/configtx/genesis.block
    - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
    - ORDERER_GENERAL_LOCALMSPDIR=/etc/hyperledger/msp/orderer/msp

    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/orderer
    command: orderer
    ports:
        - 7050:7050
    volumes:
      - ./channel-artifacts/config/:/etc/hyperledger/configtx
      - ./channel-artifacts/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/:/etc/hyperledger/msp/orderer
    ${orgs.map(o=> {
      return `  - ./channel-artifacts/crypto-config/peerOrganizations/example.com/${o}.example.com/peers/peer.${o}.example.com/:/etc/hyperledger/msp/peer${o}`
    }).join('')}
    networks:
      - example_com
  
  
`



}