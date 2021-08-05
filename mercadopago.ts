import * as functions from 'firebase-functions';
// Express
import * as express from 'express';
import * as cors from 'cors';

// import { ItemPOnline, POnline } from '../model/ponline';// POTotal
//import { Item, Order, PaymentDetails } from '../model/order';
import * as _ from "lodash";

import * as dbfs from "../services/dbfs";
import * as dbfb from 'firebase-admin';

const fetch = require('node-fetch');


const Authorization = "Authorization";
// const Basic = "Basic ";
const Bearer = "Bearer ";
// const access_token = "access_token";
/**
 * collector_id los ultimos digitos del token despues del "-"
 */
const collector_id = 'idmercadopago';
const token= "tokenmercadopago";

const ContentTypeAppJson = { 'Content-Type': 'application/json' };

const app = express();
app.use(cors({ origin: true }));

app.post('/crearSuscripcion/:idCuenta', async (req: express.Request, res: express.Response) => {
    const idCuenta = req.params.idCuenta;

    const email = req.body.email;
    const currency = req.body.currency;
    const amount = req.body.amount;
    const startDate = req.body.startDate;
    const reason = req.body.reason;

    try {
        await crearSuscripcion(idCuenta, email, currency, amount, startDate,
            reason, collector_id);
    } catch (e) {
        res.status(500).end();
    }
    res.status(200).end();

});

async function crearSuscripcion(idCuenta: string, email: string, currency: string,
    amount: number, dateStart: string, reason: string, collector_id: number,) {

    let headers: any = ContentTypeAppJson;
    headers[Authorization] = Bearer + token;

    const url = "https://api.mercadopago.com/preapproval";

    const body = {
        auto_recurring: {
            currency_id: currency,
            transaction_amount: amount,
            frequency: 1,
            frequency_type: "months",
            start_date: dateStart,
            //end_date: endDate
        },
        back_url: "https://popapp.io/pagar?i=" + idCuenta,
        collector_id: collector_id,
        external_reference: idCuenta,
        payer_email: email,
        reason: reason,
        status: "pending"
    }
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: headers
    });
    const respuesta = await response.json();
    console.log(respuesta);

    if (respuesta && respuesta.init_point) {
        console.log("INIT POINT", respuesta.init_point);
        let dbFS = dbfs.fsProdOtest("prod");
        let datos = {
            linkSuscription: respuesta.init_point,
            idSuscription: respuesta.id
        }
        await dbFS.doc("cuentas/" + idCuenta).set(datos, { merge: true });
        await dbFS.doc("cuentas/" + idCuenta + "/suscripciones/" + respuesta.id).set(respuesta);
        await dbfb.database().ref('cuentas/' + idCuenta).update(datos);
    }
}

// const suscripcion = {
//     id: '2c9380847ac5c717017af292ae17214f',
//     payer_id: 798453063,
//     payer_email: 'test_user_48867017@testuser.com',
//     back_url: 'https://www.mercadopago.com.ar/',
//     collector_id: 798451297,
//     application_id: 6693757095065815,
//     status: 'pending',
//     reason: 'Suscripción Popapp Panchos Australia',
//     external_reference: 'falso',
//     date_created: '2021-07-29T10:02:16.981-04:00',
//     last_modified: '2021-07-29T10:02:16.983-04:00',
//     init_point: 'https://www.mercadopago.com/mla/debits/new?preapproval_id=2c9380847ac5c717017af292ae17214f',
//     sandbox_init_point: 'https://sandbox.mercadopago.com/mla/debits/new?preapproval_id=2c9380847ac5c717017af292ae17214f',
//     auto_recurring: {
//         frequency: 1,
//         frequency_type: 'months',
//         transaction_amount: 1100,
//         currency_id: 'ARS'
//     },
//     payment_method_id: null
// }
// getSuscripcion(suscripcion);

// async function getSuscripcion(suscripcion: any) {
//     const token = "TEST-6693757095065815-041616-42ce7f1cef2981965651f2cd3185d566-349798089";
//     let headers: any = ContentTypeAppJson;
//     headers[Authorization] = Bearer + token;
//     // const url = "https://api.mercadopago.com/preapproval/search?status=paused&payer_email=john@yourdomain.com";
//     const url = "https://api.mercadopago.com/preapproval/" + "889a468bd32c4f32b576ae7ddf60cd61";
//     const response = await fetch(url, {
//         method: 'GET',
//     });
//     const respuesta = await response.json();
//     console.log(respuesta);
// }

// Editar monto suscripcion
// To edit the card, you must indicate the new token in the card_token_id attribute. And to update the amount, 
// send the new amount through auto_recurring.transaction_amount and specify again the auto_recurring.currency_id.

app.put('/modificarSuscripcion/precio/:idSuscripcion', async (req: express.Request, res: express.Response) => {
    const idSuscripcion = req.params.idSuscripcion;
    
    const newPrice = req.body.newPrice;
    const currency = req.body.currency;
    const PREAPPROVAL_ID = req.body.PREAPPROVAL_ID;
    try {
        await modificarPrecioSuscripcion(idSuscripcion, PREAPPROVAL_ID, newPrice, currency);
    } catch (e) {
        res.status(500).end("Ok");
    }
    res.status(200).end("Ok");
});

async function modificarPrecioSuscripcion(idSuscripcion: string, PREAPPROVAL_ID:string, newPrice: number, currency: string) {

    //     curl--location--request PUT 'https://api.mercadopago.com/preapproval/<PREAPPROVAL_ID>' \
    //     --header 'Content-Type: application/json' \
    //     --header 'Authorization: Bearer ENV_ACCESS_TOKEN' \
    //     --data - raw '{
    //     "application_id": 1234567812345678,
    //         "auto_recurring": {
    //         "currency_id": "[FAKER][CURRENCY][ACRONYM]",
    //             "transaction_amount": 100
    //     },
    // } '
    const ENV_ACCESS_TOKEN = token;
    let headers: any = ContentTypeAppJson;
    headers[Authorization] = Bearer + ENV_ACCESS_TOKEN;

    const url = 'https://api.mercadopago.com/preapproval/' + PREAPPROVAL_ID;
    const body = {
        "application_id": idSuscripcion,
        "auto_recurring": {
            "currency_id": currency,
            "transaction_amount": newPrice
        }
    }
    const response = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: headers
    });
    const respuesta = await response.json();
    console.log(respuesta);
    if (respuesta) {
        console.log("NUEVOPRECIO", respuesta);
    }
}

// Cancelar suscripcion
app.put('/cancelarSuscripcion/:PREAPPROVAL_ID', async (req: express.Request, res: express.Response) => {
    const PREAPPROVAL_ID = req.params.PREAPPROVAL_ID;
    try {
        await cancelarSuscripcion(PREAPPROVAL_ID);
    } catch (e) {
        res.status(500).end("Ok");
    }
    res.status(200).end("Ok");
});

async function cancelarSuscripcion(PREAPPROVAL_ID: string) {

    // curl --location --request PUT 'https://api.mercadopago.com/preapproval/<PREAPPROVAL_ID>' \
    // --header 'Content-Type: application/json' \
    // --header 'Authorization: Bearer ENV_ACCESS_TOKEN' \
    // --data-raw '{
    //   "status": "cancelled"
    // }'
    const ENV_ACCESS_TOKEN = token;
    let headers: any = ContentTypeAppJson;
    headers[Authorization] = Bearer + ENV_ACCESS_TOKEN;

    const url = 'https://api.mercadopago.com/preapproval/'+ PREAPPROVAL_ID;
    const body = {
        "status": "cancelled"
    }
    const response = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: headers
    });
    const respuesta = await response.json();
    console.log(respuesta);
    if (respuesta) {
        console.log("CANCELARSUSCRIPCION", respuesta.init_point);
    }
}
// cancelarSuscripcion('2c9380847ac5c717017b076491af2e74');

export const mercadopago = functions.https.onRequest(app);
