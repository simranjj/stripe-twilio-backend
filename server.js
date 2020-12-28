require('dotenv').config()
const cors = require('cors')
const express = require('express')
const app = express()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const uuid = require('uuid')
const bodyParser = require('body-parser')
const store = require('store')
const {
    lookup,
    createService,
    sendCode,
    verifyCode
} = require('./service/twilio.service')

app.use(bodyParser.json())
app.use(cors())


app.get('/', function (req, res) {
    res.status(200).json({ "message" : "Server up" });
})

app.post('/payment', (req, res) => {

    const { product, token } = req.body;
    const idempotencyKey = uuid.v4()

    return stripe.customers.create({
        email: token.email,
        source: token.id
    }).then((customer) => {
        stripe.charges.create({
            amount: product.price,
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

    return lookup(loginNumber)
        .then(response => {
            return createService();
        }).then(service => {
            store.set('sessionID', { sid: service.sid });
            let payload = { loginNumber, sid: store.get('sessionID').sid }
            return sendCode(payload)
        }).then(result => {
            result ? res.status(200).json( {"message" : result.status}) : res.status(400).json({ "message" : result.status})
        }).catch(err => {
            res.status(400).json({ "message": err.message })
            console.log(err.message)
        });


})

app.post('/verify', async (req, res) => {

    try {
        let { number, code } = req.body;
        let payload = { number, code, sid: store.get('sessionID').sid }
        return verifyCode(payload)
            .then(result => {
                if (result) {
                    res.status(200).json({ "valid": result.valid })
                }
                else
                    res.status(400).json({ "message": "Resource not found" })
            })
    } catch (err) {
        res.status(400).json({ "message": err.message })
        console.log(err.message)
    }


})

app.listen(8000, () => {



})