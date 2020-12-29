const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


async function lookup(number) {

    return await client.lookups.phoneNumbers(number)
        .fetch({ type: ['carrier'] })
        .catch(err => console.log(err.message))

}

async function createService() {

    return await client.verify.services.create({ friendlyName: 'Mobile Bill Payment' })
        .catch(err => console.log(err.message))

}

async function sendCode(payload) {

  
    return await
        client.verify.services(payload.sid)
            .verifications
            .create({ to: payload.loginNumber, channel: 'sms' })
            .catch(err => console.log(err.message))

}

async function verifyCode(payload) {

    return await client.verify.services(payload.sid)
        .verificationChecks
        .create({ to: payload.number, code: payload.code })
        .catch(err => console.log(err.message))

}

module.exports = {
    lookup,
    createService,
    sendCode,
    verifyCode
};
