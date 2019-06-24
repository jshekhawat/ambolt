import { enumFiles } from '../fileUtils'
import {join} from 'path'

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

  const {FAB_VER, TP_VER, ROOT_DIR} = opts

  const certs = orgs.map(async o=> {
    const files = await enumFiles(join(ROOT_DIR, `/channel-artifacts/crypto-config/peerOrganizations/${o}.example.com/ca`)) || []
    return files.find(f => f.indexOf('_sk') !== -1)
  })

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


  ${orgs.map((o, i)=> {
    return `
  peer.${o}.example.com:
    container_name: peer.${o}.example.com
    image: hyperledger/fabric-peer:${FAB_VER}
    environment:
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_PEER_ID=peer0.${o}.example.com
      - CORE_PEER_ADDRESS=peer0.${o}.example.com:7051
      - CORE_PEER_GOSSIP_BOOTSTRAP=peer.${o}.example.com:7051
      - CORE_PEER_LISTENADDRESS=peer.${o}.example.com:7051
      - CORE_PEER_GOSSIP_ENDPOINT=peer.${o}.example.com:7051
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer.${o}.example.com:7051
      - CORE_PEER_CHAINCODELISTENADDRESS=peer.${o}.example.com:7052
      - CORE_VM_DOCKER_ATTACHSTDOUT=true
      - CORE_CHAINCODE_EXECUTETIMEOUT=60
      - CORE_LOGGING_PEER=debug
      - CORE_LOGGING_LEVEL=DEBUG
      - FABRIC_LOGGING_SPEC=DEBUG
      - CORE_LOGGING_GOSSIP=DEBUG
      - CORE_LOGGING_GRPC=DEBUG
      - CORE_CHAINCODE_LOGGING_LEVEL=DEBUG
      - CORE_PEER_LOCALMSPID=${o}MSP
      - CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@${o}.example.com/msp
      - CORE_PEER_GOSSIP_SKIPHANDSHAKE=true
      - CORE_PEER_GOSSIP_ORGLEADER=false
      - CORE_PEER_GOSSIP_USELEADERELECTION=true
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb.${o}.example.com:5984
      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=net_example_com
    
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: peer node start --peer-chaincodedev=true
    ports:
      - 7${i}51:7051
      - 7${i}52:7052
      - 7${i}53:7053

    volumes:
      - /var/run/:/host/var/run/
      - ../channel-artifacts/crypto-config/peerOrganizations/${o}.example.com/peers/peer.${o}.example.com/msp:/etc/hyperledger/msp/peer
      - ../channel-artifacts/crypto-config/peerOrganizations/${o}.example.com/users:/etc/hyperledger/msp/users
      - ../channel-artifacts/config:/etc/hyperledger/configtx
    
    depends_on:
      - orderer.example.com
      - couchdb.peer.${o}example.com

    networks:
      - example_com

  
  ca.${o}.example.com:
    container_name: ca.${o}.example.com
    image: hyperledger/fabric-ca:${FAB_VER}
    environment:
        - FABRIC_CA_HOME=/etc/hyperledger/fabric-ca-server
        - FABRIC_CA_SERVER_CA_NAME=ca.${o}.example.com
        - FABRIC_CA_SERVER_CA_CERTFILE=/etc/hyperledger/fabric-ca-server-config/ca.${o}.example.com-cert.pem
        - FABRIC_CA_SERVER_CA_KEYFILE=/etc/hyperledger/fabric-ca-server-config/${certs[i]}
    ports:
        - "7${i}54:7054"
    
    command: fabric-ca-server start -b admin:adminpw -d
    volumes:
        - ../channel-artifacts/crypto-config/peerOrganizations/${o}.example.com/ca/:/etc/hyperledger/fabric-ca-server-config
        
    networks:
        - example_com

  
  couchdb.${o}.example.com:
    container_name: couchdb.peer.${o}.example.com
    image: hyperledger/fabric-couchdb:${TP_VER}
    ports:
      - 5${i}84:5984
    networks:
      - example_com
    `
  }).join('')}
  
  
`



}