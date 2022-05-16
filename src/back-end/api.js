const route = require("express").Router();
const { Checkout } = require("checkout-sdk-node");
// From node js sdk version 2.0.0, we can use access token
let cko = new Checkout('GcQ0taurXlozWlSHKXCO4e33KSm_9Ye3O9IhXg7Uib7WAn2XDMEl2m0dLeKcuiPeDRW-ik4Y3Y5BZSk9LA0dig', {
  client: 'ack_ioyasynbmpwezoizbtstajdxka', // ClientId
  scope: ['gateway'], // array of scopes
  environment: 'sandbox', // or "production"
});
/*let cko = new Checkout('sk_sbox_2hy6ttp44ssbzk532k6nlv7ypui', {
  pk: 'pk_sbox_xe2tfc7ob6nu77khdthzlp6e5qo'
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
  } catch (error) {
    console.log(error.name, error.http_code, error.body);
    switch (error.name) {
      // Error names
    }
  }
  // Only send back the redirection URL
  res.send({
    redirectionUrl: payment.redirectLink,
  });
});

route.post("/payWithCB", async (req, res) => {

  const payment = await cko.payments.request({
    source: {
      token: req.body.token,
    },
    processing: {
      "preferred_scheme": req.body.preferredScheme
    },
    currency: "EUR",
    amount: 400, // pence
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
});

// Get payment details by cko-session-id
route.post("/getPaymentBySession", async (req, res) => {
    const details = await cko.payments.get(req.body.sessionId);
    res.send(details);
});

module.exports = route;
