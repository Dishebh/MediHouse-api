const express = require('express');
const medications = require('../mock/medications');
const Medication = require('../models/Medication');
const server = require('../');
const { exec } = require('child_process');

const router = express.Router();

router.get('/medications', async (req, res) => {
  const medications = await Medication.find({})
    .sort({ createdAt: -1 })
    .limit(100);

  res.status(200).send(medications);
});

router.post('/medication', async (req, res) => {
  const { address, avatarUrl, email, firstName, lastName, phone, cronValue } =
    req.body;

  const newMed = new Medication({
    firstName,
    lastName,
    avatarUrl,
    phone,
    address,
    email,
    cronValue,
  });

  const medication = await newMed.save();

  res.status(200).send(medication);
});

router.get('/restart', (req, res) => {
  exec('ls', (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      console.log(`stderr: ${stderr}`);
      return;
    }

    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
  });

  res.status(200).send('Server restarted!');
});

module.exports = router;
