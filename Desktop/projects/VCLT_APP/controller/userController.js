import { usermodel } from '../model/usermodel.js';
import { feedbackmodel } from '../model/feedbackmodel.js';
import { messagemodel } from '../model/messagemodel.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import emailValidator from 'deep-email-validator';
import url from 'url';
import bcrypt from 'bcrypt';
// import crypto from 'crypto';

export const SECRET_KEY = "crypto.randomBytes(32).toString('hex')";
export var otp;
export default jwt;
let payload = {}
let token;
const maxAge = 86400 * 1000;

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user : "vishnitin51@gmail.com",
        pass : "zsdk fbgi wyuu lcjw"
    }
});

export const registerroute = async (req, res) => {
    console.log(bcrypt);
    const { username, birthyear, email, password } = req.body;
    let temp = {
        username:username,
        email:email,
        password:password,
        birthyear:birthyear
    }
    res.cookie("temp",temp,{httpOnly:true, maxAge:maxAge})
    try {
        const existinguser = await usermodel.findOne({ email: email });
        console.log("1", existinguser);
        if (existinguser) {
            res.render("pages/register", { msg: 'User Already Exist' });
        } 
        else {
            otp = "";
            var data = req.body;
            for (let i = 1; i <= 4; i++) {
                otp += Math.floor(Math.random() * 10);
            }
            console.log("4", otp);

            const mailOptions = {
                from: 'vishnitin51@gmail.com',
                to: data.email,
                subject: 'OTP for signIn in VCLT',
                text: `This is the otp for the signup in VCLT Web app.your One Time Password is: ${otp}`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error jp', error);
                } else {
                    console.log('Email sent successfull');
                    res.render("pages/verifyOTP", { msg: "" });
                }
            });
            
        

        }
    }
    catch (err) {
        console.log('something went wrong', err);
    }
}

export const verifyEmail = (req, res, next) => {
    // const { email } = req.body;
    // console.log(email);
    // async function isEmailValid(email) {
    //     return emailValidator.validate(email);
    // }
    // (async () => {
    //     const { valid, reason, validators } = await isEmailValid(email);
    //     console.log("valid : ",valid);
    //     if (valid) {
    //         console.log('Email is valid');
    //         next();
    //     } else {
    //         console.log('Email is not valid. Reason:', validators[reason].reason);
    //         console.log(validators[reason].reason === "Timeout");
    //         if(validators[reason].reason=="Timeout"){
    //             isEmailValid(email);
    //         }
    //         res.render("pages/register", { msg: 'Email is not Valid' });
    //     }
    // })();
    next();
    
}

export const loginroute = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email);
        const existinguser = await usermodel.findOne({ email: email });
        payload.result = existinguser;
        const expireTime = {
            expiresIn: '1d'
        }
        if (email == "admin@gmail.com" && password == "Admin@123") {
            res.render("pages/adminmainpage");
        } else {
            if (!existinguser) {
                res.render('pages/login', { msg: "user not found", requestforactive: "" });
            } else {
                const matchpassword = await bcrypt.compare(password, existinguser.password);
                if (!matchpassword) {
                    console.log("passNotMatch");
                    res.render("pages/login", { msg: "Password Not Match", requestforactive: "" });
                } else {
                    if (existinguser.status == "activate") {
                        token = jwt.sign(payload, SECRET_KEY, expireTime);
                        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge });
                        res.cookie('email', email, { httpOnly: true, maxAge: maxAge });
                        if (!token) {
                            response.json({ message: "Error Occured while dealing with Token" });
                        }
                        res.render("pages/main", { user: existinguser });
                    }
                    else {
                        res.render("pages/login", { msg: "your account is deactivate", requestforactive: "Request for active" })
                    }
                }
            }
        }
    }
    catch (err) {
        console.log('something went wrong', err);
    }
}

export const authenticateJWT = (request, response, next) => {
    // console.log("authenticateJWT : ");
    // const token = request.cookies.jwt;
    // if (!token) {
    //     response.json({ message: "Error Occured while dealing with Token inside authenticateJWT" });
    // }
    // jwt.verify(token, SECRET_KEY, (err, payload) => {
    //     if (err)
    //         response.json({ message: "Error Occured while dealing with Token during verify" });
    //     request.payload = payload;
    //     next();
    // });
    next();
}

export const authorizeUser = (request, response, next) => {
    // console.log("5", request.payload.result.email);
    next();
}

export const checkOTP = async (req, res) => {
    var requestURL = url.parse(req.url, true).query;
    var userotp = requestURL.otp1 + requestURL.otp2 + requestURL.otp3 + requestURL.otp4;
    console.log(userotp);
    console.log("previous otp : ",otp);
    if (otp == userotp) {
        console.log("otp match");
        // const email = req.cookies.email; //updated at 10:41 pm on 11/5/23
        const temp = req.cookies.temp;
        console.log("temp : ",temp);
        let password = temp.password;
        console.log(password);
        const hashpassword = await bcrypt.hash(password, 10);
        console.log(hashpassword);
        const result = await usermodel.create({
            username: temp.username,
            birthyear: temp.birthyear,
            email: temp.email,
            password: hashpassword,
            status: "activate",
        });
        await result.save();
        console.log("result obj : ", result)

        payload.result = result;
        const expireTime = {
            expiresIn: '1d'
        }
        token = jwt.sign(payload, SECRET_KEY, expireTime);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge });
        res.cookie('email', result.email, { httpOnly: true, maxAge: maxAge });
        if (!token) {
            res.json({ message: "Error Occured while dealing with Token" });
        }
        console.log("token : ", token);

        const email = result.email;
        console.log(email);
        const user = await usermodel.findOne({ email: email });

        //created a jwt token 10:39 pm 11/5/23
        res.render('pages/main', { user: user });
    } else {
        console.log("not match");
        res.render("pages/verifyOTP", { msg: "OTP Not Match" });
    }
}

export const viewProfileController = async (req, res, next) => {
    try {
        const email = req.cookies.email;
        console.log(email);
        const user = await usermodel.findOne({ email: email });

        if (!user) {
            console.log("User not found"); // Print to console
            return res.status(404).json({ message: "User not found" });
        } else
            res.render("pages/userProfile", { user: user, field: "" });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const editProfileController = async (req, res, next) => {
    try {

        const email = req.cookies.email;
        var field = req.params.field;
        console.log(field);
        console.log(email);

        const user = await usermodel.findOne({ email: email });
        console.log(user);
        console.log("hello1")

        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "Request Timeout" });
        }
        console.log("hello2")
        res.render("pages/editProfile", { user: user, field: field, msg: "" });

    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const editProfileController2 = async (req, res, next) => {
    try {
        const email = req.cookies.email;
        var field = req.params.field;
        console.log(field);
        let msg = "";
        const user = await usermodel.findOne({ email: email });
        console.log(user);

        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        else {
            console.log("hello");
            switch (field) {
                case "userName": {
                    const newUsername = req.body.username;
                    user.username = newUsername;
                    await user.save();
                    console.log("Data has been Updated Successfully");
                    break;
                }
                case "birthDate": {
                    const dob = req.body.birthdate;
                    if (!user.birthdate) {
                        user.birthdate = dob;
                        await user.save();
                    }
                    else {
                        user.birthdate = dob;
                        await user.save();
                    }
                    console.log("Data has been Updated Successfully");
                    break;
                }
                case "gender": {
                    user.gender = req.body.gender;
                    await user.save();
                    console.log("Data has been Updated Successfully");
                    break;
                }
                case "phone": {
                    user.contactNumber = req.body.contactNumber;
                    console.log(user.contactNumber);
                    await user.save();
                    console.log("Data has been Updated Successfully 😂");
                    break;
                }
                case "address": {
                    if (!user.address) {
                        user.address = req.body.address;;
                        await user.save();
                    }
                    else {
                        user.address = req.body.address;;
                        await user.save();
                    };
                    console.log("Data has been Updated Successfully 😂");
                    break;
                }
                case "changePassword": {
                    console.log("Change Password");
                    const { oldpassword, newpassword, cpassword } = req.body;
                    console.log("old: " + oldpassword);
                    console.log("new: " + newpassword);
                    console.log("con: " + cpassword);
                    const matchpassword = await bcrypt.compare(oldpassword, user.password);

                    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;

                    if (!passwordPattern.test(newpassword)) {
                        msg = "New Password Must be 8 digit";
                    } else if (newpassword !== cpassword) {
                        msg = "New Password And Confirm Password Not Match";
                    } else if (!matchpassword) {
                        msg = "Wrong Old Password";
                    } else {
                        console.log("passMatch");
                        const hashpassword = await bcrypt.hash(newpassword, 10);
                        user.password = hashpassword;
                        await user.save();
                        const expireTime = {
                            expiresIn: '1d'
                        }
                        token = jwt.sign(payload, SECRET_KEY, expireTime);
                        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge });
                        res.cookie('email', email, { httpOnly: true, maxAge: maxAge });
                        if (!token) {
                            res.json({ message: "Error Occured while dealing with Token" });
                        }
                        console.log('Password updated successfully');
                    }
                }
            }
            if (msg == "")
                res.redirect('/viewprofile');
            else
                res.render("pages/editProfile", { user: user, field: "privacy", msg: msg });

        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const manageProfileController = async (req, res, next) => {
    try {
        const email = req.cookies.email;
        console.log(email);
        const user = await usermodel.findOne({ email: email });
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        const field = req.params.field;
        if (field == "deactivate") {
            res.render("pages/manageProfile", { user: user, field: "" });
        } else {
            res.render("pages/editProfile", { user: user, field: field, msg: '' });
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const profilePictureController = async (req, res, next) => {
    try {
        const email = req.cookies.email;
        console.log(email);
        const user = await usermodel.findOne({ email: email });
        console.log(user);

        if (!user) {
            console.log("User not found"); // Print to console
            return res.status(404).json({ message: "User not found" });
        }
        const profilePicture = req.file.filename;
        console.log(profilePicture);
        if (!user.profile) {
            user.profile = profilePicture;
            await user.save();
        }
        else {
            user.profile = profilePicture;
            await user.save();
        }

        res.render("pages/userProfile", { user: user, field: "" })
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deactivateAccountController = async (req, res, next) => {
    try {
        const email = req.cookies.email;
        console.log(email);
        const user = await usermodel.findOne({ email: email });
        console.log(user);

        if (!user) {
            console.log("User not found"); // Print to console
            return res.status(404).json({ message: "User not found" });
        }
        await usermodel.updateOne({ email: email }, { $set: { status: "deactivate" } });
        console.log(user);
        res.cookie('jwt', "", { httpOnly: true, maxAge: 1 });
        res.cookie('email', "", { httpOnly: true, maxAge: 1 });
        res.render("pages/index", { user: '' });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const forgetPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        const existinguser = await usermodel.findOne({ email: email });
        if (!existinguser) {
            res.render("pages/forgetPassword", { msg: "Email Not Exist" });
        } else {
            otp = "";
            var data = req.body;
            for (let i = 1; i <= 4; i++) {
                otp += Math.floor(Math.random() * 10);
            }
            console.log("4", otp);

            const mailOptions = {
                from: 'vishnitin51@gmail.com',
                to: data.email,
                subject: 'OTP for signIn in VCLT',
                text: `This is the otp for the signup in VCLT Web app.your One Time Password is: ${otp}`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error1', error);
                } else {
                    console.log('Email sent successfull');
                }
            });

            res.render("pages/passwordOTP", { msg: "", email: email });
        }
    }
    catch (err) {
        console.log('something went wrong', err);
    }
}

export const checkPasswordController = async (req, res) => {
    const email = req.params.email;
    const { password } = req.body;
    const hashpassword = await bcrypt.hash(password, 10);
    try {
        const existinguser = await usermodel.findOne({ email: email });
        payload.result = existinguser;
        const expireTime = {
            expiresIn: '1d'
        }
        existinguser.password = hashpassword;
        await existinguser.save();
        token = jwt.sign(payload, SECRET_KEY, expireTime);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge });
        res.cookie('email', email, { httpOnly: true, maxAge: maxAge });
        if (!token) {
            res.json({ message: "Error Occured while dealing with Token" });
        }
        console.log('Password updated successfully');
        res.render("pages/main", { user: "" });
    } catch (error) {
        console.error('Error changing password:', error.message);
    }
}


export const captionLanguageController = async (req, res) => {
    const email = req.params.field;
    try {
        const user = await usermodel.findOne({ email: email });
        console.log("Current User Caption Language");
        console.log(user);
        console.log(user.captionlanguage);
        res.json({ captionLanguage: user.captionlanguage });

    } catch (error) {
        console.error("Error while retreiving caption language :", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const spokenLanguageController = async (req, res) => {
    const email = req.params.field;
    try {
        const user = await usermodel.findOne({ email: email });
        console.log("Current User Spoken Language");
        console.log(user);
        console.log(user.spokenlanguage);
        res.json({ spokenLanguage: user.spokenlanguage });

    } catch (error) {
        console.error("Error while retreiving caption language :", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const setSpokenLanguageController = async (req, res, next) => {
    try {
        const email = req.cookies.email;
        var field = req.params.field;
        console.log(field);
        const user = await usermodel.findOne({ email: email });
        console.log(user);

        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        else {
            user.spokenlanguage = field;
            await user.save();
            console.log("Data has been Updated Successfully");
            res.render("pages/userProfile", { user: user, field: field })
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const setCaptionLanguageController = async (req, res, next) => {
    try {
        const email = req.cookies.email;
        var field = req.params.field;
        console.log(field);
        const user = await usermodel.findOne({ email: email });
        console.log(user);

        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        else {
            user.captionlanguage = field;
            await user.save();
            console.log("Data has been Updated Successfully");
            res.render("pages/userProfile", { user: user, field: field })
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const sendRequestcontroller = async (req, res) => {
    console.log("asgzDXHF");
    var { email, sendmessage } = req.body;
    const existinguser = await usermodel.findOne({ email: email });
    console.log(" Exsisting user : ", existinguser);
    if (!existinguser) {
        res.render('pages/login', { msg: "Email is Invalid ", requestforactive: "Request again" });
    } else {
        const result = await messagemodel.create({
            message: sendmessage,
            email: email
        });
        result.save();
        res.render("pages/login", { msg: "request sent successfully please wait 24 Hours for activate your account", requestforactive: "" })
    }
}

export const userFeedbackController = async (req, res) => {
    console.log("rewhcgvh : ", req.body);
    const { rating, feedbackmessage } = req.body;
    console.log("rating : " + rating);
    console.log("feed : " + feedbackmessage);
    const email = req.cookies.email;
    const result = await feedbackmodel.create({
        email: email,
        rating: rating,
        feedbackmessage: feedbackmessage
    });
    result.save();
    res.render("pages/main", { user: "" });
}

var count = 0;
var user1Email, user2Email;

export const checkRoomController = async (req, res) => {
    count++
    // console.log("invite Code in checkroom router : ", req.query.inviteCode);
    // console.log("email in checkroom router : ", req.query.email1);

    var inviteCode = req.query.inviteCode;
    // var email = req.query.email;

    if (count == 1) {
        user1Email = req.query.email;
        console.log("First User Comes : ", user1Email);
    }
    else {
        //     console.log("Second User Comes");
        user2Email = req.query.email;
        console.log("First User Comes : ", user1Email);
        console.log("second User Comes : ", user2Email);

        // res.cookie('user2Email', user2Email, { httpOnly: true, maxAge: maxAge });

        //     console.log("user1 Email from cookies : ", req.cookies.user1Email);
        //     console.log("user2 Email  : ", user2Email);

            var result = await callRecordModel.create({
                user1_email : user1Email,
                user2_email : user2Email,
                inviteCode : inviteCode
            })
        //     // result.save();
        //     console.log("Data inserted Successfully");
    }


    // if(existingInviteCode){
    //     console.log("InvitecodeExist");
    //     var existingEmail = await callRecordModel.findOne({user1_email : req.params.email});
    //     if(existingEmail){
    //         var result = await callRecordModel.create({inviteCode : req.params.inviteCode},{
    //             // inviteCode : req.params.inviteCode,
    //             user2_email : req.params.email
    //         });
    //     }
    //     else{
    //         var result = await callRecordModel.create({inviteCode : req.params.inviteCode},{
    //             // inviteCode : req.params.inviteCode,
    //             user1_email : req.params.email
    //         });
    //     }
    // }
    // else{
    //     var result = await callRecordModel.create({
    //         inviteCode : req.params.inviteCode,
    //         user1_email : req.params.email
    //     });
    // }
}

export const userViewHistoryController = async (req , res)=>{
    var email = req.cookies.email;
    console.log("email : " , email);
    var result = await usermodel.findOne({email : email});
    console.log("result.email : ", result.email);

    var callResult = await callRecordModel.findOne({user1_email : result.email});
    console.log("callResult : ",callResult);
    res.render('pages/userViewHistory' , {callResult , user: ""});
    
}
