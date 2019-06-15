var MongoClient = require('mongodb').MongoClient
var crypto = require('crypto');
var http = require('http')
var request = require('request')
var jq = require('node-jq')
var fs = require('fs')
var prices = require("./prices.js")

const port = process.env.PORT
const client_id = process.env.CLIENTID
const endpoint = process.env.GATEWAY
const param = process.env.PARAM
var method = process.env.METHOD

var rawdata = fs.readFileSync('external.json');  
var info = JSON.parse(rawdata);

var enum_back = info.enum_back

i = 0
while (i < enum_back.length) {
    if (endpoint.search(enum_back[i]) > 0) {
        var search = enum_back[i]
    }
    i++
}

switch (search) {
    case info.prices.name:
        var backend = prices.call
        break
    case info.product_list.name:
        if (param != '' ) {
            var body = (info.product_list.body.replace(info.request_param, param))
            body = body.replace(/'/g, "\"")
            var backend = info.product_list.backend_1
            method = 'POST'
        }
        break
}

var handleRequestError = function(code, info) {
    switch (code) {
        case 400:
            console.error(info.error_code + info.bad_request, code)
            break
        case 401:
            console.error(info.error_code + info.unauthorized, code)
            break
        case 403:
            console.error(info.error_code + info.forbidden, code)
            break
        case 404:
            console.error(info.error_code + info.not_found, code)
            break
        case 405:
            console.error(info.error_code + info.method_not_allowed, code)
            break
        case 500:
            console.error(info.error_code + info.internal_server_error, code)
            break
        case 501:
            console.error(info.error_code + info.not_implemented, code)
            break
        case 503:
            console.error(info.error_code + info.service_unavailable, code)
            break
        case 504:
            console.error(info.error_code + info.gateway_time_out, code)
            break
        default:
            console.error(info.error_code + info.not_referenced, code)
            break
    }
}

function handle(bdd, info) {
    var filter_in = bdd.filter_in
    var ldap_login = bdd.ldap_login

    const decipher = crypto.createDecipher(info.crypto_def,info.crypto_message)
    var decrypted = decipher.update(bdd.ldap_password, info.crypto_update, info.crypto_format)
    decrypted += decipher.final(info.crypto_format)

    var ldap_password = decrypted
    if (filter_in != '.') {
        var curb_in = true
    }

    if (method == 'POST') {
        var options = {
            "url": backend,
            "rejectUnauthorized": false,
            "method": method,
            "body": body
        }
    }
    else if (method == 'GET') {
        var options = {
            "url": backend,
            "rejectUnauthorized": false,
            "method": method
            }
    }
    var filter_out = bdd.filter_out
    var env = bdd.env

    var ldap_headers = {
      'x-ibm-client-id': info.client_id_ldap_ppd,
      'x-ibm-client-secret': info.client_secret_ldap_ppd,
      'User-Agent': info.agent,
      'Content-Type': info.app_json,
      'accept': info.app_json
    }
  
    var ldap_options = {
        'url': info.url_ldap_ppd + env,
        'headers': ldap_headers,
        'rejectUnauthorized': false, // if true: server certificate will be verified
        'method': 'POST',
        'body': '{"ldap_user": "' + ldap_login + '","ldap_password": "' + ldap_password + '"}'     
    }
    request(ldap_options, function(error, response, result){
        if ((!error && response.statusCode) == 200) {
            var string = result
            var result = string.replace(/"|{|}/g,'')
            var res = result.split(':')
            var auth_token = res[1]
            var headers = {
                'User-Agent': info.agent,
                'Content-Type': info.app_json,
                'Auth-Token': auth_token,
                'accept': info.app_json
            }
            options.headers = headers
            server = http.createServer(function(req, res){
                request(options, function(error, response, body){
                    if ((!error && response.statusCode) == 200) {
                        try {
                            jq.run(filter_out, response.body, {input: info.string})
                            .then((output) => {
                                res.write(output)
                                res.end();
                            })
                            .catch((error) => {
                                console.error(info.error_jq, filter_out)
                            })
                        }
                        catch (error) {
                            console.error(info.error_jq, filter_out)
                        }
                    }
                    else {
                        console.error(info.error_request, backend)
                        handleRequestError(response.statusCode, info)
                    }
                });
            })
            server.listen(port)
        }
        else {
            console.error(info.error_ldap)
            handleRequestError(response.statusCode, info)
        }
    })
}

var mongo_url = info.db_url

MongoClient.connect(mongo_url, function(err, db) {
    var base = db.db(info.db_name)
    var query = {clientId: client_id}
    base.collection(info.db_collection).find((query), { projection: { _id: 0 } }).toArray(function(error, result) {
        if (error) throw error
        handle(result[0], info)
    });
    db.close()
});