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
const orderPrefix = "order";
const orderDetailPrefix = "orderDetail";

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
  price: string // en centimos
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
    priceInt
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
  productId: string,
  quantity: string
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
  var invoiceDetailList =[]
  const date = new Date()
  let productKey = ctx.stub.createCompositeKey(productPrefix, [merchantId + productId]);
  const product = await ctx.stub.getState(productKey).then(res => res.toString()).then(res => JSON.parse(res));
  const quantityInt = parseInt(quantity)
  if (isNaN(quantityInt)) {
    throw new Error("La cantidad debe ser un número");
  }
  price = quantityInt * product.priceInt
  total += price
  name = product.name
  lineNumber = 1
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
  const invoiceDetailKey = ctx.stub.createCompositeKey(invoicePrefix, [invoiceNumber + "line" + lineNumber]);
  const invoiceDetail = await ctx.stub.getState(invoiceDetailKey);
  if (!invoiceDetail.toString()) {
    throw new Error("La linea de la factura no existe");
  }
  return invoiceDetail.toString();
}

async addOrder( // modifier pour client
    ctx: Context,
    id: string,
    customer_id: string,
    employee_id: string,
    order_date: string,
    required_date: string,
    shipped_date: string,
    shipped_via: string,
    freight: string,
    ship_name: string,
    ship_address: string,
    ship_city: string,
    region: string,
    ship_postal_code: string,
    ship_country: string
  ) {

    const orderKey = ctx.stub.createCompositeKey(orderPrefix, [id.toString()]);

    /* if (isNaN(freight)) {
      throw new Error("El freight debe ser un número");
    } */

    const order = {
      id,
      customer_id,
      employee_id,
      order_date,
      required_date,
      shipped_date,
      shipped_via,
      freight,
      ship_name,
      ship_address,
      ship_city,
      region,
      ship_postal_code,
      ship_country
    };
    await ctx.stub.putState(orderKey, Buffer.from(JSON.stringify(order)));
    log.info("Pedida creada", order);
    return JSON.stringify(order);
  }

  async getOrder(ctx: Context, id: string) { 
    const orderKey = ctx.stub.createCompositeKey(orderPrefix, [id]);
    const order = await ctx.stub.getState(orderKey);
    return order.toString();
  }
  
  async addOrderDetail( // modifier pour client
    ctx: Context,
    order_id: string,
    product_id: string,
    unit_price: string,
    quantity: string,
    discount: string
  ) {

    const orderDetailKey = ctx.stub.createCompositeKey(orderDetailPrefix, [order_id, product_id]);

    /* if (isNaN(unit_price)) {
      throw new Error("El unit_price debe ser un número");
    }
    if (isNaN(quantity)) {
      throw new Error("La quantity debe ser un número");
    }
    if (isNaN(discount)) {
      throw new Error("El discount debe ser un número");
    } */

    const orderDetail = {
      order_id,
      product_id,
      unit_price,
      quantity,
      discount
    };
    await ctx.stub.putState(orderDetailKey, Buffer.from(JSON.stringify(orderDetail)));
    log.info("Linea creada", orderDetail);
    return JSON.stringify(orderDetail);
  }

  async getOrderDetail(ctx: Context, order_id: string, product_id: string) { 
    const orderDetailKey = ctx.stub.createCompositeKey(orderDetailPrefix, [order_id, product_id]);
    const orderDetail = await ctx.stub.getState(orderDetailKey);
    return orderDetail.toString();
  }

/*


  
  async getMyBalance(ctx: Context) {
    const balanceKey = ctx.stub.createCompositeKey(balancePrefix, [ctx.clientIdentity.getID()]);
    const balance = await ctx.stub.getState(balanceKey);
    return balance.toString();
  }
  async setMyBalance(ctx: Context, balance: string) {
    const balanceKey = ctx.stub.createCompositeKey(balancePrefix, [ctx.clientIdentity.getID()]);
    const balanceInt = parseInt(balance);
    if (isNaN(balanceInt)) {
      throw new Error("La cantidad debe ser un número");
    }
    const balanceItem = {
      balance: balanceInt,
    };
    await ctx.stub.putState(balanceKey, Buffer.from(JSON.stringify(balanceItem)));
    return balanceItem
  }

  async comprar(ctx: Context, id: string, cantidad: string) {
    if (!ALLOWED_MSPS_COMPRAR.includes(ctx.clientIdentity.getMSPID())) {
      throw new Error("No tienes permiso para comprar");
    }
    const cantidadInt = parseInt(cantidad);
    if (isNaN(cantidadInt)) {
      throw new Error("La cantidad debe ser un número");
    }

    const productKey = ctx.stub.createCompositeKey(productPrefix, [id]);
    const product = await ctx.stub.getState(productKey);
    const productJson = JSON.parse(product.toString());
    if (cantidadInt > productJson.cantidad) {
      throw new Error("No hay suficientes productos");
    }

    const balanceKey = ctx.stub.createCompositeKey(balancePrefix, [ctx.clientIdentity.getID()]);
    const balance = await ctx.stub.getState(balanceKey);
    const balanceJson = JSON.parse(balance.toString());
    if (balanceJson.balance < productJson.precio * cantidadInt) {
      throw new Error("No hay suficiente balance");
    }
    balanceJson.balance = balanceJson.balance - productJson.precio * cantidadInt;
    await ctx.stub.putState(balanceKey, Buffer.from(JSON.stringify(balanceJson)));
    productJson.cantidad = productJson.cantidad - cantidadInt;
    await ctx.stub.putState(productKey, Buffer.from(JSON.stringify(productJson)));

    const ventaId = uuidv5(ctx.stub.getTxID() + ctx.clientIdentity.getMSPID() + id + cantidad, UUID_NAMESPACE);
    const ventaKey = ctx.stub.createCompositeKey(ventaPrefix, [ctx.clientIdentity.getID(), ventaId]);
    const venta = {
      id: ventaId,
      cantidad: cantidadInt,
      compradoPor: ctx.clientIdentity.getID(),
    };

    await ctx.stub.putState(ventaKey, Buffer.from(JSON.stringify(venta)));
    return JSON.stringify(venta);
  }

  async getVenta(ctx: Context, id: string) {
    const ventaKey = ctx.stub.createCompositeKey(ventaPrefix, [ctx.clientIdentity.getID(), id]);
    const venta = await ctx.stub.getState(ventaKey);
    return venta.toString();
  }

  async getMyVentas(ctx: Context) {
    // venta\u0000ID_USER
    const ventaIterator = await ctx.stub.getStateByPartialCompositeKey(ventaPrefix, [ctx.clientIdentity.getID()]);
    const ventas = [];
    while (true) {
      const venta = await ventaIterator.next();
      if (venta.value && venta.value.value.toString()) {
        let key = ctx.stub.splitCompositeKey(venta.value.key);
        ventas.push({ Key: key.attributes[1], Record: JSON.parse(venta.value.value.toString()) });
      }
      if (venta.done) {
        await ventaIterator.close();
        return JSON.stringify(ventas);
      }
    }
  } */

  async getOrderList(ctx: Context, customer_id: string) {
    let iterator = await ctx.stub.getStateByPartialCompositeKey(orderPrefix, []);
    //console.log("start")
    var order
    //var orderst
    //var orderjson
    var orderList =[]
    let result = await iterator.next();
    while (!result.done) {
      console.log(result.value.key)
      order = await ctx.stub.getState(result.value.key).then(res => res.toString()).then(res => JSON.parse(res));
      //orderst = order.toString()
      //orderjson = JSON.parse(orderst)
      //orderjson= JSON.parse(order.toString())
      //console.log("a récupéré", orderst, orderjson)
      if (order.customer_id==customer_id) {
        orderList.push(order)
      }
      result = await iterator.next();
    }
    //console.log("fini", orderList)
    return orderList
  }

  async getOrderDetailList(ctx: Context, order_id: string) {
    let iterator = await ctx.stub.getStateByPartialCompositeKey(orderDetailPrefix, []);
    var order
    var orderList =[]
    let result = await iterator.next();
    while (!result.done) {
      console.log(result.value.key)
      order = await ctx.stub.getState(result.value.key).then(res => res.toString()).then(res => JSON.parse(res));
      if (order.order_id==order_id) {
        orderList.push(order)
      }
      result = await iterator.next();
    }
    //console.log("fini", orderList)
    return orderList
  }

  async limpiarChaincode(ctx: Context) {
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

    iterator = await ctx.stub.getStateByPartialCompositeKey(orderPrefix, []);

    result = await iterator.next();
    while (!result.done) {
      await ctx.stub.deleteState(result.value.key);
      result = await iterator.next();
    }

    iterator = await ctx.stub.getStateByPartialCompositeKey(orderDetailPrefix, []);

    result = await iterator.next();
    while (!result.done) {
      await ctx.stub.deleteState(result.value.key);
      result = await iterator.next();
    }
    
    await ctx.stub.deleteState(lastInvoiceNumberPrefix);

    return "OK";
  }

 /*  async Init(ctx: Context) { // pas possible de faire plusieurs transcations
    const customerList = await fetch(`http://localhost:4455/customers`).then(res => res.json())
    //console.log(customerList)
    customerList.map((item) => { if(item.region==null) {item.region="null"} ; return item } ).map((item) => this.addCustomer(
        ctx,
        item.customer_id,
        item.company_name,
        item.contact_name,
        item.contact_title,
        item.address,
        item.city,
        item.postal_code,
        item.country,
        item.phone,
        item.fax
    ))
    //customerList.map((item) => console.log(item))
  } */

/*   async Add2(ctx: Context) {
    this.addCustomer(
      ctx,
      'ANTR',
      'companyTest2',
      'Name',
      'Title',
      'Street',
      'Madrid',
      'ZIP',
      'Madrid',
      '069898444',
      '013445555' 
    )
  } */

  async Test(ctx: Context) {
    fetch(`http://localhost:4455`)
    .then(res => res.json())
    .then(json => console.log(json))
  }
}

module.exports = TiendaContract;
