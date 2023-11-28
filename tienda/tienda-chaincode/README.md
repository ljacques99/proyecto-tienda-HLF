## Chaincode para el proyecto Tienda


## Instalación del chaincode en los peers

Levantar el tunel
```bash
ngrok tcp 9999 --region=eu
```

Instalacion del chaincode:
en la carpeta tienda-chaincode

```bash
export CHAINCODE_ADDRESS=$(curl http://localhost:4040/api/tunnels | jq -r ".tunnels[0].public_url" | sed 's/.*tcp:\/\///')
rm code.tar.gz chaincode.tgz
export CHAINCODE_NAME=tienda-dev
export CHAINCODE_LABEL=tienda
cat << METADATA-EOF > "metadata.json"
{
    "type": "ccaas",
    "label": "${CHAINCODE_LABEL}"
}
METADATA-EOF

cat > "connection.json" <<CONN_EOF
{
  "address": "${CHAINCODE_ADDRESS}",
  "dial_timeout": "10s",
  "tls_required": false
}
CONN_EOF

tar cfz code.tar.gz connection.json
tar cfz chaincode.tgz metadata.json code.tar.gz
export PACKAGE_ID=$(kubectl hlf chaincode calculatepackageid --path=chaincode.tgz --language=golang --label=$CHAINCODE_LABEL)
echo "PACKAGE_ID=$PACKAGE_ID"
export CP_FILE=$PWD/../../tienda.yaml
kubectl hlf chaincode install --path=./chaincode.tgz \
    --config=$CP_FILE --language=golang --label=$CHAINCODE_LABEL --user=admin --peer=org1-peer0.tienda

kubectl hlf chaincode install --path=./chaincode.tgz \
    --config=$CP_FILE --language=golang --label=$CHAINCODE_LABEL --user=admin --peer=org2-peer0.tienda

```


## Aprobar chaincode
```bash
export CHAINCODE_NAME=tienda-dev
export SEQUENCE=2 #intializar a 1 y incrementar de 1 cada vez que cambia el chaincode
export VERSION="1.1" #intializar a 1.0 y incrementar cada vez que cambia el chaincode
kubectl hlf chaincode approveformyorg --config=${CP_FILE} --user=admin --peer=org2-peer0.tienda \
    --package-id=$PACKAGE_ID \
    --version "$VERSION" --sequence "$SEQUENCE" --name="${CHAINCODE_NAME}" \
    --policy="OR('Org1MSP.member', 'Org2MSP.member')" --channel=tienda

kubectl hlf chaincode approveformyorg --config=${CP_FILE} --user=admin --peer=org1-peer0.tienda \
    --package-id=$PACKAGE_ID \
    --version "$VERSION" --sequence "$SEQUENCE" --name="${CHAINCODE_NAME}" \
    --policy="OR('Org1MSP.member', 'Org2MSP.member')" --channel=tienda

```

## Commit chaincode
```bash
kubectl hlf chaincode commit --config=${CP_FILE} --user=user-org1 --mspid=Org1MSP \
    --version "$VERSION" --sequence "$SEQUENCE" --name="${CHAINCODE_NAME}" \
    --policy="OR('Org1MSP.member', 'Org2MSP.member')" --channel=tienda
```


## Empezar chaincode


```bash
npm i   # primera vez
npm run build 

export CORE_CHAINCODE_ADDRESS=0.0.0.0:9999
export CORE_CHAINCODE_ID=$PACKAGE_ID
export CORE_PEER_TLS_ENABLED=false

npm run chaincode:start
```

### Ping chaincode
```bash
export CP_FILE=$PWD/../../tienda.yaml
kubectl hlf chaincode query --config=$CP_FILE \
    --user=userB-org2 --peer=org2-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=Ping
```

### chaincode Test express
```bash
export CP_FILE=$PWD/../../north.yaml
kubectl hlf chaincode query --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.north \
    --chaincode=north-dev --channel=north \
    --fcn=Test
```

### Inicializar chaincode  # modificar

```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=Init
```

### Ejecutar chaincode # modificar
```bash
export CP_FILE=$PWD/../../../nft.yaml
IDENTITY_ORG1=$(kubectl hlf chaincode query --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.default \
    --chaincode=nft-dev --channel=demo \
    --fcn=ClientAccountID)

echo "Mi Identity es: \"$IDENTITY_ORG1\""

kubectl hlf chaincode query --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.default \
    --chaincode=nft-dev --channel=demo \
    --fcn=BalanceOf -a "$IDENTITY_ORG1"
```

### Créer customer
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org2 --peer=org2-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=addCustomer \
     -a 'customerTest' 
```

### consulter customer
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=getCustomer \
     -a 'customerTest' 
```

### get all customers
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=getCustomerList 
```

### Créer merchant
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=addMerchant \
     -a 'merchantTest' 
```

### consulter merchant
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=getMerchant \
     -a 'merchant2Id' 
```

### get all merchants
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=getMerchantList 
```

### add Product
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=addProduct \
     -a 'prod1' \
     -a 'producto test 1' \
     -a '18'
```

### get my Product
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=getMyProductList
```

### add Invoice
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org2 --peer=org2-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=addInvoice \
     -a 'x509::/OU=client/CN=client-org1::/C=ES/L=Alicante/=Alicante/O=Kung Fu Software/OU=Tech/CN=ca' \
     -a 'prod1' \
     -a '2'
```

### get Invoice
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org2 --peer=org2-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=getInvoice \
     -a '1'
```

### limpiar chaincode
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=limpiarChaincode
```


### Créer order
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org2 --peer=org2-peer0.north \
    --chaincode=north-dev --channel=north \
    --fcn=addOrder \
     -a '10835' \
     -a 'ALFKI' \
     -a '1' \
     -a '1998-01-15' \
     -a '1998-02-12' \
     -a '1998-01-21' \
     -a '3' \
     -a '69.53' \
     -a 'Alfred' \
     -a 'Street' \
     -a 'Paris' \
     -a 'ZIP' \
     -a 'France' 
```

### consulter order
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.north \
    --chaincode=north-dev --channel=north \
    --fcn=getOrder \
     -a '10835' 
```

### consulter orderList
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.north \
    --chaincode=north-dev --channel=north \
    --fcn=getOrderList \
     -a 'ALFKI' 
```

### Créer orderDetail
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org2 --peer=org2-peer0.north \
    --chaincode=north-dev --channel=north \
    --fcn=addOrderDetail \
     -a '10835' \
     -a '59' \
     -a '55' \
     -a '15' \
     -a '0' 
```

### consulter orderDetail
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.north \
    --chaincode=north-dev --channel=north \
    --fcn=getOrderDetail \
     -a '10835'  \
     -a '59'
```

### Mintear token

```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.default \
    --chaincode=nft-dev --channel=demo \
    --fcn=Mint \
     -a '2' \
     -a 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png' \
     -a 'Nombre' \
     -a 'Description'

```

### Obtener la URI del token por el ID

```bash
kubectl hlf chaincode query --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.default \
    --chaincode=nft-dev --channel=demo \
    --fcn=GetToken -a '1'

kubectl hlf chaincode query --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.default \
    --chaincode=nft-dev --channel=demo \
    --fcn=Symbol

kubectl hlf chaincode query --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.default \
    --chaincode=nft-dev --channel=demo \
    --fcn=Name


kubectl hlf chaincode query --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.default \
    --chaincode=nft-dev --channel=demo \
    --fcn=TotalSupply

```

## Transferir

```bash
export CP_FILE=$PWD/../../../nft.yaml
IDENTITY_ORG2=$(kubectl hlf chaincode query --config=$CP_FILE \
    --user=user-org2 --peer=org2-peer0.default \
    --chaincode=nft-dev --channel=demo \
    --fcn=ClientAccountID)

echo "Mi Identity Org2 es: \"$IDENTITY_ORG2\""


kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.default \
    --chaincode=nft-dev --channel=demo \
    --fcn=TransferFrom \
     -a $IDENTITY_ORG2 \
     -a $IDENTITY_ORG1 \
     -a "1"


```

### Comprobar nuestro balance token

```bash
kubectl hlf chaincode query --config=$CP_FILE \
    --user=user-org2 --peer=org2-peer0.default \
    --chaincode=nft-dev --channel=demo \
    --fcn=ClientAccountBalance

kubectl hlf chaincode query --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.default \
    --chaincode=nft-dev --channel=demo \
    --fcn=ClientAccountBalance

```

### Quemar un NFT

```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org2 --peer=org2-peer0.default \
    --chaincode=nft-dev --channel=demo \
    --fcn=Burn -a "1"

```
