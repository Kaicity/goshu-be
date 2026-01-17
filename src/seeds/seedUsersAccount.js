const UserModel = require('../models/userModel');
const EmployeeModel = require('../models/employeeModel');
const hashPassword = require('../utils/hashPassword');
const generateRandomCode = require('../utils/digitCodeRandom');
const UserRoles = require('../enums/userRoles');
const UserStatus = require('../enums/userStatus');

async function seedAdminAccount() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminRole = UserRoles.ADMIN;

  const existingAdmin = await UserModel.findOne({
    email: adminEmail,
    role: adminRole,
  });

  if (!existingAdmin) {
    const employeeCode = generateRandomCode('NV-');
    const newEmployee = new EmployeeModel({
      email: adminEmail,
      employeeCode,
    });

    const hashedPassword = await hashPassword(adminPassword);

    const newUser = new UserModel({
      email: adminEmail,
      password: hashedPassword,
      employeeId: newEmployee._id.toString(),
      role: adminRole,
      status: UserStatus.ACTIVE,
    });

    await newUser.save();
    await newEmployee.save();
    console.log('Admin account seeded:', adminEmail);
  } else {
    console.log('Admin account already exists:', adminEmail);
    return;
  }
}

module.exports = seedAdminAccount;
