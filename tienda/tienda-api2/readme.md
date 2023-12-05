npm run server:org1:dev
npm run server:org2:dev


Post body para consultar facturas de un cliente
http://localhost:3004/consult

{
  "user": "user-org2",
  "fcn": "getMyInvoiceClient"
}


Post body para registrar un client en el API
http://localhost:3004/id

{
  "user": "user-org2"
}


Post body para añadir un producto en el API
http://localhost:3003/submit

{
  "user": "user-org1",
  "args": ["prodMartes1", "camiseta blanca", "8"]
}