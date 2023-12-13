## Creacion de la red

Este fichero creara la red que necesitamos para completar el proyecto Tienda

La red que queremos crear es la siguiente:

![image](imagenes/Arquitectura%20-%20Red.png)

## Lanzar Kubernetes Cluster

Para empezar a desplegar nuestra red Fabric tenemos que tener un cluster de Kubernetes. Para ello vamos a utilizar KinD.

```bash
kind create cluster --config=kind.yaml
```

## Instalar operador de Kubernetes

En este paso vamos a instalar el operador de kubernetes para Fabric, esto instalara:

- CRD (Custom resource definitions) para desplegar Peers, Orderers y Autoridades de certification Fabric
- Desplegara el programa para desplegar los nodos en Kubernetes

Para instalar helm: [https://helm.sh/es/docs/intro/install/](https://helm.sh/es/docs/intro/install/)

```bash
helm repo add kfs https://kfsoftware.github.io/hlf-helm-charts --force-update

helm install hlf-operator --version=1.8.0 --set image.tag=v1.8.0 kfs/hlf-operator
```

### Instalar plugin de Kubectl

Para instalar el plugin de kubectl, hay que instalar primero Krew:
[https://krew.sigs.k8s.io/docs/user-guide/setup/install/](https://krew.sigs.k8s.io/docs/user-guide/setup/install/)

Despues, se podra instalar el plugin con la siguiente instruccion:

```bash
kubectl krew install hlf
```

### Instalar Istio

Instalar binarios de Istio en la maquina:

```bash
curl -L https://istio.io/downloadIstio | sh -
```

Instalar Istio en el cluster de Kubernetes:

```bash

kubectl create namespace istio-system

istioctl operator init

kubectl apply -f - <<EOF
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  name: istio-gateway
  namespace: istio-system
spec:
  addonComponents:
    grafana:
      enabled: false
    kiali:
      enabled: false
    prometheus:
      enabled: false
    tracing:
      enabled: false
  components:
    ingressGateways:
      - enabled: true
        k8s:
          hpaSpec:
            minReplicas: 1
          resources:
            limits:
              cpu: 500m
              memory: 512Mi
            requests:
              cpu: 100m
              memory: 128Mi
          service:
            ports:
              - name: http
                port: 80
                targetPort: 8080
                nodePort: 30949
              - name: https
                port: 443
                targetPort: 8443
                nodePort: 30950
            type: NodePort
        name: istio-ingressgateway
    pilot:
      enabled: true
      k8s:
        hpaSpec:
          minReplicas: 1
        resources:
          limits:
            cpu: 300m
            memory: 512Mi
          requests:
            cpu: 100m
            memory: 128Mi
  meshConfig:
    accessLogFile: /dev/stdout
    enableTracing: false
    outboundTrafficPolicy:
      mode: ALLOW_ANY
  profile: default

EOF

```

### Configurar DNS interno

```bash
CLUSTER_IP=$(kubectl -n istio-system get svc istio-ingressgateway -o json | jq -r .spec.clusterIP)
kubectl apply -f - <<EOF
kind: ConfigMap
apiVersion: v1
metadata:
  name: coredns
  namespace: kube-system
data:
  Corefile: |
    .:53 {
        errors
        health {
           lameduck 5s
        }
        rewrite name regex (.*)\.localho\.st host.ingress.internal
        hosts {
          ${CLUSTER_IP} host.ingress.internal
          fallthrough
        }
        ready
        kubernetes cluster.local in-addr.arpa ip6.arpa {
           pods insecure
           fallthrough in-addr.arpa ip6.arpa
           ttl 30
        }
        prometheus :9153
        forward . /etc/resolv.conf {
           max_concurrent 1000
        }
        cache 30
        loop
        reload
        loadbalance
    }
EOF

```

## Crear namespace en Kubernetes

```bash
kubectl create ns tienda
```

### Variables de entorno para AMD (predeterminado)

```bash
export PEER_IMAGE=hyperledger/fabric-peer
export PEER_VERSION=2.4.6

export ORDERER_IMAGE=hyperledger/fabric-orderer
export ORDERER_VERSION=2.4.6

export CA_IMAGE=hyperledger/fabric-ca
export CA_VERSION=1.5.6-beta2
```

### Variables de entorno para ARM (Mac M1)

```bash
export PEER_IMAGE=bswamina/fabric-peer
export PEER_VERSION=2.4.6

export ORDERER_IMAGE=bswamina/fabric-orderer
export ORDERER_VERSION=2.4.6

export CA_IMAGE=hyperledger/fabric-ca
export CA_VERSION=1.5.6-beta2

```

## Desplegar Org1MSP

### Desplegar una autoridad de certificacion

```bash

kubectl hlf ca create --image=$CA_IMAGE --version=$CA_VERSION --storage-class=standard --capacity=1Gi --name=org1-ca --namespace=tienda \
    --enroll-id=enroll --enroll-pw=enrollpw --hosts=tienda-org1-ca.localho.st --istio-port=443


kubectl wait --timeout=180s --namespace=tienda --for=condition=Running fabriccas.hlf.kungfusoftware.es --all
```

Comprobar que la autoridad de certificacion esta desplegada y funciona:

```bash
curl -k https://tienda-org1-ca.localho.st:443/cainfo
```

Registrar un usuario en la autoridad certificacion de la organizacion peer (Org1MSP)

```bash
# registrar usuario en la CA para los peers
kubectl hlf ca register --name=org1-ca --namespace=tienda --user=peer --secret=peerpw --type=peer \
 --enroll-id enroll --enroll-secret=enrollpw --mspid Org1MSP

```

### Desplegar un peer

```bash
kubectl hlf peer create --statedb=couchdb --image=$PEER_IMAGE --version=$PEER_VERSION --storage-class=standard --enroll-id=peer --mspid=Org1MSP \
        --enroll-pw=peerpw --capacity=5Gi --name=org1-peer0 --namespace=tienda --ca-name=org1-ca.tienda \
        --hosts=tienda-peer0-org1.localho.st --istio-port=443


kubectl wait --timeout=180s --for=condition=Running --namespace=tienda fabricpeers.hlf.kungfusoftware.es --all
```

Comprobar que el peer esta desplegado y funciona:

```bash
openssl s_client -connect tienda-peer0-org1.localho.st:443
```

## Desplegar Org2MSP

### Desplegar una autoridad de certificacion

```bash

kubectl hlf ca create  --image=$CA_IMAGE --version=$CA_VERSION --storage-class=standard --capacity=1Gi --name=org2-ca --namespace=tienda \
    --enroll-id=enroll --enroll-pw=enrollpw --hosts=tienda-org2-ca.localho.st --istio-port=443


kubectl wait --timeout=180s --namespace=tienda --for=condition=Running fabriccas.hlf.kungfusoftware.es --all
```

Comprobar que la autoridad de certificacion esta desplegada y funciona:

```bash
curl -k https://tienda-org2-ca.localho.st:443/cainfo
```

Registrar un usuario en la autoridad certificacion de la organizacion peer (Org2MSP)

```bash
# registrar usuario en la CA para los peers
kubectl hlf ca register --name=org2-ca --namespace=tienda --user=peer --secret=peerpw --type=peer \
 --enroll-id enroll --enroll-secret=enrollpw --mspid Org2MSP

```

### Desplegar un peer

```bash
kubectl hlf peer create --statedb=couchdb --image=$PEER_IMAGE --version=$PEER_VERSION --storage-class=standard --enroll-id=peer --mspid=Org2MSP \
        --enroll-pw=peerpw --capacity=5Gi --name=org2-peer0 --namespace=tienda --ca-name=org2-ca.tienda \
        --hosts=tienda-peer0-org2.localho.st --istio-port=443


kubectl wait --timeout=180s --for=condition=Running --namespace=tienda fabricpeers.hlf.kungfusoftware.es --all
```

Comprobar que el peer esta desplegado y funciona:

```bash
openssl s_client -connect tienda-peer0-org2.localho.st:443
```

## Desplegar una organizacion `Orderer`

Para desplegar una organizacion `Orderer` tenemos que:

1. Crear una autoridad de certificacion
2. Registrar el usuario `orderer` con password `ordererpw`
3. Crear orderer

### Crear la autoridad de certificacion

```bash

kubectl hlf ca create  --image=$CA_IMAGE --version=$CA_VERSION --storage-class=standard --capacity=1Gi --name=ord-ca --namespace=tienda \
    --enroll-id=enroll --enroll-pw=enrollpw --hosts=tienda-ord-ca.localho.st --istio-port=443

kubectl wait --timeout=180s --for=condition=Running fabriccas.hlf.kungfusoftware.es --namespace=tienda --all

```

Comprobar que la autoridad de certificacion esta desplegada y funciona:

```bash
curl -vik https://tienda-ord-ca.localho.st:443/cainfo
```

### Registrar el usuario `orderer`

```bash
kubectl hlf ca register --name=ord-ca --namespace=tienda --user=orderer --secret=ordererpw \
    --type=orderer --enroll-id enroll --enroll-secret=enrollpw --mspid=OrdererMSP 

```

### Desplegar orderer

```bash
kubectl hlf ordnode create --image=$ORDERER_IMAGE --version=$ORDERER_VERSION \
    --storage-class=standard --enroll-id=orderer --mspid=OrdererMSP \
    --enroll-pw=ordererpw --capacity=2Gi --name=ord-node1 --namespace=tienda --ca-name=ord-ca.tienda \
    --hosts=tienda-orderer0-ord.localho.st --istio-port=443

kubectl wait --timeout=180s --for=condition=Running fabricorderernodes.hlf.kungfusoftware.es --namespace=tienda --all
```

Comprobar que el orderer esta ejecutandose:

```bash
kubectl get pods --namespace=tienda #todos pods tienen que estar "running"
```

```bash
openssl s_client -connect tienda-orderer0-ord.localho.st:443
```

## Preparar cadena de conexion para interactuar con el orderer

Para preparar la cadena de conexion, tenemos que:

- Obtener la cadena de conexion sin usuarios
- Registrar un usuario en la autoridad de certificacion para firma
- Obtener los certificados utilizando el usuario creado anteriormente
- Adjuntar el usuario a la cadena de conexion

1. Obtener la cadena de conexion sin usuarios

```bash
kubectl hlf inspect --output ordservice.yaml -o OrdererMSP --namespace=tienda
```

2. Registrar un usuario en la autoridad de certificacion TLS

```bash
kubectl hlf ca register --name=ord-ca --namespace=tienda --user=admin --secret=adminpw \
    --type=admin --enroll-id enroll --enroll-secret=enrollpw --mspid=OrdererMSP

```

3. Obtener los certificados utilizando el certificado

```bash
kubectl hlf ca enroll --name=ord-ca --namespace=tienda --user=admin --secret=adminpw --mspid OrdererMSP \
        --ca-name ca  --output admin-ordservice.yaml
```

4. Adjuntar el usuario a la cadena de conexion

```bash
kubectl hlf utils adduser --userPath=admin-ordservice.yaml --config=ordservice.yaml --username=admin --mspid=OrdererMSP
```

### Crear el secreto

```bash

kubectl hlf ca register  --name=ord-ca --namespace=tienda --user=admin --secret=adminpw \
    --type=admin --enroll-id enroll --enroll-secret=enrollpw --mspid=OrdererMSP


kubectl hlf ca enroll --name=ord-ca --namespace=tienda \
    --user=admin --secret=adminpw --mspid OrdererMSP \
    --ca-name tlsca  --output orderermsp.yaml


kubectl hlf ca register  --name=org1-ca --namespace=tienda --user=admin --secret=adminpw \
    --type=admin --enroll-id enroll --enroll-secret=enrollpw --mspid=Org1MSP


kubectl hlf ca enroll --name=org1-ca --namespace=tienda \
    --user=admin --secret=adminpw --mspid Org1MSP \
    --ca-name ca  --output org1msp.yaml

kubectl hlf ca register  --name=org2-ca --namespace=tienda --user=admin --secret=adminpw \
    --type=admin --enroll-id enroll --enroll-secret=enrollpw --mspid=Org2MSP

kubectl hlf ca enroll --name=org2-ca --namespace=tienda \
    --user=admin --secret=adminpw --mspid Org2MSP \
    --ca-name ca  --output org2msp.yaml

kubectl create secret generic wallet --namespace=tienda \
        --from-file=org1msp.yaml=$PWD/org1msp.yaml \
        --from-file=org2msp.yaml=$PWD/org2msp.yaml \
        --from-file=orderermsp.yaml=$PWD/orderermsp.yaml
```

Crear el canal

```bash
export PEER_ORG1_SIGN_CERT=$(kubectl get fabriccas org1-ca --namespace=tienda -o=jsonpath='{.status.ca_cert}')
export PEER_ORG1_TLS_CERT=$(kubectl get fabriccas org1-ca --namespace=tienda -o=jsonpath='{.status.tlsca_cert}')

export PEER_ORG2_SIGN_CERT=$(kubectl get fabriccas org2-ca --namespace=tienda -o=jsonpath='{.status.ca_cert}')
export PEER_ORG2_TLS_CERT=$(kubectl get fabriccas org2-ca --namespace=tienda -o=jsonpath='{.status.tlsca_cert}')

export IDENT_8=$(printf "%8s" "")
export ORDERER_TLS_CERT=$(kubectl get fabriccas ord-ca --namespace=tienda -o=jsonpath='{.status.tlsca_cert}' | sed -e "s/^/${IDENT_8}/" )
export ORDERER0_TLS_CERT=$(kubectl get fabricorderernodes ord-node1 --namespace=tienda -o=jsonpath='{.status.tlsCert}' | sed -e "s/^/${IDENT_8}/" )

kubectl apply -f - <<EOF
apiVersion: hlf.kungfusoftware.es/v1alpha1
kind: FabricMainChannel
metadata:
  name: tienda
  namespace: tienda
spec:
  name: tienda
  adminOrdererOrganizations:
    - mspID: OrdererMSP
  adminPeerOrganizations:
    - mspID: Org1MSP
  channelConfig:
    application:
      acls: null
      capabilities:
        - V2_0
      policies: null
    capabilities:
      - V2_0
    orderer:
      batchSize:
        absoluteMaxBytes: 1048576
        maxMessageCount: 10
        preferredMaxBytes: 524288
      batchTimeout: 2s
      capabilities:
        - V2_0
      etcdRaft:
        options:
          electionTick: 10
          heartbeatTick: 1
          maxInflightBlocks: 5
          snapshotIntervalSize: 16777216
          tickInterval: 500ms
      ordererType: etcdraft
      policies: null
      state: STATE_NORMAL
    policies: null
  externalOrdererOrganizations: []
  peerOrganizations:
    - mspID: Org1MSP
      caName: "org1-ca"
      caNamespace: "tienda"
    - mspID: Org2MSP
      caName: "org2-ca"
      caNamespace: "tienda"
  identities:
    OrdererMSP:
      secretKey: orderermsp.yaml
      secretName: wallet
      secretNamespace: tienda
    Org1MSP:
      secretKey: org1msp.yaml
      secretName: wallet
      secretNamespace: tienda
    Org2MSP:
      secretKey: org2msp.yaml
      secretName: wallet
      secretNamespace: tienda
  externalPeerOrganizations: []
  ordererOrganizations:
    - caName: "ord-ca"
      caNamespace: "tienda"
      externalOrderersToJoin:
        - host: ord-node1.tienda
          port: 7053
      mspID: OrdererMSP
      ordererEndpoints:
        - ord-node1.tienda:7050
      orderersToJoin: []
  orderers:
    - host: ord-node1.tienda
      port: 7050
      tlsCert: |-
${ORDERER0_TLS_CERT}

EOF

```

## Unir peers de Org1MSP peer a canal

```bash

export IDENT_8=$(printf "%8s" "")
export ORDERER0_TLS_CERT=$(kubectl get fabricorderernodes ord-node1 --namespace=tienda -o=jsonpath='{.status.tlsCert}' | sed -e "s/^/${IDENT_8}/" )

kubectl apply -f - <<EOF
apiVersion: hlf.kungfusoftware.es/v1alpha1
kind: FabricFollowerChannel
metadata:
  name: tienda-org1msp
spec:
  anchorPeers:
    - host: org1-peer0.tienda
      port: 7051
  hlfIdentity:
    secretKey: org1msp.yaml
    secretName: wallet
    secretNamespace: tienda
  mspId: Org1MSP
  name: tienda
  orderers:
    - certificate: |
${ORDERER0_TLS_CERT}
      url: grpcs://ord-node1.tienda:7050
  peersToJoin:
    - name: org1-peer0
      namespace: tienda
  externalPeersToJoin: []
EOF


```

## Unir peers de Org2MSP peer a canal

```bash

export IDENT_8=$(printf "%8s" "")
export ORDERER0_TLS_CERT=$(kubectl get fabricorderernodes ord-node1 --namespace=tienda -o=jsonpath='{.status.tlsCert}' | sed -e "s/^/${IDENT_8}/" )

kubectl apply -f - <<EOF
apiVersion: hlf.kungfusoftware.es/v1alpha1
kind: FabricFollowerChannel
metadata:
  name: tienda-org2msp
spec:
  anchorPeers:
    - host: org2-peer0.tienda
      port: 7051
  hlfIdentity:
    secretKey: org2msp.yaml
    secretName: wallet
    secretNamespace: tienda
  mspId: Org2MSP
  name: tienda
  orderers:
    - certificate: |
${ORDERER0_TLS_CERT}
      url: grpcs://ord-node1.tienda:7050
  peersToJoin:
    - name: org2-peer0
      namespace: tienda
  externalPeersToJoin: []
EOF


```


## Preparar cadena de conexion para un peer

Para preparar la cadena de conexion, tenemos que:

1. Obtener la cadena de conexion sin usuarios para la organizacion MarketplaceMSP y OrdererMSP
2. Registrar un usuario en la autoridad de certificacion para firma (register)
3. Obtener los certificados utilizando el usuario creado anteriormente (enroll)
4. Adjuntar el usuario a la cadena de conexion

1. Obtener la cadena de conexion sin usuarios para la organizacion MarketplaceMSP y OrdererMSP

```bash
kubectl hlf inspect --output tienda.yaml --namespace=tienda
```

2. Registrar un usuario en la autoridad de certificacion para firma
```bash
kubectl hlf ca register --name=org1-ca --namespace=tienda --user=admin --secret=adminpw --type=admin \
 --enroll-id enroll --enroll-secret=enrollpw --mspid Org1MSP
```

3. Obtener los certificados utilizando el usuario creado anteriormente
```bash
kubectl hlf ca enroll --name=org1-ca --namespace=tienda --user=admin --secret=adminpw --mspid Org1MSP \
        --ca-name ca  --output peer-org1.yaml
```

4. Adjuntar el usuario a la cadena de conexion
```bash
kubectl hlf utils adduser --userPath=peer-org1.yaml --config=tienda.yaml --username=admin --mspid=Org1MSP
```



5. Registrar un usuario en la autoridad de certificacion para firma
```bash
kubectl hlf ca register --name=org2-ca --namespace=tienda --user=admin --secret=adminpw --type=admin \
 --enroll-id enroll --enroll-secret=enrollpw --mspid Org2MSP  
```

6. Obtener los certificados utilizando el usuario creado anteriormente
```bash
kubectl hlf ca enroll --name=org2-ca --namespace=tienda --user=admin --secret=adminpw --mspid Org2MSP \
        --ca-name ca  --output peer-org2.yaml
```

7. Adjuntar el usuario a la cadena de conexion
```bash
kubectl hlf utils adduser --userPath=peer-org2.yaml --config=tienda.yaml --username=admin --mspid=Org2MSP
```

Añadir clientes a org1 y org2:

```bash
kubectl hlf ca register --name=org1-ca --namespace=tienda --user=client-org1 --secret=clientpw --type=client \
 --enroll-id enroll --enroll-secret=enrollpw --mspid Org1MSP  

kubectl hlf ca enroll --name=org1-ca --namespace=tienda --user=client-org1 --secret=clientpw --mspid Org1MSP \
        --ca-name ca  --output user-org1.yaml

kubectl hlf ca register --name=org2-ca --namespace=tienda --user=client-org2 --secret=clientpw --type=client \
 --enroll-id enroll --enroll-secret=enrollpw --mspid Org2MSP  

kubectl hlf ca enroll --name=org2-ca --namespace=tienda --user=client-org2 --secret=clientpw --mspid Org2MSP \
        --ca-name ca  --output userAorg2.yaml


kubectl hlf utils adduser --userPath=user-org1.yaml --config=tienda.yaml --username=user-org1 --mspid=Org1MSP
kubectl hlf utils adduser --userPath=user-org2.yaml --config=tienda.yaml --username=user-org2 --mspid=Org2MSP

```

