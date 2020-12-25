require('dotenv').config()
const cors = require('cors')
const express = require('express')
const app = express()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const uuid = require('uuid')
const bodyParser = require('body-parser')
const {
    lookup,
    createService,
    sendCode,
    verifyCode
} = require('./service/twilio.service')

app.use(bodyParser.json())
app.use(cors())


app.get('/', function (req, res) {
    res.send('Hello');
})

app.post('/payment', (req, res) => {
    const { product, token } = req.body;
    const idempotencyKey = uuid.v4()
    return stripe.customers.create({
        email: token.email,
        source: token.id
    }).then((customer) => {
        stripe.charges.create({
            amount: product.price * 100,
            currency: 'cad',
            customer: customer.id,
            receipt_email: token.email,
            description: `Purchased: product.name`
        }, { idempotencyKey })
    }).then(result => res.status(200).json(result))
        .catch(err => console.log(err))

})

app.post('/login', async (req, res) => {

    let loginNumber = req.body.number;
    let phoneNumber = lookup(loginNumber).then(response => response ? response.phone_number : null);
    
    if (phoneNumber) {
        return  sendCode(loginNumber)
        .then(result => {
            result ? res.status(200).json(result.status) :  res.status(400).send('Invalid number')
        })
        .catch(err => console.log(err.message));
     
       
    }


})

app.post('/verify', async (req, res) => {

    let data = req.body
   return await verifyCode(data) 
    .then(result => res.status(200).json(result.status))
    .catch(err => console.log(err));

})

app.listen(8000, () => {

   createService();

})