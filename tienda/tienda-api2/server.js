var express = require('express');
var bodyParser = require('body-parser');
var yaml = require("js-yaml")
var fs = require("fs")

var app = express();
app.use(bodyParser.json());

const { FileSystemWallet, Gateway } = require('fabric-network');

app.get('/test', async (req, res) => {
    try {
        const fcn = "getMyInvoiceClient"
        const gateway = new Gateway();
        const wallet = new FileSystemWallet('./WALLETS/wallet')

        await gateway.connect("../../", )

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    } 
})