
// import * as functions from 'firebase-functions';

// // Express
// import * as express from 'express';
// import * as cors from 'cors';
// // import * as fb from "../services/dbfs";

// // const fetch = require('node-fetch');
// import * as admin from 'firebase-admin';


// const db = admin.database();


// const app = express();
// app.use(cors({ origin: true }));

// const fireRoutePARClientes = "mpPAR/";

// app.route('/:idMp/test')
//   .post(function (req, res, next) {
//     console.log("LLEGA");
//     console.log(req.body);
//     res.status(200).end('{"data":"ok"}');
//   });

// app.route('/:idMp')
//   .post(function (req, res, next) {

//     console.log("LLEGA");
//     console.log(req.body);
//     res.status(200).end('{"data":"ok"}');
//     const idMP = req.params.idMP;
//     console.log("responde ok a MP. webhook MP " + idMP);

//     let bodyString = JSON.stringify(req.body);

//     let event = JSON.parse(bodyString);
//     //console.log("paso data");
//     //console.log(event);
//     if (event.topic == null || event.topic === "merchant_order" || event.topic === "test") {
//       //no es algo que esperabamos, no hacemos nada pq ya enviamos un mail
//       console.log("IF topic " + event.topic);
//     } else {
//       console.log("ELSE topic " + event.topic);
//       //start else es payment
//       //leer de fb la mac y el token
//       let ref = db.ref(fireRoutePARClientes + idMP + "/");
//       ref.once("value", function (snapshot) {
//         let cliente = snapshot.val();
//         console.log("cliente", JSON.stringify(cliente));


//         if (cliente != null) {


//           //start cliente != null
//           var refAProcesar = db.ref("aProcesar/" + idMP + req.query.topic + req.query.id);
//           var jsonAproc = {
//             "cliente": cliente,
//             "idMP": idMP,
//             "reque": {
//               "body": req.body,
//               "query": req.query
//             }
//           };
//           refAProcesar.set(jsonAproc, function (error) {
//             if (error) {
//               console.error(new Date().toISOString() + " A procesar Data could not be saved." + error);
//             } else {
//               console.log("A procesar Data saved successfully.");
//             }

//           });

//         } else {
//           console.error(new Date().toISOString() + " ERROR Cliente Null pagosRouter.js " + idMP);
//           //nos mandamos un mail
//         }
//       });


//     }
//   });

// export const mpipn = functions.https.onRequest(app);










// var mercadopago = require('mercadopago');
// var nodemailer = require('nodemailer');
// var datetime = require('node-datetime');

// var db = admin.database();



// var mailOptions2 = {
//   from: 'hola2@popapp.io',
//   to: 'kolomarin2@gmail.com, germanmarin888@gmail.com,jcorona@popappresto.com,popappresto@gmail.com',
//   subject: 'PopApp -- Mercado Pago',
//   text: 'Éxito'
// }



// var transporter2 = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'hola2@popapp.io',
//     pass: 'tally2015'
//   }
// });

// var fireRoutePagos = "mpPagPos/";
// var fireRoutePARClientes = "mpPAR/";
// var fireRouteOtros = "mpOtros/";
// var fireRoutePagosActivos = "PARmp/";
// const fireRouteCuentas = "cuentas/";
// //var mpids = require("./routes/mpids.json");

// var escuchar = true;

// //TODO: descomentar antes de hacer deploy
// const aProcesar = "aProcesar";
// //TODO: comentar antes de hacer deploy const aProcesar = "aProcesarPrueba";

// function escucha() {
//   console.log("por escuchar");
//   var ref = db.ref(aProcesar);

//   ref.on("child_added", function (snapshot) {
//     if (escuchar) {
//       escuchar = false;

//       //console.log("escuchando...");
//       var newAProcesar = snapshot.val();
//       var key = snapshot.key;
//       console.log("Termina de escuchar", key);
//       ref.off();

//       var cliente = newAProcesar.cliente;
//       var req = newAProcesar.reque;
//       var idMP = newAProcesar.idMP;

//       try {
//         mercadopago.configure({
//           access_token: cliente.tok
//         });
//       } catch (error) {
//         console.error(new Date().toISOString() + " error mercadopago.configure Procesador.app.js catch", error);
//       }




//       //revisar si es payment y si el external_reference == 909499 //popapp
//       let linea = 0;
//       mercadopago.ipn.manage(req).then(function (res) {
//         linea = 1;
//         //start ipn
//         //var extRef = res.body.collection.external_reference;
//         //if (extRef == "909499" || extRef.startsWith("16948")) {//16948 == IDPAR
//         if (res.body && res.body.external_reference &&
//           (res.body.external_reference.startsWith("16948") || res.body.external_reference.includes("PagoPopApp"))) {
//           linea = 2;


//           //una orden de ongoing
//           var extRef = res.body.external_reference;
//           var idCuenta = "";
//           var fechaNueva = "";
//           var meses = "null";
//           if (extRef.includes("PagoPopApp")) {
//             var indexPopApp = extRef.indexOf("PagoPopApp");
//             if (indexPopApp != -1) {
//               idCuenta = extRef.substring(0, indexPopApp);
//               fechaNueva = extRef.replace(idCuenta + "PagoPopApp", "");

//               if (fechaNueva.includes("mesess")) {
//                 var indexMeses = fechaNueva.indexOf("mesess");
//                 if (indexMeses != -1) {
//                   var solofechaNueva = fechaNueva.substring(0, indexMeses);
//                   meses = +fechaNueva.replace(solofechaNueva + "mesess", "");
//                   fechaNueva = solofechaNueva;
//                 }
//               }
//               console.log({ idCuenta, fechaNueva, meses });
//             }
//           } else {
//             extRef = extRef.replace("16948", "");
//           }
//           linea = 3;

//           //}else{
//           //sino es de popapp 2x1 
//           //} 
//           var indexM4CK = extRef.indexOf("M4CK");
//           var m4CK = cliente.mac;
//           if (indexM4CK == -1) {
//             //no se encontro

//           } else {
//             //se encontro
//             m4CK = extRef.substring(indexM4CK + 4, extRef.length);
//           }
//           linea = 4;

//           console.log("mac " + m4CK);

//           //mandamos el mail a los correspondientes
//           var cuerpo = JSON.stringify(res);
//           var stringMails = cliente.mails[0];
//           for (i = 1; i < cliente.mails.length; i++) {
//             stringMails += ", " + cliente.mails[i];
//           }
//           var pagoAprobado = false;
//           var status = cliente.nombre + " Pago NO APROBADO";
//           if (res.body.status == "approved") {
//             status = cliente.nombre + " Pago Aprobado";
//             pagoAprobado = true;
//           } else {
//             status += " " + res.body.status;
//           }
//           status += " $" + res.body.transaction_details.total_paid_amount;
//           var dt = datetime.create(res.body.date_approved);
//           dt.offsetInHours(-3);
//           var formattedDate = dt.format('d/m/Y H:M');
//           // 04/30/15 09:52
//           status += " " + formattedDate;
//           linea = 5;

//           var neto = "Neto Recibido: $" + res.body.transaction_details.net_received_amount;
//           var stringTextoMailExito = status + "\n" + neto + "\n" + res.body.description + "\n" + res.body.payer.first_name + " " + res.body.payer.last_name + "\n" + res.body.payer.email + "\nNueva Fecha: " + fechaNueva;
//           var stringTextoHTML = "<h3>" + status + "</h3>\n<p>" + neto + "</p>\n<p>" + res.body.description + "</p>\n<p>" + res.body.payer.first_name + " " + res.body.payer.last_name + "</p>\n<p>" + res.body.payer.email + "</p>\n<h3>" + fechaNueva + "</h3>";
//           var mailOptions3 = {
//             from: '"PopApp - Mercado Pago"<hola2@popapp.io>',
//             to: stringMails,
//             //bcc: "jcorona@popapp.io, germanmarin888@gmail.com, popappresto@gmail.com, cmarin@popapp.io",
//             subject: status,
//             text: stringTextoMailExito,
//             html: stringTextoHTML
//           }

//           let objEmailAMandar = {
//             //bcc: mailOptions3.bcc,
//             to: mailOptions3.to,
//             message: {
//               subject: mailOptions3.subject,
//               text: mailOptions3.text,
//               html: mailOptions3.html,
//             }
//           };

//           if (m4CK != null) {

//           } else {
//             firestore.collection('mail').add(objEmailAMandar).then(() => {
//               console.log('Queued email for delivery!');

//             }).catch(e => {
//               console.error(new Date().toISOString() + " fallo enviador email Procesador.app.js firestore ", e);
//               var transporter3 = nodemailer.createTransport({
//                 service: 'gmail',
//                 auth: {
//                   user: 'hola2@popapp.io',
//                   pass: 'tally2015'
//                 }
//               });
//               linea = 6;

//               transporter3.sendMail(mailOptions3, function (errorMail, info) {
//                 linea = 7;

//                 if (errorMail) {
//                   console.error(new Date().toISOString() + " No se pudo enviar email ni por transporter Procesador.app.js" + errorMail);
//                 } else {
//                   console.log('Email sent: exito MP');
//                 }
//               });

//             });
//           }



//           //si la mac es !=0 tiene popapp por lo tanto guardamos el mensaje
//           if (m4CK != null) {
//             var ref1 = db.ref(fireRoutePagos + m4CK + "," + idMP + "/" + res.id);
//             var ref2 = db.ref(fireRoutePagosActivos + m4CK + "/pendiente/" + res.id);
//             ref1.set(res, function (err) {
//               linea = 8;

//               if (res.body.status == "approved") {
//                 ref2.set(false, function (error) {
//                   console.log("Pago aprobado grabado con exito");
//                   if (idCuenta.length > 3 && fechaNueva.length == 10) {//15/02/2018 x ej
//                     //es un pago de licencia de popapp por lo tanto tenemos q revisar el pago
//                     leeYActualizaCuenta(key, idCuenta, fechaNueva, res.body.date_approved, meses, objEmailAMandar, res.body.transaction_details.net_received_amount);
//                   } else {
//                     exiteando(key);
//                   }

//                 });
//               } else {
//                 linea = 9;

//                 console.log("Pago no aprobado grabado con exito");
//                 exiteando(key);

//               }
//             });
//           } else {
//             linea = 10;

//             var refPago = db.ref(fireRoutePagos + 0 + "," + idMP + "/" + res.id);
//             refPago.set(res, function (error) {
//               linea = 11;

//               if (error) {
//                 console.error(new Date().toISOString() + " ERROR Data could not be saved.(Evento que no es popapp)\n" + error);
//                 //nos mandamos un mail




//                 mailOptions2.subject = "ERROR Data could not be saved.(Evento que no es de popapp)";
//                 mailOptions2.text = error;


//                 firestore.collection('mail').add({
//                   //bcc: mailOptions.bcc,
//                   to: mailOptions2.to,
//                   message: {
//                     subject: mailOptions2.subject + ' FB',
//                     text: mailOptions2.text
//                     // html: mailOptions.html,
//                   }
//                 }).then(() => {
//                   console.log('Queued email for delivery!');
//                   exiteando(key);
//                 }).catch(e => {
//                   console.error(new Date().toISOString() + " no se pudo enviar email firestore desde Procesador.app.js", e);
//                   transporter2.sendMail(mailOptions2, function (errorMail, info) {
//                     if (errorMail) {
//                       console.error(new Date().toISOString() + " ni desde transporter", errorMail);
//                     } else {
//                       console.log('Email sent: ' + info.response);
//                     }
//                     exiteando(key);
//                   });
//                 });



//               } else {
//                 linea = 12;

//                 console.log("Data saved successfully.(Pago de un cliente q no tiene popapp)");
//                 exiteando(key);


//               }
//             });
//           }



//           //end if(res.body.collection.external_reference == "909499"){
//         } else {
//           linea = 13;

//           //no es de popapp
//           var ref = db.ref(fireRouteOtros + idMP + "/" + res.topic + "/" + res.id);
//           linea = 14;

//           ref.set(res, function (error) {
//             linea = 15;

//             if (error) {
//               linea = 16;

//               console.error(new Date().toISOString() + " ERROR Data could not be saved.(Evento que no es popapp)\n" + error);
//               //nos mandamos un mail
//               mailOptions2.subject = "ERROR Data could not be saved.(Evento que no es de popapp)";
//               mailOptions2.text = error;


//               firestore.collection('mail').add({
//                 //bcc: mailOptions.bcc,
//                 to: mailOptions2.to,
//                 message: {
//                   subject: mailOptions2.subject + ' FB',
//                   text: mailOptions2.text
//                   // html: mailOptions.html,
//                 }
//               }).then(() => {
//                 console.log('Queued email for delivery!');
//                 exiteando(key);

//               }).catch(e => {
//                 console.error(new Date().toISOString() + " no se envio mail firestore de Procesador.app.js", e);
//                 transporter2.sendMail(mailOptions2, function (errorMail, info) {
//                   linea = 17;

//                   if (errorMail) {
//                     console.error(new Date().toISOString() + " ni desde transporter", errorMail);
//                   } else {
//                     console.log('Email sent: ' + info.response);
//                   }
//                   exiteando(key);

//                 });
//               });

//             } else {
//               console.log("Data saved successfully.(Evento que no es de popapp)");
//               exiteando(key);

//             }

//           });
//         }
//       }).catch(errorio => {
//         console.error(new Date().toISOString() + " error catch mp procesador.app.js", errorio);

//         let errormsg = {};
//         if (errorio) {
//           errormsg.name = errorio.name;
//           errormsg.message = errorio.message;
//           errormsg.cause = errorio.cause;
//           errormsg.status = errorio.status;
//         }

//         let errorAdmin = {
//           emailsDeReporte: "gmarin@popapp.io",
//           error: errormsg,
//           descripcion: "catch exception MP",
//           fecha: admin.database.ServerValue.TIMESTAMP,
//           idFb: null,
//           idLocal: key,
//           nombre: "error catch mp",
//           prioridad: 5,
//           sistema: "Node MP",
//           sisClase: "Procesador app.js",
//           sisMetodo: "escucha(), ref.on. catch() " + linea,
//           solucionado: false,
//           tipo: 1,
//           version: "1.0.0"
//         };
//         mandarEmailError(errorAdmin);
//         exiteando(key);
//       });
//     }

//   });
// }

// const STRINGerrores = "errores";

// function mandarEmailError(error) {
//   //let ref = db.ref(STRINGerrores).push();
//   //error.idFb = ref.key;
//   ////new ErrorAdmin(["gmarin@popapp.io"], error, "error en iniciaProcesodeConfigGlobal()", admin.database.ServerValue.TIMESTAMP, null, null, "iniciaProcesodeConfigGlobal", 5, "glcNodePYa", "index.js", "iniciaProcesodeConfigGlobal()", false, 1, VERSION));
//   //ref.set(error, function (error) {
//   //  if (error)
//   //    mandarEmail(error, "No se pudo grabar en firebase");
//   //});
//   if (error.emailsDeReporte) {
//     mandarEmail(error, null);
//   }
// }

// function mandarEmail(error, asunto) {

//   let mailOptions = {
//     from: '"popappErrores"<hola2@popapp.io>',
//     text: JSON.stringify(error)
//   };

//   if (asunto) {
//     mailOptions.subject = asunto;
//     mailOptions.to = "gmarin@popapp.io, cmarin@popapp.io, pmarin@popapp.io";
//   } else {
//     mailOptions.to = error.emailsDeReporte;
//     mailOptions.subject = error.sistema + " " + error.descripcion;
//   }

//   firestore.collection('mail').add({
//     //bcc: mailOptions.bcc,
//     to: mailOptions.to,
//     message: {
//       subject: mailOptions.subject + ' FB',
//       text: mailOptions.text
//       // html: mailOptions.html,
//     }
//   }).then(() => {
//     console.log('Queued email for delivery!');

//   }).catch(e => {
//     console.error(new Date().toISOString() + " error al intentar enviar email desde firestore procesador.app.js", e);
//     try {
//       var transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           user: 'hola2@popapp.io',
//           pass: 'tally2015'
//         }
//       });

//       transporter.sendMail(mailOptions, function (errorMail, info) {
//         if (errorMail) {
//           console.error(new Date().toISOString() + " y desde transporter ", errorMail);
//         } else {
//           console.log('Email sent');
//         }
//       });
//     } catch (errr) {
//       console.error(new Date().toISOString() + " catch en mandar email procesador.app.js", errr);
//     }
//   });


// }

// function exiteando(key) {
//   console.log("Por cerrar el servicio" + key);
//   var refAProcesar = db.ref(aProcesar + "/" + key);

//   refAProcesar.set(null, function (error) {
//     if (error) {
//       console.error(new Date().toISOString() + " No se pudo borrar la key exiteando" + error);
//     } else {
//       console.log("Key borrada");
//     }
//     setTimeout(function () { process.exit(1); }, 3000);

//   });
//   escuchar = true;
// }

// var entroAProcesar = false;

// function fechaEnMilis(dateddMMYY) {
//   try {
//     if (dateddMMYY) {
//       let arre = dateddMMYY.split("/");
//       let date = new Date();
//       date.setFullYear(+arre[2]);
//       date.setMonth(((+arre[1]) - 1));
//       date.setDate((+arre[0]));

//       return date.getTime();
//     }
//     return 0;
//   } catch (e) {
//     console.error("error al parsear fecha en el pago ", dateddMMYY);
//     return 0;
//   }
// }

// function leeYActualizaCuenta(key, idCuenta, fechaNueva, date_approved, meses, objEmailAMandar, pagoNeto) {

//   var ref3 = db.ref(fireRouteCuentas + idCuenta);
//   //leer la cuenta 
//   ref3.once("value", function (snapshot) {
//     if (!entroAProcesar) {
//       entroAProcesar = true;
//       var cuentaAdmin = snapshot.val();
//       var locales = cuentaAdmin['locales'];
//       var nombreCuenta = cuentaAdmin['nombreCuenta'];
//       var localesADM = [];
//       var mapUpdates = {};
//       let fechaNuevaMillis = fechaEnMilis(fechaNueva);

//       let paisGlobal;
//       let ivaGlobal;
//       if (locales) {
//         //comnprobar el importe no lo estamos haciendo

//         mapUpdates["ultimoPago/"] = fechaNueva;
//         var fechaUltimoPago = fechaNueva;
//         if (date_approved && date_approved.length > 9) {
//           var fechaUltimoPago = date_approved.substring(8, 10) + "/" + date_approved.substring(5, 7) + "/" + date_approved.substring(0, 4);
//         }
//         var date = new Date();
//         var fechaa = date.getFullYear() + ";" + (+date.getMonth() + 1) + ";" + date.getDate() + ";" + (+date.getHours() - 3) + ";" + date.getMinutes() + ";" + date.getSeconds() + "/";
//         const fechaISO = date.toISOString();
//         for (var keyLocal in locales) {
//           var local = locales[keyLocal];
//           var servidoresADM = [];
//           for (var keyServ in local.servidores) {
//             var servidor = local.servidores[keyServ];
//             if (servidor.showPagar && servidor.numeroLocal && +servidor.numeroLocal > 0 && servidor.importe && servidor.moneda && servidor.pagoHasta) {
//               let fechaPHastaMillis;
//               if (servidor.vencimiento) {
//                 fechaPHastaMillis = fechaEnMilis(servidor.vencimiento);
//               } else {
//                 fechaPHastaMillis = fechaEnMilis(servidor.pagoHasta);
//               }
//               if (fechaNuevaMillis > fechaPHastaMillis) {
//                 if (servidor.pagoHasta)
//                   servidoresADM.push(servidor);
//                 if (servidor.cuotasPendientes && servidor.cuotasPendientes > 0 && meses && meses > 0) {
//                   if (servidor.pagoHasta != fechaNueva) {
//                     if (meses == 10) {
//                       //son 12 en realidad
//                       mapUpdates["locales/" + keyLocal + "/servidores/" + keyServ + "/cuotasPendientes/"] = servidor.cuotasPendientes - 12;
//                     } else {
//                       mapUpdates["locales/" + keyLocal + "/servidores/" + keyServ + "/cuotasPendientes/"] = servidor.cuotasPendientes - meses;
//                     }
//                   }
//                 }

//                 let importeConceptos = servidor.importe;
//                 let importeQDeberiaConceptos = servidor.importeQDeberia ? servidor.importeQDeberia : servidor.importe;
//                 let cambioImporte = false;
//                 paisGlobal = servidor.pais;
//                 ivaGlobal = servidor.pagaIva;
//                 if (servidor.conceptos) {
//                   for (let keyConc in servidor.conceptos) {
//                     let concepto = servidor.conceptos[keyConc];
//                     if (concepto.cuotasPendientes && concepto.cuotasPendientes > 0) {
//                       let nuevasCuotas = concepto.cuotasPendientes - meses;
//                       if (nuevasCuotas <= 0) {
//                         nuevasCuotas = -1;
//                         importeConceptos -= concepto.importe;
//                         importeQDeberiaConceptos -= concepto.importe;
//                         cambioImporte = true;
//                       }
//                       mapUpdates["locales/" + keyLocal + "/servidores/" + keyServ + "/conceptos/" + keyConc + "/cuotasPendientes"] = nuevasCuotas;
//                     }
//                   }
//                 }

//                 if (cambioImporte) {
//                   mapUpdates["locales/" + keyLocal + "/servidores/" + keyServ + "/importe"] = importeConceptos;
//                   mapUpdates["locales/" + keyLocal + "/servidores/" + keyServ + "/importeQDeberia"] = importeQDeberiaConceptos;
//                 }

//                 if (servidor.cuotasPendientes != null && (servidor.cuotasPendientes == 0 || servidor.cuotasPendientes <= meses)) {
//                   mapUpdates["locales/" + keyLocal + "/servidores/" + keyServ + "/showPagar/"] = false;
//                   mapUpdates["locales/" + keyLocal + "/servidores/" + keyServ + "/numeroLocal/"] = "-5";
//                 }
//                 mapUpdates["locales/" + keyLocal + "/servidores/" + keyServ + "/pagoHasta/"] = fechaNueva;
//                 mapUpdates["locales/" + keyLocal + "/servidores/" + keyServ + "/vencimiento/"] = fechaNueva;
//                 mapUpdates["locales/" + keyLocal + "/servidores/" + keyServ + "/fechaUltimoPago/"] = fechaUltimoPago;
//                 mapUpdates["locales/" + keyLocal + "/servidores/" + keyServ + "/cobros/" + fechaa + "fecha"] = fechaUltimoPago;
//                 mapUpdates["locales/" + keyLocal + "/servidores/" + keyServ + "/cobros/" + fechaa + "tipoPago"] = "Mercado Pago";
//                 mapUpdates["locales/" + keyLocal + "/servidores/" + keyServ + "/cobros/" + fechaa + "moneda"] = servidor.moneda;
//                 mapUpdates["locales/" + keyLocal + "/servidores/" + keyServ + "/cobros/" + fechaa + "importe"] = servidor.importe;
//                 if (servidor.pagaIva) {
//                   mapUpdates["locales/" + keyLocal + "/servidores/" + keyServ + "/cobros/" + fechaa + "iva"] = servidor.pagaIva;
//                 }
//                 mapUpdates["locales/" + keyLocal + "/servidores/" + keyServ + "/cobros/" + fechaa + "cantMeses"] = meses;
//                 mapUpdates["locales/" + keyLocal + "/servidores/" + keyServ + "/cobros/" + fechaa + "nuevoVencimiento"] = fechaNueva;
//               }

//             }
//           }
//           if (servidoresADM.length > 0) {
//             local.servidores = servidoresADM;
//             localesADM.push(local);
//           }
//         }

//         if (localesADM.length > 0) {
//           //escribir en los servidores
//           ref3.update(mapUpdates, async function (error) {
//             if (error) {
//               console.error(new Date().toISOString() + " No se pudo grabar la nuevaFecha" + idCuenta + "--" + fechaNueva, error);
//               firestore.collection('mail').add({
//                 //bcc: mailOptions.bcc,
//                 to: "gmarin@popapp.io, cmarin@popapp.io, pmarin@popapp.io",
//                 message: {
//                   subject: "NO se grabó la nuevaFecha en " + nombreCuenta + ", " + idCuenta + "--" + fechaNueva + " FB",
//                   text: "NO se actualizo la nueva Fecha en los servidores pagados"
//                   // html: mailOptions.html,
//                 }
//               }).then(() => {
//                 console.log('Queued email for delivery!');
//                 exiteando(key);

//               }).catch(e => {
//                 console.error(new Date().toISOString() + " catch en ref3 al intentar enviar email procesador.app.js", e);

//                 var mailOptions = {
//                   from: '"popapp"<hola2@popapp.io>',
//                   to: "gmarin@popapp.io, cmarin@popapp.io, pmarin@popapp.io",
//                   subject: "NO se grabó la nuevaFecha en " + nombreCuenta + ", " + idCuenta + "--" + fechaNueva,
//                   text: "NO se actualizo la nueva Fecha en los servidores pagados",
//                 }

//                 var transporter = nodemailer.createTransport({
//                   service: 'gmail',
//                   auth: {
//                     user: 'hola2@popapp.io',
//                     pass: 'tally2015'
//                   }
//                 });

//                 transporter.sendMail(mailOptions, function (errorMail, info) {
//                   if (errorMail) {
//                     console.error(new Date().toISOString() + " y desde transporter Error al enviar Email de confirmacion escritura nueva fecha", errorMail);
//                   } else {
//                     console.log('Email sent: confirmacion escritura nueva fecha');
//                   }
//                   exiteando(key);
//                 });
//               });
//             } else {
//               firestore.collection('mail').add(objEmailAMandar);
//               console.log("Se grabó la nuevaFecha" + idCuenta + "--" + fechaNueva);


//               const objetoPago = {
//                 asunto: objEmailAMandar.message.subject ? objEmailAMandar.message.subject : "",
//                 cantMeses: meses,
//                 fecha: fechaISO,
//                 idCuenta: idCuenta,
//                 idFactura: null,
//                 importe: pagoNeto,
//                 iva: ivaGlobal ? ivaGlobal : 0,
//                 nuevoVencimiento: fechaNueva,
//                 pais: paisGlobal ? paisGlobal : "",
//                 text: objEmailAMandar.message.text ? objEmailAMandar.message.text : "",
//                 tipo: "Mercado Pago",
//                 to: objEmailAMandar.to ? objEmailAMandar.to : "",
//               }
//               firestore.collection("cuentas/" + idCuenta + "/pagos").add(objetoPago);


//               exiteando(key);
//             }
//           });
//         } else {
//           console.error(new Date().toISOString() + "No tiene servidores aptos, por eso NO se grabó la nuevaFecha" + idCuenta + "--" + fechaNueva);
//           //firestore.collection('mail').add({
//           //  //bcc: mailOptions.bcc,
//           //  to: "gmarin@popapp.io, cmarin@popapp.io, pmarin@popapp.io",
//           //  message: {
//           //    subject: "No tiene servidores aptos, por eso NO se grabó la nuevaFecha" + idCuenta + "--" + fechaNueva + " FB",
//           //    text: "NO se actualizo la nueva Fecha en los servidores pagados"
//           //    // html: mailOptions.html,
//           //  }
//           //}).then(() => {
//           //  console.log('Queued email for delivery!');
//           exiteando(key);
//           //}).catch(e => {
//           //  exiteando(key);
//           //});
//         }
//       } else {
//         //no tiene locales
//         console.error(new Date().toISOString() + " asd No tiene locales, por eso NO se grabó la nuevaFecha" + idCuenta + "--" + fechaNueva);

//         firestore.collection('mail').add({
//           //bcc: mailOptions.bcc,
//           to: "gmarin@popapp.io, cmarin@popapp.io, pmarin@popapp.io",
//           message: {
//             subject: "No tiene locales, por eso NO se grabó la nuevaFecha" + idCuenta + "--" + fechaNueva + " FB",
//             text: "NO se actualizo la nueva Fecha en los servidores pagados"
//             // html: mailOptions.html,
//           }
//         }).then(() => {
//           console.log('Queued email for delivery!');
//           exiteando(key);
//         }).catch(e => {
//           exiteando(key);
//         });

//       }
//     }
//   });
// }


