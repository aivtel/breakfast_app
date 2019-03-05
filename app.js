const express               = require("express");
const app                   = express();
const bodyParser            = require("body-parser");
const mongoose              = require("mongoose");
const methodOverride        = require("method-override");
const expressSanitizer      = require("express-sanitizer");
const Breakfast             = require("./models/breakfast");
const Comment               = require("./models/comment");
const User                  = require("./models/user");
const expressSession        = require("express-session");
const MongoStore            = require("connect-mongo")(expressSession);
const passport              = require("passport");
const LocalStrategy         = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const flash                 = require("connect-flash");
const commentRoutes         = require("./routes/comments");
const breakfastRoutes       = require("./routes/breakfasts");
const authRoutes            = require("./routes/auth");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(flash());

mongoose.connect("mongodb+srv://**********@cluster0-5zobq.mongodb.net/breakfastguero?retryWrites=true"); 

app.use(expressSession({
    secret: "***********",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 } // 180 minutes session expiration
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// переменную currentUser рассылает на все страницы
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


app.use(commentRoutes);
app.use(breakfastRoutes);
app.use(authRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server is listening");
});