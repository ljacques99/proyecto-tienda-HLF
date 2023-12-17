# API

Este API expone via HTTP las operaciones que se pueden realizar sobre el chaincode.
Hay un servidor por organizacion.
verificar los parametros en .env.org1 y .env.org2

## Instalar librerias
```bash
npm install
```


## Lanzar el servidor para Org1

Lanzar el servidor para la Org1

```bash
npm run server:org1:dev
```

## Lanzar el servidor para Org2

Lanzar el servidor para la Org2

```bash
npm run server:org2:dev
```

## Operaciones

### Verificar conectividad con el smart contract

```bash

```


### Inicializar el smart contract

```bash

```

### Registrar un usuario

```bash
http POST "http://localhost:3003/signup" username="user1" password="user1pw"
```

O usar un herramienta para hacer un post con un body:
```json
{
        "username": "user1",
        "password": "user1pw"
}
```

### Logearnos con el usuario

Esta operacion se tiene que hacer siempre que el programa se reinicie

```bash
http POST "http://localhost:3003/login" username="user1" password="user1pw"
```

```json
{
        "username": "user1",
        "password": "user1pw"
}
```

Para otras funciones y rutas, solo son acesibles desde un navigador con metamask

En el header viene en token de conexion firmado por metamask.
en el body, generalemente la funcion a llamar "fcn": "xxx" y los argumentos en el mismo orden que la funcion del chaincode "args": ["xxx", "yyy"]

