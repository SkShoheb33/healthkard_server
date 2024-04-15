const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    dateJoined: { type: Date, default: Date.now },
    healthId: { type: String, required: true ,unique:true},
    agent: { type: String, default: 'self' },
    name: { type: String, required: true },
    age: { type: String, required: true }, 
    gender: { type: String, required: true },
    number: { type: String, required: true,unique:true},
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    image: { type: String, required: true },
    startDate: { type: Date }, 
    expireDate: { type: Date }, 
    visited: [{
        hospitalId: { type: String, required: false },
        hospitalName: { type: String, required: false },
        lastVisit: { type: Date, default: Date.now } ,
        frequency: { type: Number, default: 0 } ,
    }]
});
    
const User = mongoose.model('User', userSchema);

module.exports = User;
