const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");
const recipes = require("./routes/api/recipes");
const ingredients = require("./routes/api/ingredients");
const cors = require("cors");

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use(cors());

// Passport middleware
app.use(passport.initialize());

// Passport Config
require("./config/passport")(passport);

// Use Routes
app.use("/api/users", users);
app.use("/api/recipes", recipes);
app.use("/api/ingredients", ingredients);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
