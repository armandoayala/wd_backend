var jwt = require('./jwt');
var helper = require('./helper');

function encode(id, description, value) {

    var iterations = helper.getAppData().AppConfig.encode_iterations;

    var jwtToEncode = jwt.encodeWDData(id, description, value);
    var encodedValue = jwtToEncode;
    for (var i = 0; i < iterations; i++) {
        encodedValue = Buffer.from(encodedValue).toString('base64');
    }

    return encodedValue;
}

function decode(data) {
    var iterations = helper.getAppData().AppConfig.encode_iterations;

    var decodedValue = data;
    for (var i = 0; i < iterations; i++) {
        decodedValue = Buffer.from(decodedValue, 'base64').toString('ascii');
    }

    return jwt.decodeWDData(decodedValue);
}

module.exports =
{
    encode,
    decode
}