const functions = require("firebase-functions");
var admin = require("firebase-admin");
admin.initializeApp();
const minutesToSubstract = 1;
var db = admin.database();
var serverValue = admin.database.ServerValue;
var ref = db.ref("MobileDataCenter");
exports.scheduledFunction = functions.pubsub.schedule('every 1 mins').onRun(async (context) => {
    try {
        var serverDate = new Date();
        var timeToCompare = new Date(serverDate.getTime() - (minutesToSubstract * 60000));
        console.log('timeToCompare TimeStamp: ' + timeToCompare.getTime());
        console.log('timeToCompare : ' + timeToCompare);
        ref.once("value", (snap) => {
            console.log("encontrados:", snap.numChildren());
            if (snap.val() !== null || snap.numChildren() >= 1) {
                snap.forEach((data) => {
                    console.log("procesando:", data.key)
                    console.log("data", data.val().iotData.lastUpdated)
                    if (data.val().iotData.lastUpdated < timeToCompare.getTime()) {
                        console.log("Fecha de ultima acualizacion:", new Date(data.val().iotData.lastUpdated))
                        console.log("El tiempo de ultima actualziacion es mayor a 1 minuto?", data.val().iotData.lastUpdated > timeToCompare.getTime())
                        data.ref.update({
                            online: false
                        })
                    } else {
                        console.log("Se encuentra online", data.key)
                    }
                });
            }
        }, (errorObject) => {
            console.log("The read failed: " + errorObject.code);
            throw new Error(errorObject);
        });
    }
    catch (error) {
        console.log(error.message)
    }
    return null;
});
