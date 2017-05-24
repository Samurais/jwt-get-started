/**
 * JWT Test
 */
const test = require('ava');
const debug = require('debug')('jwttest');
const jwt = require('jsonwebtoken');
const shortid = require('shortid');

async function wait(milliseconds) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, milliseconds)
    });
}


test('Test#decode', async (t) => {
    let token = jwt.sign(
        // payload
        {
            data: 'foobar'
        },
        // secret
        'secret',
        // options
        {
            expiresIn: 60 * 60,
            issuer: 'test',
            jwtid: shortid.generate() // https://tools.ietf.org/html/rfc7519#section-4.1.7
        }
    );

    // Returns the decoded payload without verifying if the signature is valid.
    debug('Generated token: %s', token)

    let decoded = jwt.decode(token, { complete: true })
    debug('Decoded token: %j', decoded)

    /**
     * Do not contain any sensitive data in a JWT. These tokens are usually signed 
     * to protect against manipulation (not encrypted) so the data in the claims 
     * can be easily decoded and read. 
     */
    t.is(decoded.payload.data, 'foobar', 'data should be foobar.')

    t.pass()
})


test('Test#verify', async (t) => {
    let token = jwt.sign(
        // payload
        {
            data: 'foobar'
        },
        // secret
        'secret',
        // options
        {
            expiresIn: 1, // expired in 1 seconds
            issuer: 'test',
            jwtid: shortid.generate() // https://tools.ietf.org/html/rfc7519#section-4.1.7
        }
    );
    let result = await jwt.verify(token, 'secret')
    debug('verify result %j', result);
    t.is(result.data, 'foobar', 'data should be foobar.');
    await wait(1000)
    jwt.verify(token, 'secret', function (err, result2) {
        if (err) {
            debug('verify err ', err)
            t.is(err.name, 'TokenExpiredError', 'name should be TokenExpiredError.')
            debug('verify result2 ', result2)
            t.pass()
        } else {
            t.fail()
        }
    });
})