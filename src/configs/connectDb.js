const { mongoose } = require('mongoose');

const dbUrl = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@goshu-hr.bcddhxz.mongodb.net/goshu_hrm?retryWrites=true&w=majority`;
// const dbUrl = 'mongodb://localhost:27017/goshu_hrm';

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(dbUrl);
    console.log('Connect to Mongo DB successfully!');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
