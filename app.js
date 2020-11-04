// Include your usernames here to successfully sign up
const myUsers = [
  'Ayushi',
  'Ayushi Prasad',
  'Swagat Panda',
  'apple'
];

var express = require("express"),
  passport = require("passport"),
  flash = require("connect-flash"),
  bodyParser = require("body-parser"),
  User = require("./models/user"),
  Advice = require("./models/advice"),
  LocalStrategy = require("passport-local"),
  session = require("express-session"),
  passportLocalMongoose = require("passport-local-mongoose");

const mongoose = require("mongoose");
const Details = require("./models/details");
mongoose
  .connect("mongodb://localhost:27017/auth_demo_app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB!"))
  .catch((error) => console.log(error.message));

var app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  require("express-session")({
    secret: "ayushi",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(express.static(__dirname + "/public"));
app.use(flash());
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

/*
Insert Advices into Database - comment it afterwards and before making a new entry, erase everything

Advice.insertMany([
  {date:'2 feb',advice:'bla bla bla',username:'abcd'},
  {date:'2 feb',advice:'blah blah',username:'a'}
])
  .then(data=>{
    console.log("INSERTED");
    console.log(data);
  })
*/

//ROUTES
/*=========================*/

app.get("/", function (req, res) {
  res.render("home", { messages: req.flash("success") });
});

//FILL DETAILS ROUTE
app.get("/dashboard/new", (req, res) => {
  res.render("dashboard/new");
});

//CREATE ROUTE
app.post("/dashboard", isLoggedIn, function (req, res) {
  //get data from form and add to db
  //redirect back to dashboard page
  var date = req.body.date;
  var oxygen = req.body.oxygen;
  var temp = req.body.temp;
  var bp = req.body.bp;
  var other = req.body.other; //name attribute in new.ejs
  var author = {
    id: req.user._id,
    username: req.user.username,
  };
  var newDetail = {
    date: date,
    oxygen: oxygen,
    temp: temp,
    bp: bp,
    other: other,
    author: author,
  };
  //create a new detail and save to database
  Details.create(newDetail, function (err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      //redirect to dashboard page
      console.log(newlyCreated);
      res.redirect("/dashboard");
    }
  });
});

//INDEX ROUTE
app.get("/dashboard", isLoggedIn, async (req, res) => {
  //send req.user.id and req.user.username : currently loggedin user
  res.render("dashboard", { id: req.user.id, currentUser: req.user });
});

//SHOW ROUTE
//keep async otherwise it will fail....will give not iterable error
app.get("/dashboard/show", async (req, res) => {
  console.log(req.user.id);
  //console.log(req.user.username)
  const details = await Details.find({ "author.id": req.user.id });
  res.render("dashboard/show", { details });
});

//SHOW ADVICE ROUTE
app.get("/dashboard/advice", async (req, res) => {
  const advice = await Advice.find({});
  res.render("dashboard/advice", { advice });
});

//AUTH ROUTES
//SHOW SIGNUP FORM
app.get("/register", function (req, res) {
  res.render("register");
});

//HANDLE USER SIGNUP
app.post("/register", function (req, res) {
  req.body.username;
  req.body.password;
  if(myUsers.includes(req.body.username)) {
    User.register(
      new User({ username: req.body.username }),
      req.body.password,
      function (err, user) {
        if (err) {
          req.flash("error", err.message);
          return res.render("register");
        }
        passport.authenticate("local")(req, res, function () {
          req.flash("success", `Logged in!`);
          res.redirect("/dashboard");
        });
      }
    );
  }
  else {
    req.flash("error", "Your username is not registered 😥");
    res.redirect("/register");
  }
});

//LOGIN ROUTES
//render login form
app.get("/login", function (req, res) {
  res.render("login", { messages: req.flash("info") });
});

//login logic
//middleware
app.post("/login", passport.authenticate("local"), function (req, res) {
  res.redirect("/dashboard/");
});

app.get("/logout", function (req, res) {
  req.logout();
  req.flash("success", "👋🏻 Successfully logged out");
  res.redirect("/");
});

function isLoggedIn(req, res, next) {
  console.log(req.user);
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("info", "😟 Something went wrong....please try again!");
  res.redirect("/login");
}

//---------------------------------------------------------------------------
app.listen(3000, function () {
  console.log("serving");
});
