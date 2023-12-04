


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

Post body para añadir factura
http://localhost:3004/submit

{
  "user": "user-org2",
  "fcn": "getMyInvoiceClient",
  "args": "['x509::/OU=client/CN=clientorg1::/C=ES/L=Alicante/=Alicante/O=Kung Fu Software/OU=Tech/CN=ca', '[{"productId": "prod1", "quantity": "2"},{"productId": "prod2", "quantity": "4"}]']"
}