const jwt = require("jsonwebtoken");

const { queryErrorRelatedResponse } = require("../helpers/sendresponse");
const Patient = require("../models/patient.model");


module.exports = async function (req, res, next) {
    let token = req.header("Authorization");
    if (token) {
        token = req.header("Authorization").replace("Bearer ", "");
    }
    if (!token) return queryErrorRelatedResponse(req, res, 402, "Access Denied.");
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        let patient = await Patient.findOne({email : verified.email});
        if (!patient) {
            return queryErrorRelatedResponse(req, res, 402, "Access Denied.");
        }
        req.patient = patient;
        req.token = token;
        next();
    } catch (error) {
        queryErrorRelatedResponse(req, res, 402, "Invalid Token.")
    }
};