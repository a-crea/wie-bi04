const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
exports.signUpUser = functions.https.onCall((data, context) => {
    const name = data.name;
    const email = data.email;
    const psw = data.psw;
    const role = data.role;
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
                return db.collection("teaching").doc(userRecord.uid).set({
                    students:null
                }).then(() => {
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
    db.collection("teaching").doc(user.uid).delete();
    //delete professor in users->student
    return true;
});