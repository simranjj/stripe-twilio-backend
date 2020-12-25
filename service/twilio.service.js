`use strict`

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
let serviceID = ''


async function lookup(number) {

    return await client.lookups.phoneNumbers(number)
        .fetch({ type: ['carrier'] })
        .catch(err => console.log(err.message))

}

async function createService() {

    return await client.verify.services.create({ friendlyName: 'My First Verify Service' })
        .then(service => serviceID = service.sid)
        .catch(err => console.log(err.message))

}

async function sendCode(number) {

    return await
        client.verify.services(serviceID)
            .verifications
            .create({ to: number, channel: 'sms' })
            .catch(err => console.log(err.message))

}

async function verifyCode(data) {

    return await client.verify.services(serviceID)
        .verificationChecks
        .create({ to: data.number, code: data.code })
        .catch(err => console.log(err.message))

}

module.exports = {
    lookup,
    createService,
    sendCode,
    verifyCode
};
