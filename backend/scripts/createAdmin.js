// One-time script to create/reset the admin account.
// Run from the backend/ folder on the VM (after .env is set up):
//   node scripts/createAdmin.js <username> <password>
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  const [, , username, password] = process.argv;
  if (!username || !password) {
    console.error('Usage: node scripts/createAdmin.js <username> <password>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  let user = await User.findOne({ username: username.toLowerCase() });
  if (user) {
    user.password = password; // will be re-hashed by the pre-save hook
    await user.save();
    console.log(`Existing admin "${username}" password updated.`);
  } else {
    user = await User.create({ username: username.toLowerCase(), password, role: 'admin' });
    console.log(`Admin "${username}" created.`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
