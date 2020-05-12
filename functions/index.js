const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
//http request 1
exports.signUpUser = functions.https.onCall((request, response) => {
    const name = request.name;
    const email = request.email;
    const psw = request.psw;
    const role = request.role;
    createNewUser(name, email, psw, role, response)
});

// ALTERNATIVA: CREA UTENTE, QUANDO CREATO MANDA INDIETRO UID E ATTIVA ALTRA
// ALTRE FUNCTIONS DA CHIAMARE DA FRONT

function createNewUser(name,email,psw,role,response){
    admin.auth().createUser({
        email: email,
        emailVerified: false,
        password: psw,
        displayName: name,
        disabled: false
    }).then((userRecord) => {
         return addToUsersCol(name, email, role, userRecord.uid, response);
        })
    .catch((error) => {
           return response.send(error);
    });
}

function addToUsersCol(name, email, role, id){
    let db = admin.firestore();
    db.collection('users').doc(id).set({
        name: name,
        email: email,
        role: role
    })
    return addProfToTeaching(db,role,email);
}

function addProfToTeaching(db,role, email){
    if (role === "professor") {
        db.collection("teaching").doc(email).set({})
    }
}