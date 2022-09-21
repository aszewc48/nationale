// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");
const session = require('express-session')
const MongoStore = require('connect-mongo')

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");
// Handlebars.registerHelper('splitUrl', function() {
//     return this.recipe.uri.split("/").slice(-1,str.length);
//     });
hbs.registerHelper("divide", function(a,b) {
    let answer = (a / b).toFixed(2)
    return answer;
  });

const app = express();

app.use(
    session({
      secret: SESSION_SECRET,
      resave: true,
      saveUninitialized: false,
      cookie: {
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 600000 // 600 * 1000 ms === 10 min
      },
      store: MongoStore.create({
          mongoUrl: process.env.MONGODB_URI
      })
    })
  );

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// default value for title local
const capitalized = require("./utils/capitalized");
const projectName = "nationale";

app.locals.appTitle = `${capitalized(projectName)} created with IronLauncher`;

// 👇 Start handling routes here
const index = require("./routes/index.routes");
app.use("/", index);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
