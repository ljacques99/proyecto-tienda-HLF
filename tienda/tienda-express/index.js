const {Pool} = require("pg")
const express = require("express")
const cors = require("cors")
//const bodyParser= require("body-parser")

const app = express()
app.listen(4455)
app.use(cors())
app.use(express.json())

const pool = new Pool ({
    host: "localhost",
    port: 1979,
    user: "postgres",
    password: "Laurent1!",
    database: "postgres"
})

app.get("/", (req, res) => {
    res.send({reponse: "Hola desde express"})
})

app.get("/customers", async (req, res) => {
    const repuesta = await pool.query("select * from customers order by customer_id limit 10")
    res.send(repuesta.rows)
})

app.post("/ordersByCustomer", async (req, res) => {
    console.log(req.body)
    const repuesta = await pool.query(`select * from orders where customer_id='${req.body.customer_id}'`)
    res.send(repuesta.rows)
})

app.post("/orderdetailsByOrder", async (req, res) => {
    console.log(req.body)
    const repuesta = await pool.query(`select * from order_details where order_id=${req.body.order_id}`)
    res.send(repuesta.rows)
})