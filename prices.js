var fs = require('fs')

var rawdata = fs.readFileSync('external.json');  
var info = JSON.parse(rawdata);

var backend_1 = info.prices.backend_1

var endpoint = process.env.GATEWAY

const sale = info.prices.sale
const purchases = info.prices.purchases
const purchase = info.prices.purchase
const store = info.prices.store
const barcode = info.prices.barcode
const site_ean = info.prices.site_ean
const item = info.prices.item
const logistic_unit = info.prices.logistic_unit
const date = info.prices.date
const site_type = info.prices.site_type

const store_ean_id = info.prices.store_ean_id
const store_anabel_key = info.prices.store_anabel_key
const barcode_id = info.prices.barcode_id
const site_ean_id = info.prices.site_ean_id
const item_id = info.prices.item_id
const logistic_unit_id = info.prices.logistic_unit_id
const date_id = info.prices.date_id
const site_type_id = info.prices.site_type_id

var store_ean_value = ""
var store_anabel_key_value = ""
var barcode_value = ""
var site_ean_value = ""
var item_value = ""
var logistic_unit_value = ""
var date_value = ""
var site_type_value = ""

var enum_back = info.enum_back

i = 0
while (i < enum_back.length) {
    if (endpoint.search(enum_back[i]) > 0) {
        var search = enum_back[i]
    }
    i++
}

if (search == info.prices.name) {
    var base = []
    var base = endpoint.split(search + '/')
    var res = base[1].split('/')
    var i = 0
    var len = res.length
    var cont = ""
    var call = ""
    while (i <= len)
    {
        switch (res[i]) {
            case store:
                if (res[i + 1])
                {
                    if (res[i + 1].length == 4) {
                        cont = cont.concat('/' + store + '/' + store_anabel_key)
                        store_anabel_key_value = res[i + 1]
                        call = call.concat('/' + store + '/' + store_anabel_key_value)
                    }
                    else {
                        cont = cont.concat('/' + store + '/' + store_ean_id)
                        store_ean_value = res[i + 1]
                        call = call.concat('/' + store + '/' + store_ean_value)
                    }
                }
                i++
                break
            case barcode:
                cont = cont.concat('/' + barcode + '/' + barcode_id)
                barcode_value = res[i + 1]
                call = call.concat('/' + barcode + '/' + barcode_value)
                i++
                break
            case site_type:
                cont = cont.concat('/' + site_type + '/' + site_type_id)
                site_type_value = res[i + 1]
                call = call.concat('/' + site_type + '/' + site_type_value)
                i++
                break
            case site_ean:
                cont = cont.concat('/' + site_ean + '/' + site_ean_id)
                site_ean_value = res[i + 1]
                call = call.concat('/' + site_ean + '/' + site_ean_value)
                i++
                break
            case sale:
                call = call.concat('/' + sale)
                break
            case purchase:
                call = call.concat('/'+ purchase)
                break
            case purchases:
                call = call.concat('/'+ purchases)
                break
            case item:
                cont = cont.concat('/' + item + '/' + item_id)
                item_value = res[i + 1]
                call = call.concat('/' + item + '/' + item_value)
                i++
                break
            case logistic_unit:
                cont = cont.concat('/' + logistic_unit + '/' + logistic_unit_id)
                logistic_unit_value = res[i + 1]
                call = call.concat('/' + logistic_unit + '/' + logistic_unit_value)
                i++
                break
            case date:
                cont = cont.concat('/' + date + '/' + date_id)
                date_value = res[i + 1]
                call = call.concat('/' + date + '/' + date_value)
                i++
                break
            default:
                break
        }
        i++
    }

    exports.call = backend_1 + call

}