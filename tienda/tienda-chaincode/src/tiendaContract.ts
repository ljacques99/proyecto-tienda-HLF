import { Context } from "fabric-contract-api";
import { v5 as uuidv5 } from "uuid";

export const UUID_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

const { Contract } = require("fabric-contract-api");


// Definir nombres de tipo de objeto para el prefijo
const customerPrefix = "customer";
const merchantPrefix = "merchant";
const orderPrefix = "order";
const orderDetailPrefix = "orderDetail";

const tslog = require("tslog");
const log = new tslog.Logger({});


//const ALLOWED_MSPS_CREAR_PRODUCTOS = ["SonyMSP"]; // à supprimer
//const ALLOWED_MSPS_COMPRAR = ["MarketplaceMSP"]; // à supprimer

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

  async addMerchant( 
    ctx: Context,
    id: string,
    name: string
  ) {
    /* if (!ALLOWED_MSPS_CREAR_PRODUCTOS.includes(ctx.clientIdentity.getMSPID())) { // vérifier getmyID() = name ?
      throw new Error("No tienes permiso para crear productos");
    } */
    const merchantKey = ctx.stub.createCompositeKey(merchantPrefix, [id]);
/*     const precioInt = parseInt(precio);
    if (isNaN(precioInt)) {
      throw new Error("El precio debe ser un número");
    }
    const cantidadInt = parseInt(cantidad);
    if (isNaN(cantidadInt)) {
      throw new Error("La cantidad debe ser un número");
    } */
    const merchant = {
      id,
      name
    };
    await ctx.stub.putState(merchantKey, Buffer.from(JSON.stringify(merchant)));
    log.info("Mechant creado", merchant);
    return JSON.stringify(merchant);
  }

  async getMerchant(ctx: Context, id: string) { 
    const merchantKey = ctx.stub.createCompositeKey(merchantPrefix, [id]);
    const merchant = await ctx.stub.getState(merchantKey);
    return merchant.toString();
  }

  async getMerchantList(ctx: Context) {
    let iterator = await ctx.stub.getStateByPartialCompositeKey(merchantPrefix, []);
    //console.log("start")
    var merchant
    //var orderst
    //var orderjson
    var merchantList =[]
    let result = await iterator.next();
    while (!result.done) {
      console.log(result.value.key)
      merchant = await ctx.stub.getState(result.value.key).then(res => res.toString()).then(res => JSON.parse(res));
      //orderst = order.toString()
      //orderjson = JSON.parse(orderst)
      //orderjson= JSON.parse(order.toString())
      //console.log("a récupéré", orderst, orderjson)
      merchantList.push(merchant)
      result = await iterator.next();
    }
    //console.log("fini", orderList)
    return merchantList
  }

  async getCustomerList(ctx: Context) {
    let iterator = await ctx.stub.getStateByPartialCompositeKey(customerPrefix, []);
    //console.log("start")
    var customer
    //var orderst
    //var orderjson
    var customerList =[]
    let result = await iterator.next();
    while (!result.done) {
      console.log(result.value.key)
      customer = await ctx.stub.getState(result.value.key).then(res => res.toString()).then(res => JSON.parse(res));
      //orderst = order.toString()
      //orderjson = JSON.parse(orderst)
      //orderjson= JSON.parse(order.toString())
      //console.log("a récupéré", orderst, orderjson)
      customerList.push(customer)
      result = await iterator.next();
    }
    //console.log("fini", orderList)
    return customerList
  }


  async addCustomer ( 
    ctx: Context,
    address: string
  ) {
    /* if (!ALLOWED_MSPS_CREAR_PRODUCTOS.includes(ctx.clientIdentity.getMSPID())) { // supprimer
      throw new Error("No tienes permiso para crear productos");
    } */
    const customerKey = ctx.stub.createCompositeKey(customerPrefix, [address]);
/*     const precioInt = parseInt(precio);
    if (isNaN(precioInt)) {
      throw new Error("El precio debe ser un número");
    }
    const cantidadInt = parseInt(cantidad);
    if (isNaN(cantidadInt)) {
      throw new Error("La cantidad debe ser un número");
    } */
    const customer = {
      address
    };
    await ctx.stub.putState(customerKey, Buffer.from(JSON.stringify(customer)));
    log.info("Customer creado", customer);
    return JSON.stringify(customer);
  }

  async getCustomer(ctx: Context, address: string) { 
    const customerKey = ctx.stub.createCompositeKey(customerPrefix, [address]);
    const customer = await ctx.stub.getState(customerKey);
    return customer.toString();
  } 
  /* async updateProduct(
    ctx: Context,
    id: string,
    nombre: string,
    descripcion: string,
    precio: string,
    cantidad: string
  ) {
    if (!ALLOWED_MSPS_CREAR_PRODUCTOS.includes(ctx.clientIdentity.getMSPID())) {
      throw new Error("No tienes permiso para actualizar productos");
    }
    const productKey = ctx.stub.createCompositeKey(productPrefix, [id]);
    const precioInt = parseInt(precio);
    if (isNaN(precioInt)) {
      throw new Error("El precio debe ser un número");
    }
    const cantidadInt = parseInt(cantidad);
    if (isNaN(cantidadInt)) {
      throw new Error("La cantidad debe ser un número");
    }
    const product = {
      id,
      nombre,
      descripcion,
      precio: precioInt,
      cantidad: cantidadInt,
      createdBy: ctx.clientIdentity.getID(),
    };
    await ctx.stub.putState(productKey, Buffer.from(JSON.stringify(product)));
    return JSON.stringify(product);
  }
  async deleteProduct(ctx: Context, id: string) {
    if (!ALLOWED_MSPS_CREAR_PRODUCTOS.includes(ctx.clientIdentity.getMSPID())) {
      throw new Error("No tienes permiso para crear productos");
    }
    const productKey = ctx.stub.createCompositeKey(productPrefix, [id]);
    await ctx.stub.deleteState(productKey);
  }
*/

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
