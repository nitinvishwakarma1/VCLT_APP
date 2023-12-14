import express from 'express';
import { adminViewUserController, adminDeactivateUser , adminViewFeedbackController , adminViewRequestController } from '../controller/adminController.js';

const adminRouter = express.Router();

adminRouter.get('/adminmainpage', (req, res) => {
    res.render('pages/adminmainpage');
});

adminRouter.get('/adminViewUser', adminViewUserController);
adminRouter.get('/deactivate/:email', adminDeactivateUser);
adminRouter.get('/adminViewRequest', adminViewRequestController);
adminRouter.get('/adminViewFeedbacks', adminViewFeedbackController);
export default adminRouter;