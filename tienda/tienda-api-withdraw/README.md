# API

Este API expone via HTTP las operaciones para retirar MATIC despues de que se hayan quemado los tokens

verificar los parametros en .env.org1
verificar tambien los paths de los ficheros del smart contract.
Si se ua otra red que Matic Mumbai, se debe cambiar el url del provider y el chainID

## Instalar librerias
```bash
npm install
```


## Lanzar el servidor 

Lanzar el servidor para la Org1

```bash
npm run server:org1:dev
```

### initializar el toker la primera vez que se levanta el servidor

Mandar un post con un body (con los nombres que quieras)
{
    "args": ["Token Name", "Token symbol", "Token decimals"]
}

