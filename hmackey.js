import {Storage} from '@google-cloud/storage';

// Creates a client
const storage = new Storage();

// Replace these with your actual values
const serviceAccountEmail = 'shriyanshikha@gmail.com';
const projectId = 'force-350b2';

// Create HMAC SA Key
async function createHmacKey() {
  try {
    const [hmacKey, secret] = await storage.createHmacKey(serviceAccountEmail, {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    console.log(`The base64 encoded secret is: ${secret}`);
    console.log('Do not miss that secret, there is no API to recover it.');
    console.log('The HMAC key metadata is:');
    for (const [key, value] of Object.entries(hmacKey.metadata)) {
      console.log(`${key}: ${value}`);
    }
  } catch (error) {
    console.error('Error creating HMAC key:', error);
  }
}

// Call the function
createHmacKey();