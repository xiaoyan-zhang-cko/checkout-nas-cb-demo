const route = require("express").Router();
const {Checkout} = require("checkout-sdk-node");
// From node js sdk version 2.0.0, we can use access token
// FIXME should be passed by parameters
let cko = new Checkout('${accessSecret}', {
    client: '${clientId}', // ClientId
    scope: ['gateway'], // array of scopes
    environment: 'sandbox', // or "production"
});
/*let cko = new Checkout('sk_sbox_XXXXXXXXXXXXXXXXXXXXX', {
  pk: 'pk_sbox_XXXXXXXXXXXXXXXXXXXX'
});*/

route.post("/payWith3ds", async (req, res) => {
    try {
        const payment = await cko.payments.request({
            source: {
                token: req.body.token,
            },
            currency: "GBP",
            amount: 400, // pence
            reference: "TEST-ORDER",
            "3ds": {
                enabled: true,
            },
            success_url: req.body.url + "/success",
            failure_url: req.body.url + "/fail",
        });
        // Only send back the redirection URL
        res.send({
            redirectionUrl: payment.redirectLink,
        });
    } catch (error) {
        console.log(error.name, error.http_code, error.body);
        switch (error.name) {
            // Error names
        }
    }
});

route.post("/payWithCB", async (req, res) => {
    try {
        const payment = await cko.payments.request({
            source: {
                token: req.body.token,
            },
            processing: {
                "preferred_scheme": req.body.preferredScheme
            },
            currency: "EUR",
            amount: 500, // pence
            reference: "TEST-ORDER",
            // To active 3DS
            "3ds": {
                enabled: true
            },
            success_url: req.body.url + "/success",
            failure_url: req.body.url + "/fail",
        });
        // Only send back the redirection URL
        res.send({
            redirectionUrl: payment.redirectLink,
        });
    } catch (error) {
        console.log(error.name, error.http_code, error.body);
    }
});

// Get payment details by cko-session-id
route.post("/getPaymentBySession", async (req, res) => {
    const details = await cko.payments.get(req.body.sessionId);
    res.send(details);
});

module.exports = route;
