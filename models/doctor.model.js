const { date } = require("joi");
const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String },
    firstName: { type: String },
    lastName: { type: String },

    email: { type: String },
    password: { type: String },
    token: { type: String },
    phoneNumber: { type: String },
    refreshToken: { type: String },
    gender: {
      type: String,
    },
    age: {
        type: String,
      },
  
    country: {
        type:String,
    },
    state:{
        type:String,
    },
    otp: { type: String },
    expireOtpTime: {
        type: Date,
        default: null,
      },
    city: { type: String },
    zipcode:{
        type:String,
    },
    doctorAddress:{
        type:String
    },
    specialistType: { type: String},
    qualification:{
        type:String,
    },
    experience:{
        type:String,
    },
    workingTime:{
        type:String,
    },
    workOn:{
        type:String,
    }, 
    breakTime:{
        type:String,
    },
    patientCheckUpTime:{
        type:String,
    },
    description:{
        type:String,
    },
    image: {
        public_id: String,
        url: String,
      },
      signatureImage: {
        public_id: String,
        url: String,
      },
onlineConsulationRate:{
    type:String,
},
doctorCurrentHospital:{
    type:String,
},
hospitalName:{
    type:String,
},
hospitalAddress:{
    type:String,
},
hospitalWebLink:{
    type:String,
},
emergencyContactNumber:{
    type:Number,
},

  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Declaring model for plan
const Doctor = mongoose.model("doctor", doctorSchema);
module.exports = Doctor;