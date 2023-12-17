## Chaincode para el proyecto Tienda

Para usar el bridge, se necesita deployar el smart contract en mumbia MATIC antes del chaincode

si se usa otra red que mumbai MATIC (chainID 80001), se necesita cambiar el URL del provider en el fichero TokenERC20.ts

Tambien se puede cambiar el conversion rate entre el Token y el ether en el fihcero TokenERC20.ts 


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
export SEQUENCE=1 #intializar a 1 y incrementar de 1 cada vez que cambia el chaincode
export VERSION="1.0" #intializar a 1.0 y incrementar cada vez que cambia el chaincode
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

### Ping chaincode  -- para prober chaincode esta corriendo
```bash
export CP_FILE=$PWD/../../tienda.yaml
kubectl hlf chaincode query --config=$CP_FILE \
    --user=user-org2 --peer=org2-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=Ping
```


### Inicializar chaincode  -- para initializar la tienda la primera vez

```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=Init
```


### para probar
### Créer customer
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org2 --peer=org2-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=addCustomer \
     -a 'customerTest2' 
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
     -a 'merchantTest' 
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
     -a 'prod2' \
     -a 'producto test 2' \
     -a '23'
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
     -a '[{"productId": "prod1", "quantity": "3"},{"productId": "prod2", "quantity": "4"}]'
```

### get Invoice
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org2 --peer=org2-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=getInvoice \
     -a '1'
```

### get Invoice Detail
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org2 --peer=org2-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=getInvoiceDetail \
     -a '5'  \
     -a '2'
```

### get Invoice Detail List
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org2 --peer=org2-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=getInvoiceDetailList \
     -a '5'  
```

### get Invoice of one Client
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org2 --peer=org2-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=getMyInvoiceClient
```

### get Invoice of one Merchant
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=getMyInvoiceMerchant
```

### Mint
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=Mint \
     -a '5'
```

### limpiar chaincode
```bash
kubectl hlf chaincode invoke --config=$CP_FILE \
    --user=user-org1 --peer=org1-peer0.tienda \
    --chaincode=tienda-dev --channel=tienda \
    --fcn=limpiarChaincode
```

