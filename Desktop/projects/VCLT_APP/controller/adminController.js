import { usermodel } from '../model/usermodel.js';
import { feedbackmodel } from '../model/feedbackmodel.js';
import { messagemodel } from '../model/messagemodel.js';
import nodemailer from 'nodemailer';
import emailValidator from 'deep-email-validator';

const maxAge = 86400 * 1000;
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'vishnitin51@gmail.com',
        pass: 'rfbr ijwc vcey ibaf'
    }
});

export const adminViewUserController = async (request, response) => {
    try {
        const result = await usermodel.find();
        response.render('pages/adminViewUser', { result: result })
    } catch (error) {
        console.log("error while fetching data from database");
    }
}

export const adminDeactivateUser = async (request, response) => {
    try {
        var email = request.params.email;

        const user = await usermodel.findOne({ email: email });

        if (user.status == "activate") {
            const updateddata = await usermodel.updateOne({ email: email }, { $set: { status: "deactivate" } });
            const result = await usermodel.find();
            response.render('pages/adminViewUser', { result: result })
        }
        else {
            const updateddata1 = await usermodel.updateOne({ email: email }, { $set: { status: "activate" } })
            const result = await usermodel.find();
            response.render('pages/adminViewUser', { result: result })
        }
    } catch (error) {
        console.log("error while activate or deactivate account");
    }
}

export const adminViewFeedbackController = async(req , res)=>{
    try {
        const result = await feedbackmodel.find();
        res.render('pages/adminViewFeedback', { result: result })
    } catch (error) {
        console.log("error while fetching data from database");
    }
}

export const adminViewRequestController = async(req , res)=>{
    try {
        const result = await messagemodel.find();
        res.render('pages/adminViewRequest', { result: result })
    } catch (error) {
        console.log("error while fetching data from database");
    }
}