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
