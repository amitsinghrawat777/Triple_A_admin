/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

// Function to set admin claim
exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  // Check if the request is made by an existing admin
  if (context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can add other admins.'
    );
  }

  const { email } = data;
  if (!email) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email is required.'
    );
  }

  try {
    // Get the user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set admin claim
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true
    });

    return {
      success: true,
      message: `Successfully set admin claim for ${email}`
    };
  } catch (error) {
    throw new functions.https.HttpsError(
      'internal',
      'Error setting admin claim.'
    );
  }
});

// Function to verify admin status
exports.verifyAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be logged in.'
    );
  }

  try {
    const { uid } = context.auth;
    const user = await admin.auth().getUser(uid);
    const customClaims = user.customClaims || {};

    return {
      isAdmin: !!customClaims.admin
    };
  } catch (error) {
    throw new functions.https.HttpsError(
      'internal',
      'Error verifying admin status.'
    );
  }
});
