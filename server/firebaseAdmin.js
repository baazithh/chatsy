const admin = require('firebase-admin');

try {
  // To use this, you must set the GOOGLE_APPLICATION_CREDENTIALS environment variable
  // to the path of your Firebase service account JSON file.
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
  console.log("Firebase Admin Initialized");
} catch (error) {
  console.warn("Firebase Admin Initialization missing credentials. Please set GOOGLE_APPLICATION_CREDENTIALS.");
}

module.exports = admin;
