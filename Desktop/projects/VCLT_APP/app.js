import express from 'express';
import router from "./routes/user.js";
import adminRouter from "./routes/adminRoutes.js";
import cookieParser from 'cookie-parser';
import expresssession from 'express-session';
const app = express();
const port = 3000;

app.set('views','views');
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(expresssession({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static('public'));
app.use("/", router);
app.use("/admin", adminRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
