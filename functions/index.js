const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
//http request 1
exports.signUpUser = functions.https.onCall((data, context) => {
    const name = data.name;
    const email = data.email;
    const psw = data.psw;
    const role = data.role;
    // this.createNewUser(name, email, psw, role, response)
    return admin.auth().createUser({
        email: email,
        emailVerified: false,
        password: psw,
        displayName: name,
        disabled: false
    }).then((userRecord) => {
        return db.collection('users').doc(userRecord.uid).set({
            name: name,
            email: email,
            role: role
        }).then(() => {
            if (role === "professor") {
                return db.collection("teaching").doc(email).set({}).then(() => {
                    return { state: true };
                }).catch((error) => {
                    return { error: error };
                })
            } else {
                return { state: true };
            }
        }).catch((error) => {
            return { error: error };
        })
    })
    .catch((error) => {
        return { error: error };
    })
});

exports.userDeleted = functions.auth.user().onDelete(user => {
    db.collection("users").doc(user.uid).delete();
    db.collection("teaching").doc(user.email).delete();
    return true;
});

//     function addToUsersCol(name, email, role, id) {
//         let db = admin.firestore();
//         db.collection('users').doc(id).set({
//             name: name,
//             email: email,
//             role: role
//         })
//         return addProfToTeaching(db, role, email);
//     }
// });

// // ALTERNATIVA: CREA UTENTE, QUANDO CREATO MANDA INDIETRO UID E ATTIVA ALTRA
// // ALTRE FUNCTIONS DA CHIAMARE DA FRONT

// function createNewUser(name,email,psw,role,response){
//     admin.auth().createUser({
//         email: email,
//         emailVerified: false,
//         password: psw,
//         displayName: name,
//         disabled: false
//     }).then((userRecord) => {
//          return addToUsersCol(name, email, role, userRecord.uid, response);
//         })
//     .catch((error) => {
//            return response.send(error);
//     });
// }

// // function addToUsersCol(name, email, role, id){
// //     let db = admin.firestore();
// //     db.collection('users').doc(id).set({
// //         name: name,
// //         email: email,
// //         role: role
// //     })
// //     return addProfToTeaching(db,role,email);
// // }

// function addProfToTeaching(db,role, email){
//     if (role === "professor") {
//         db.collection("teaching").doc(email).set({})
//     }
// }