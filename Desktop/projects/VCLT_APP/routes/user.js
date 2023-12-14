import express from 'express';
import { registerroute, otp, loginroute, verifyEmail, authenticateJWT, authorizeUser, checkOTP, SECRET_KEY, viewProfileController, editProfileController, editProfileController2, manageProfileController, profilePictureController, deactivateAccountController, forgetPasswordController, checkPasswordController, captionLanguageController, spokenLanguageController, setCaptionLanguageController, setSpokenLanguageController , sendRequestcontroller , userFeedbackController , checkRoomController , userViewHistoryController} from '../controller/userController.js';
import jwt from '../controller/userController.js';
import upload from '../model/upload.js';
import translate from '@iamtraction/google-translate';

const router = express.Router();

router.get('/', (req, res) => {
    console.log("login");
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, SECRET_KEY, (err, decodedToken) => {
            if (err) {
                console.log("if inside", err);
                res.render("pages/index", { msg: '' });
            } else {
                console.log("else inside", decodedToken);
                res.render("pages/main", { user: "" });
            }
        });
    } else {
        console.log("else outside");
        res.render("pages/index", { msg: '' });
    }
});

router.get('/register', (req, res) => {
    res.render('pages/register', { msg: '' });
});

router.post('/userDetails', verifyEmail, registerroute);

router.post('/checkUser', loginroute);

router.get('/login', (req, res) => {
    res.render("pages/login", { msg: '' , requestforactive: ""});
});

router.get('/forgetPassword', (req, res) => {
    res.render('pages/forgetPassword', { msg: "" });
});

router.post('/sendpasswordOTP', forgetPasswordController);

router.post('/changePassword/:email', (req, res) => {
    const email = req.params.email;
    const { otp1, otp2, otp3, otp4 } = req.body;
    var userotp = otp1 + otp2 + otp3 + otp4;
    if (otp == userotp) {
        res.render('pages/changePassword', { msg: "", email: email });
    } else {
        res.render('pages/passwordOTP', { msg: "OTP Not Match", email: email });
    }
});

router.post('/checkPassword/:email', checkPasswordController);

router.get('/main', authenticateJWT, authorizeUser, checkOTP);

router.get('/logout', (req, res) => {
    res.cookie('jwt', "", { httpOnly: true, maxAge: 1 });
    res.cookie('email', "", { httpOnly: true, maxAge: 1 });
    // res.clearCookie('jwt');
    res.clearCookie('email');
    res.render('pages/index', { msg: '' });
});

router.get('/viewprofile', viewProfileController);

router.get('/updateprofile/:field', editProfileController);

router.post('/updateprofile/:field', editProfileController2);

router.get('/manageprofile/:field', manageProfileController);

router.post('/photo', upload, profilePictureController);

router.get('/deactivate', deactivateAccountController);

router.get('/videochat', (req, res) => {
    const email = req.cookies.email;
    console.log('mzsdfgvbh : ', email);
    res.render("videochat/lobby", { email:email })
});

router.get('/room', (req, res) => {
    const inviteCode = req.query.room; 
    const email = req.query.name;
    console.log("Email in room router : ",email);
    res.render('videochat/room', { inviteCode });
});

router.get('/lobby', (req, res) => {
    const email = req.cookies.email;
    const inviteCode = req.query.room;
    res.render('videochat/lobby', { inviteCode,email:email });
});

router.get('/translate/:message/:speechcode/:captioncode', (req, res) => {                
    const content = req.params.message;                
    const speechcode = req.params.speechcode.slice(0,2);                
    const captioncode = req.params.captioncode;         
    console.log("Msg : ",content);                
    translate(content, { from: speechcode, to: captioncode })                
        .then(translationResult => {
            const text = translationResult.text;                
            console.log("Translated Result : ",translationResult);                
            console.log("Translated Msg : ",text);                
            res.json({ text: text });                
        })
        .catch(err => {                
            console.error(err);
            res.status(500).json({ error: 'Translation failed' });
        });
});

router.get('/setSpokenLanguage/:field',setSpokenLanguageController);
router.get('/setCaptionLanguage/:field',setCaptionLanguageController);
router.get('/caption-language/:field',captionLanguageController);
router.get('/spoken-language/:field',spokenLanguageController);
router.get('/viewHistory', userViewHistoryController);

router.post('/feedback', userFeedbackController );
router.post('/sendRequest' , sendRequestcontroller);

router.get('/checkroom' , checkRoomController)
export default router;