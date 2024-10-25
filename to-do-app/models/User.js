import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.models.User || mongoose.model('User', UserSchema);

// 1
// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const UserSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Please provide a name'],
//     maxlength: [60, 'Name cannot be more than 60 characters'],
//   },
//   email: {
//     type: String,
//     required: [true, 'Please provide an email'],
//     unique: true,
//     lowercase: true,
//     validate: {
//       validator: function(v) {
//         return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
//       },
//       message: 'Please enter a valid email'
//     },
//   },
//   password: {
//     type: String,
//     required: [true, 'Please provide a password'],
//     minlength: [6, 'Password must be at least 6 characters long'],
//     select: false,
//   },
// }, { timestamps: true });

// // Hash the password before saving
// UserSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) {
//     next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// // Method to check if password matches
// UserSchema.methods.matchPassword = async function(enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// export default mongoose.models.User || mongoose.model('User', UserSchema);