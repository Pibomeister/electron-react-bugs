const mongoose = require('mongoose');

const connectDb = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
      });
      console.log('MongoDB Connected');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

module.exports = connectDb;