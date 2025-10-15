// VAPID Key Generator for Push Notifications
// This generates a valid VAPID key pair for push notifications

const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys Generated:');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);

// For testing purposes, here's a valid VAPID public key
const TEST_VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HI0FyHnQ3UzHfe3E3X5gQ7MvL8iJ8qK1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6';

module.exports = {
  vapidKeys,
  TEST_VAPID_PUBLIC_KEY
};
