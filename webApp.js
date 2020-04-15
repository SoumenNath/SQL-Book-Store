const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session')
const {Client} = require('pg');
// const client= new Client({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'comp3005project',
//   password: 'cusec7',
//   port: 5432,
// })

const app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "pug");
let us="";
let usType = "";
let rgB= "";
let rgA= "";
let bks = "";
let mybks = "";
let loggedIn = false;
app.get('/', main);
app.post("/login", login);
app.post("/regester", regester);
app.get("/users/:username", displaySingleU);
app.get("/books", books);
app.get("/books/:ISBN", singleBook);
app.get("/ubooks/:username", uBooks);
function main(req, res, next) {
  console.log("Main");
  if (us != ""){
    console.log(us);
  }
  //render the index page with a differnt loggedIn value depending on wheter or not the user is logged in
  if(loggedIn){
    res.render("index", {loggedIn: true, user: us});
  }
  else{
    res.render("index", {loggedIn: false, user: us});
  }

};
function keeplooking(mO, username, password, res){
  console.log("MoveOn: "+mO);
  if (mO == 2){
    console.log("Now querrying bookstore_owner");
    const client2= new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'comp3005project',
      password: 'cusec7',
      port: 5432,
    })
    client2.connect(err => {
      if (err) {
        console.error('connection error', err.stack)
      } else {
        console.log('connected');
        //"user" cause user is a keyword in pg
        client2.query('SELECT * FROM bookstore_owner', (err, rs) => {
          if (err) throw err
          console.log(rs.rows);
          let correctuserN = false;
          let correctpass = false;
          rs.rows.forEach(row => {
            if (username == row["username"]){
              correctuserN = true;
              us = row;
            }
            if (password == row["password"]){
              correctpass = true;
            }
            console.log(row["username"]);
            console.log(row["password"]);
          });
          if ((correctpass==true) && (correctuserN==true)){
                console.log("Success");
                loggedIn = true;
                usType = 2;
                let url = 'http://localhost:3000/users/'+username;
                res.redirect(url);
                client2.end();
          }
          else{
            console.log("Incorrect username or password");
            res.redirect('http://localhost:3000/');
            client2.end();
          }

          });
        }
      })
  }

}
function login(req, res, next){
  let moveOn = 1;
  //if the user is already logged in then notify them with the following message
	if(loggedIn){
		res.status(200).send("Already logged in.");
		return;
	}
	console.log(req.body);
	console.log("Username: "+req.body.username);
  //get the username and password entered in the login form
	let username = req.body.username;
	let password = req.body.password;

  console.log(username);
  console.log(password);

  const client= new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'comp3005project',
    password: 'cusec7',
    port: 5432,
  })
  client.connect(err => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('connected');
      //"user" cause user is a keyword in pg
      client.query('SELECT * FROM "user"', (err, rs) => {
        if (err) throw err
        console.log(rs.rows);
        let correctuserN = false;
        let correctpass = false;
        rs.rows.forEach(row => {
          if (username == row["username"]){
            correctuserN = true;
            us = row;
          }
          if (password == row["password"]){
            correctpass = true;
          }
          console.log(row["username"]);
          console.log(row["password"]);
        });
        if ((correctpass==true) && (correctuserN==true)){
              console.log("Success");
              loggedIn = true;
              usType = 1;
              let url = 'http://localhost:3000/users/'+username;
              res.redirect(url);
              console.log(loggedIn);
              //next();
        }
        else{
          console.log("Not yet Success");
        }
        console.log("Before first end");
        client.end();
        console.log("After first end");
        if (loggedIn!=true){
          moveOn = 2;
          console.log(moveOn);
          keeplooking(moveOn, username, password, res);
        }

        });
      }
    });
    console.log("before if statement");
}


function regester(req, res, next){
  //if the user is already logged in then notify them with the following message
	if(loggedIn){
		res.status(200).send("Already logged in.");
		return;
	}
	console.log(req.body);
	//console.log("Username: "+req.body.username);

  //get the username and password entered in the login form
	let username = req.body.username;
	let password = req.body.password;
  usType =  req.body.usertype;
  rgB = req.body.regsB;
  rgA = req.body.regsA;
  console.log(username);
  console.log(password);
  console.log(rgB);
  console.log(rgA);
  console.log(usType);
  const client= new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'comp3005project',
    password: 'cusec7',
    port: 5432,
  })
  client.connect(err => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('connected');
      const text = 'INSERT INTO "user"(username, password, registered_billing_info, registered_address) VALUES($1, $2, $3, $4)';
      const values = [username, password, rgA, rgB];
      //"user" cause user is a keyword in pg
      client.query(text, values, (err, rs) => {
        if (err){
          console.log(err.stack)
        }
        console.log("Inserted");
        res.redirect('http://localhost:3000/');
        client.end();
        });
      }
  })
}

function displaySingleU(req, res, next){
  if (loggedIn){
      console.log("User");
      console.log(us);
      res.status(200).render("singleUser", {usT:usType, user: us});
    }
    else{
        res.status(403).send("Error: this profile cannot be accessed.");
    }
}

function books(req, res, next){
  console.log("Browisng Books");
  const client3= new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'comp3005project',
    password: 'cusec7',
    port: 5432,
  })
  client3.connect(err => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('connected');
      //"user" cause user is a keyword in pg
      client3.query('SELECT * FROM book', (err, rs) => {
        if (err){
          console.log(err.stack);
        }
        console.log(rs.rows);
        bks = rs.rows;
        res.status(200).render("displayBooks", {user: us, loggedIn: loggedIn, books: bks});
        client3.end();
        });
      }
  })

}

function singleBook(req, res, next){
  console.log("Single Book");
  console.log(req.params.ISBN);
  let rw = [];
  bks.forEach(row => {
    if (row["ISBN"] == req.params.ISBN){
      rw = row;
    }
  });
  console.log(rw);
  res.status(200).render("displaysingleBook", {usT: usType, user: us, loggedIn: loggedIn, book: rw});

}

function uBooks(req, res, next){
  console.log("Browisng My Books");
  const client3= new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'comp3005project',
    password: 'cusec7',
    port: 5432,
  })
  client3.connect(err => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('connected');
      console.log(req.params.username);
      //"user" cause user is a keyword in pg
      let text = "";
      if (usType==1){
        text = 'SELECT * FROM buys';
      }
      else{
        text = 'SELECT * FROM sells';
      }
      client3.query(text, (err, rs) => {
        if (err){
          console.log(err.stack);
        }
        console.log(rs.rows);
        mybks = rs.rows;
        let rw = [];
        mybks.forEach(row => {
          if (row["username"] == req.params.username){
            console.log(row);
            rw.push(row);
          }
        });
        console.log(rw);
        res.status(200).render("displayMyBooks", {userN: req.params.username, usT: usType, books: rw});
        client3.end();
        });
      }
  })
}
app.listen(3000, function(){
  console.log("Server has started");
});
