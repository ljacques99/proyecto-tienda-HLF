Para hacer el bridge, se necesita deployar el contrato tienda-contract.sol en la red de MATIC mumbai (es posible usar otra red ethereum)

Puedes usar el herramienta que quieras.

Usamos remix y metamask:
- copiar y pegar el contrato en un contrato de remix
- eligir la cuenta que sera el owner y la red mumbai en metamask
- deployar con remix
- copiar y pegar la direccion del contrato en el fichero contract-address.txt
- copiar y pegar la direccion y la llave privada del owner en un fichero contract-details.json: 
    {
        ownerAddress: ""
        ownerPrivateKey:""
    }