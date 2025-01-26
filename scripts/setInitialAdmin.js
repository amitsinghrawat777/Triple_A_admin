const admin = require('firebase-admin');
const serviceAccount = require('../triple-a-b8605-firebase-adminsdk-h9m98-242930a831.json');

// Initialize admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const adminEmails = [
  "rawatneha9410549004@gmail.com",
  "rawatamit446@gmail.com"
];

async function setAdminClaims(email) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set admin claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    
    console.log(`Successfully set admin claim for user: ${email}`);
    return true;
  } catch (error) {
    console.error(`Error setting admin claim for ${email}:`, error);
    return false;
  }
}

async function setAllAdmins() {
  try {
    const results = await Promise.all(adminEmails.map(email => setAdminClaims(email)));
    const successCount = results.filter(Boolean).length;
    console.log(`Successfully set admin claims for ${successCount} out of ${adminEmails.length} users`);
  } catch (error) {
    console.error('Error in admin setup:', error);
  } finally {
    process.exit(0);
  }
}

setAllAdmins(); 