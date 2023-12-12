import { Context } from "fabric-contract-api";
import { v5 as uuidv5 } from "uuid";

export const UUID_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

const { Contract } = require("fabric-contract-api");


// Definir nombres de tipo de objeto para el prefijo
const customerPrefix = "customer";
const merchantPrefix = "merchant";
const lastInvoiceNumberPrefix = "lastInvoice";
const productPrefix = "product";
const invoiceDetailPrefix = "invoiceDetail";
const invoicePrefix = "invoice"


const tslog = require("tslog");
const log = new tslog.Logger({});


const ALLOWED_MSPS_MERCHANT = ["Org1MSP"];
const ALLOWED_MSPS_CLIENT = ["Org2MSP"];

class TiendaContract extends Contract {

  async getMyIdentity(ctx: Context) {

    return {
      id: ctx.clientIdentity.getID(),
      mspId: ctx.clientIdentity.getMSPID(),
    };
  }
  
  async Ping(ctx: Context) {
    log.info("ping");
    return "pong";
  }

  async Init(ctx: Context) { // verificar
    const checkLastInvoiceNumber=await ctx.stub.getState(lastInvoiceNumberPrefix)
    if (checkLastInvoiceNumber.toString() ) {
      throw new Error("Chaincode ya initializado")
    }
    const lastInvoiceNumber = {
      number: 0
    }
    await ctx.stub.putState(lastInvoiceNumberPrefix, Buffer.from(JSON.stringify(lastInvoiceNumber)))
  }

  async getLastInvoiceNumber (ctx: Context) {
    const lastInvoiceNumber=await ctx.stub.getState(lastInvoiceNumberPrefix)
    return lastInvoiceNumber.toString()
  }

  async addMerchant( 
    ctx: Context,
    name: string
  ) {
    if (!ALLOWED_MSPS_MERCHANT.includes(ctx.clientIdentity.getMSPID())) {
      throw new Error("No tienes permiso para crear merchant");
    }
    const id = ctx.clientIdentity.getID();
    const merchantKey = ctx.stub.createCompositeKey(merchantPrefix, [id]);
    const merchant = {
      id,
      name
    };
    await ctx.stub.putState(merchantKey, Buffer.from(JSON.stringify(merchant)));
    log.info("Merchant creado", merchant);
    return JSON.stringify(merchant);
  }

  async getMerchant(ctx: Context, id: string) { 
    const merchantKey = ctx.stub.createCompositeKey(merchantPrefix, [id]);
    const merchant = await ctx.stub.getState(merchantKey);
    if (!merchant.toString()) {
      throw new Error("El merchant no esta registrado");
    }
    return merchant.toString();
  }

  async getMerchantList(ctx: Context) {
    let iterator = await ctx.stub.getStateByPartialCompositeKey(merchantPrefix, []);
    var merchant
    var merchantList =[]
    let result = await iterator.next();
    while (!result.done) {
      console.log(result.value.key)
      merchant = await ctx.stub.getState(result.value.key).then(res => res.toString()).then(res => JSON.parse(res));
      merchantList.push(merchant)
      result = await iterator.next();
    }
    return merchantList
  }

  async getCustomerList(ctx: Context) {
    let iterator = await ctx.stub.getStateByPartialCompositeKey(customerPrefix, []);
    var customer
    var customerList =[]
    let result = await iterator.next();
    while (!result.done) {
      console.log(result.value.key)
      customer = await ctx.stub.getState(result.value.key).then(res => res.toString()).then(res => JSON.parse(res));
      customerList.push(customer)
      result = await iterator.next();
    }
    return customerList
  }


  async addCustomer ( 
    ctx: Context,
  ) {
    if (!ALLOWED_MSPS_CLIENT.includes(ctx.clientIdentity.getMSPID())) {
      throw new Error("No tienes permiso para crear cliente");
    }
    const id = ctx.clientIdentity.getID();
    const customerKey = ctx.stub.createCompositeKey(customerPrefix, [id]);
    const customer = {
      id
    };
    await ctx.stub.putState(customerKey, Buffer.from(JSON.stringify(customer)));
    log.info("Customer creado", customer);
    return JSON.stringify(customer);
  }

  async getCustomer(ctx: Context, id: string) { 
    const customerKey = ctx.stub.createCompositeKey(customerPrefix, [id]);
    const customer = await ctx.stub.getState(customerKey);
    if (!customer.toString()) {
      throw new Error("El cliente no esta registrado");
    }
    return customer.toString();
  } 


async addProduct (
  ctx: Context,
  id: string,
  name: string,
  price: string, // en centimos
  imageURL: string
) {
  if (!ALLOWED_MSPS_MERCHANT.includes(ctx.clientIdentity.getMSPID())) {
    throw new Error("No tienes permiso para actualizar productos");
  }
  const merchantId = ctx.clientIdentity.getID();
  const merchantKey = ctx.stub.createCompositeKey(merchantPrefix, [merchantId]);
  const merchant = await ctx.stub.getState(merchantKey);
  if (!merchant.toString()) {
    throw new Error("El merchant no esta registrado");
  }
  const priceInt = parseInt(price);
  if (isNaN(priceInt)) {
    throw new Error("El precio debe ser un número");
  }

  const productKey = ctx.stub.createCompositeKey(productPrefix, [merchantId+id]);

  const product = {
    id,
    merchantId,
    name,
    priceInt,
    imageURL
  };
  await ctx.stub.putState(productKey, Buffer.from(JSON.stringify(product)));
  log.info("Product creado", product);
  return JSON.stringify(product);
}

async getProduct(ctx: Context, id: string, merchantId: string) { 
  const productKey = ctx.stub.createCompositeKey(productPrefix, [merchantId + id]);
  const product = await ctx.stub.getState(productKey);
  if (!product.toString()) {
    throw new Error("El producto no esta registrado");
  }
  return product.toString();
}

async getProductListByMerchant(ctx: Context, merchantId: string) {
  let iterator = await ctx.stub.getStateByPartialCompositeKey(productPrefix, []);
  var product
  var productList =[]
  let result = await iterator.next();
  while (!result.done) {
    console.log(result.value.key)
    product = await ctx.stub.getState(result.value.key).then(res => res.toString()).then(res => JSON.parse(res));

    if (product && product.merchantId==merchantId) {
      productList.push(product)
    }
    result = await iterator.next();
  }
  return productList
}

async getMyProductList(ctx: Context) {
  const merchantId = ctx.clientIdentity.getID();
  let iterator = await ctx.stub.getStateByPartialCompositeKey(productPrefix, []);
  var product
  var productList =[]
  let result = await iterator.next();
  while (!result.done) {
    console.log(result.value.key)
    product = await ctx.stub.getState(result.value.key).then(res => res.toString()).then(res => JSON.parse(res));

    if (product && product.merchantId==merchantId) {
      productList.push(product)
    }
    result = await iterator.next();
  }
  return productList
}

async deleteProduct(ctx: Context, id: string) {
  const merchantId = ctx.clientIdentity.getID();
  const productKey = await ctx.stub.createCompositeKey(productPrefix, [merchantId+id]);
  const product = await ctx.stub.getState(productKey)
  if (!product.toString()) {
    throw new Error("El producto no existe")
  }
  await ctx.stub.deleteState(productKey);
}

async getProductList(ctx: Context) {
  let iterator = await ctx.stub.getStateByPartialCompositeKey(productPrefix, []);
  var product
  var productList =[]
  let result = await iterator.next();
  while (!result.done) {
    console.log(result.value.key)
    product = await ctx.stub.getState(result.value.key).then(res => res.toString()).then(res => JSON.parse(res));
    productList.push(product)
    result = await iterator.next();
  }
  return productList
}

async addInvoice(
  ctx: Context,
  merchantId: string,
  lines: string,
) {
  if (!ALLOWED_MSPS_CLIENT.includes(ctx.clientIdentity.getMSPID())) {
    throw new Error("No tienes permiso para comprar");
  }
  const clientId = ctx.clientIdentity.getID();
  const invoiceNumber = await ctx.stub.getState(lastInvoiceNumberPrefix).then(res => res.toString()).then(res => JSON.parse(res)).then(res => res.number) + 1
  let total: number=0
  let lineNumber: number
  let price: number
  let name: string
  let productId: string
  let quantity: string
  var invoiceDetailList =[]
  let productKey
  let product
  let quantityInt: number
  const date = new Date()
  const lineas=JSON.parse(lines)
  if(!lineas) {
    throw new Error("El formato de la lines no es correcto")
  }
  if (lineas.length ==0) {
    throw new Error("No hay lineas")
  } else {
    for (let i=0; i < lineas.length; i++){
      productId = lineas[i].productId
      if(!productId) {
        throw new Error("productId error")
      }
      quantity = lineas[i].quantity
      if(!quantity) {
        throw new Error("quantity error")
      }
      productKey = ctx.stub.createCompositeKey(productPrefix, [merchantId + productId]);
      product = await ctx.stub.getState(productKey).then(res => res.toString()).then(res => JSON.parse(res));
      quantityInt = parseInt(quantity)
      if (isNaN(quantityInt)) {
        throw new Error("La cantidad debe ser un número");
      }
      price = quantityInt * product.priceInt
      total += price
      name = product.name
      lineNumber = i+1
      let invoiceDetail = {
        invoiceNumber,
        lineNumber,
        productId,
        name,
        quantity,
        price
      }
      let invoiceDetailKey = ctx.stub.createCompositeKey(invoiceDetailPrefix, [invoiceNumber.toString()+"line" + lineNumber.toString()]);
      await ctx.stub.putState(invoiceDetailKey, Buffer.from(JSON.stringify(invoiceDetail)));
      log.info("invoice detail creado", invoiceDetail);
      invoiceDetailList.push(invoiceDetail)
    }
    
    let invoice = {
      invoiceNumber,
      clientId,
      merchantId,
      date,
      total
    }

    
    let invoiceKey = ctx.stub.createCompositeKey(invoicePrefix, [invoiceNumber.toString()]);
    await ctx.stub.putState(invoiceKey, Buffer.from(JSON.stringify(invoice)));
    log.info("invoice creado", invoice);
    invoiceDetailList.push(invoice)

    const lastInvoiceNumber = {
      number: invoiceNumber
    }
    await ctx.stub.putState(lastInvoiceNumberPrefix, Buffer.from(JSON.stringify(lastInvoiceNumber)))

    return JSON.stringify(invoiceDetailList);
  }
}


async getInvoice(ctx: Context, invoiceNumber: string) {
  const userId = ctx.clientIdentity.getID();
  const MSP = ctx.clientIdentity.getMSPID();
  const invoiceKey = ctx.stub.createCompositeKey(invoicePrefix, [invoiceNumber]);
  const invoice = await ctx.stub.getState(invoiceKey).then(res => res.toString()).then(res => JSON.parse(res));
  if (!invoice) {
    throw new Error("La factura no existe");
  }
  if (!((ALLOWED_MSPS_MERCHANT.includes(MSP) && invoice.merchantId==userId) || (ALLOWED_MSPS_CLIENT.includes(MSP) && invoice.clientId==userId))) {
    throw new Error("No tienes permiso para consultar esa factura")
  }
  return invoice;
}
async getInvoiceDetail(ctx: Context, invoiceNumber: string, lineNumber: string) { 
  const userId = ctx.clientIdentity.getID(); // verificar el acceso a la factura antes de consultar el detalle
  const MSP = ctx.clientIdentity.getMSPID();
  const invoiceKey = ctx.stub.createCompositeKey(invoicePrefix, [invoiceNumber]);
  const invoice = await ctx.stub.getState(invoiceKey).then(res => res.toString()).then(res => JSON.parse(res));
  if (!invoice) {
    throw new Error("La factura no existe");
  }
  if (!((ALLOWED_MSPS_MERCHANT.includes(MSP) && invoice.merchantId==userId) || (ALLOWED_MSPS_CLIENT.includes(MSP) && invoice.clientId==userId))) {
    throw new Error("No tienes permiso para consultar esa factura")
  }
  const invoiceDetailKey = ctx.stub.createCompositeKey(invoiceDetailPrefix, [invoiceNumber + "line" + lineNumber]);
  const invoiceDetail = await ctx.stub.getState(invoiceDetailKey);
  if (!invoiceDetail.toString()) {
    throw new Error("La linea de la factura no existe");
  }
  return invoiceDetail.toString();
}

async getInvoiceDetailList (ctx: Context, invoiceNumber: string) {
  const userId = ctx.clientIdentity.getID(); // verificar el acceso a la factura antes de consultar el detalle
  const MSP = ctx.clientIdentity.getMSPID();
  const invoiceKey = ctx.stub.createCompositeKey(invoicePrefix, [invoiceNumber]);
  const invoice = await ctx.stub.getState(invoiceKey).then(res => res.toString()).then(res => JSON.parse(res));
  if (!invoice) {
    throw new Error("La factura no existe");
  }
  if (!((ALLOWED_MSPS_MERCHANT.includes(MSP) && invoice.merchantId==userId) || (ALLOWED_MSPS_CLIENT.includes(MSP) && invoice.clientId==userId))) {
    throw new Error("No tienes permiso para consultar esa factura")
  }
  let iterator = await ctx.stub.getStateByPartialCompositeKey(invoiceDetailPrefix, []);
  var invoiceDetail
  var invoiceDetailList =[]
  let result = await iterator.next();
  while (!result.done) {
    console.log(result.value.key)
    invoiceDetail = await ctx.stub.getState(result.value.key).then(res => res.toString()).then(res => JSON.parse(res));

    if (invoiceDetail && invoiceDetail.invoiceNumber== invoiceNumber) {
      invoiceDetailList.push(invoiceDetail)
    }
    result = await iterator.next();
  }
  return invoiceDetailList
}

async getMyInvoiceMerchant (ctx: Context) {
  const merchantId = ctx.clientIdentity.getID();
  const MSP = ctx.clientIdentity.getMSPID();
  if (!ALLOWED_MSPS_MERCHANT.includes(MSP)) {
    throw new Error("No tienes acceso de merchant")
  }
  let iterator = await ctx.stub.getStateByPartialCompositeKey(invoicePrefix, []);
  var invoice
  var invoiceList =[]
  let result = await iterator.next();
  while (!result.done) {
    console.log(result.value.key)
    invoice = await ctx.stub.getState(result.value.key).then(res => res.toString()).then(res => JSON.parse(res));
    if (invoice && invoice.merchantId==merchantId) {
      invoiceList.push(invoice)
    }
    result = await iterator.next();
  }
  return invoiceList
}

async getMyInvoiceClient (ctx: Context) {
  const clientId = ctx.clientIdentity.getID();
  const MSP = ctx.clientIdentity.getMSPID();
  if (!ALLOWED_MSPS_CLIENT.includes(MSP)) {
    throw new Error("No tienes acceso de cliente")
  }
  let iterator = await ctx.stub.getStateByPartialCompositeKey(invoicePrefix, []);
  var invoice
  var invoiceList =[]
  let result = await iterator.next();
  while (!result.done) {
    console.log(result.value.key)
    invoice = await ctx.stub.getState(result.value.key).then(res => res.toString()).then(res => JSON.parse(res));

    if (invoice && invoice.clientId==clientId) {
      invoiceList.push(invoice)
    }
    result = await iterator.next();
  }
  return invoiceList
}

  async limpiarChaincode(ctx: Context) {
    // añadir limitacion a quien puede hacerlo
    let iterator = await ctx.stub.getStateByPartialCompositeKey(customerPrefix, []);

    let result = await iterator.next();
    while (!result.done) {
      await ctx.stub.deleteState(result.value.key);
      result = await iterator.next();
    }

    iterator = await ctx.stub.getStateByPartialCompositeKey(merchantPrefix, []);

    result = await iterator.next();
    while (!result.done) {
      await ctx.stub.deleteState(result.value.key);
      result = await iterator.next();
    }

    iterator = await ctx.stub.getStateByPartialCompositeKey(productPrefix, []);

    result = await iterator.next();
    while (!result.done) {
      await ctx.stub.deleteState(result.value.key);
      result = await iterator.next();
    }

    iterator = await ctx.stub.getStateByPartialCompositeKey(invoiceDetailPrefix, []);

    result = await iterator.next();
    while (!result.done) {
      await ctx.stub.deleteState(result.value.key);
      result = await iterator.next();
    }

    iterator = await ctx.stub.getStateByPartialCompositeKey(invoicePrefix, []);

    result = await iterator.next();
    while (!result.done) {
      await ctx.stub.deleteState(result.value.key);
      result = await iterator.next();
    }
    
    await ctx.stub.deleteState(lastInvoiceNumberPrefix);

    return "OK";
  }

}

module.exports = TiendaContract;
