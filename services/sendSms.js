require('dotenv').config();
const accountSid = process.env.ACCOUNT_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.AUTH_TOKEN; // Your Auth Token from www.twilio.com/console

const { CronJob } = require('cron');
const twilio = require('twilio');
const Medication = require('../models/Medication');
const client = new twilio(accountSid, authToken);

// client.messages
//   .create({
//     body: 'Hello from Node',
//     to: '+919991823349', // Text this number
//     from: '+18048892908', // From a valid Twilio number
//   })
//   .then((message) => console.log('hi', message.sid));

// const numbers = ['+919991823349'];

// new CronJob(
//   '26 18 * * *',
//   function () {
//     for (let i = 0; i < numbers.length; i++) {
//       client.messages
//         .create({
//           to: numbers[i],
//           from: '+18048892908',
//           body: 'Hello! Hope you’re having a good day.',
//         })
//         .then((message) => console.log(message.sid));
//     }
//   },
//   null,
//   true
// );

Medication.find({}).then((data) => {
  data.forEach((medication) => {
    if (medication.cronValue && medication.cronValue.length > 0) {
      console.log('med!', medication);
      new CronJob(
        medication.cronValue,
        function () {
          client.messages
            .create({
              to: medication.phone,
              from: '+18048892908',
              body: 'Hello! Please take your medication.',
            })
            .then((message) => console.log(message.sid));
        },
        null,
        true
      );
    }
  });
});
