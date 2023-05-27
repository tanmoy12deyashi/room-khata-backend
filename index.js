const express = require('express');
const app = express();
const PORT = process.env.PORT || 3030;

const config = require('./config');


const md5 = require('md5');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

const session = require('express-session')
// Use the session middleware
//app.set('trust proxy', 1) // trust first proxy
/* app.use(session({
  secret: 'room-app',
  resave: true,
  saveUninitialized: true,
  cookie: {
    //secure: true,
    maxAge: 60000
  }
})); */
var sessionOptions = {
  secret: "secret",
  resave : true,
  saveUninitialized : false,
  cookie: {
    //secure: true,
  }
};

app.use(session(sessionOptions));
/* const cookieParser = require('cookie-parser');
app.use(cookieParser());; */

const { MongoClient } = require('mongodb');
// Connection URL
const url = config.mongo.url;
const client = new MongoClient(url);

mongodb = {};
const db = getMongoDBInstance().then(function(db) {
  mongodb = db;
});


async function getMongoDBInstance() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');

  return client.db(config.mongo.database);
}

const checkSession = (req, res, next) => {
  console.log(req.session.state);
  next();
}

app.get('/', checkSession, async (req, res) => {
  mongodb.collection('user').findOne({}).then((users) => {
    console.log(users)
    res.send({
      author: "Tan Moy Deyashi"
    });
  });
});


app.get('/get-all-users', checkSession, async (req, res) => {
  mongodb.collection('user').find().toArray().then((users) => {
    res.send({
      users: users
    });
  });
});

/* app.get('/test', checkSession, async (req, res) => {
  mongodb.collection('user').findOne({}).then((users) => {
    //console.log(users, req.session.user)
    req.session.state = true;
    req.session.user = users

    res.cookie('name', 'tobi', {secure: true, httpOnly: true })

    res.send({
      author: "Tan Moy Deyashi"
    });
  });
}); */

/* app.post('/login', async (req, res) => {
  mongodb.collection('user').find({}).toArray().then((users) => {
    console.log(users)
  });

  res.send({
    author: "Tan Moy Deyashi"
  });
}); */

app.post('/login/submit', checkSession, async (req, res) => {
  // if session exists
  if(req.session.state) {
    try {
      const {user_name, password, staySignedIn} = req.body;
  
      mongodb.collection('user').findOne({user_name, password: md5(password)}).then((user) => {
        // if user found
        if(user) {
          // set session data
          req.session.state = true;
          req.session.user = user;
  
          // stay signed in
          if (typeof staySignedIn != 'undefined') {
            // set stay signed in
            res.cookie('staySignedIn', 1, {secure: true, httpOnly: true })
            // set user id
            res.cookie('user_id', 'user.user_id', {secure: true, httpOnly: true })
  
            // set session cookie maxAge
            req.session.cookie.maxAge = null;
          } else {
            // set session cookie maxAge    
            req.session.cookie.maxAge = 60000 * config.session.timeout;
  
            // del stay signed in
            res.clearCookie('staySignedIn')
  
            // del user id
            res.clearCookie('user_id')
          }
  
          // resturn response
          res.send({
            status: "success",
            message: "Authentication successfully"
          });
        } else {
          // resturn response
          res.send({
            status: "error",
            message: "User Not Found!!"
          });
        }
      });
    } catch (err) {
      res.send({
        status: "error",
        message: "Something went wrong!!"
      });
    };
  } else {
    res.redirect('/')
  }
});

app.get('/logout', async (req, res) => {
  res.send({
    message: "Log out successfully"
  });
});

app.post('/item/add', async (req, res) => {
  try {
    const {user_name, password, isRemember} = req.body;

    mongodb.collection('user').find({user_name, password}).then((users) => {
      console.log(users)

      res.send({
        message: "Authentication successfully"
      });
    });
  } catch (err) {
    res.send({
      status: "error",
      message: "Something went wrong!!"
    });
  };
});

app.post('/item/add', async (req, res) => {
  try {
    const {user_name, password, isRemember} = req.body;

    mongodb.collection('user').find({user_name, password}).then((users) => {
      console.log(users)

      res.send({
        message: "Authentication successfully"
      });
    });
  } catch (err) {
    res.send({
      message: "Something went wrong!!"
    });
  };
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});