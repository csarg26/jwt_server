const fs = require("fs");
const bodyParser = require("body-parser");
const express = require('express');
const app = express(); 
const jwt = require("jsonwebtoken");


const userdb = JSON.parse(fs.readFileSync("./users.json", "utf-8"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => { 
    res.header("Access-Control-Allow-Origin", "*") 
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization" 
    );
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET'); 
        return res.status(200).json({});
    }
    next(); 
})

app.listen(5000, () => {
  console.log("Running api server");
});

const SECRET_KEY = "98657483";

const expiresIn = "1h";

function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

function isLoginAuthenticated({ email, password }) {
  return (
    userdb.users.findIndex(
      (user) => user.email === email && user.password === password
    ) !== -1
  );
}

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  if (!isLoginAuthenticated({ email, password })) {
    const status = 401;
    const message = "Incorrect Email or Password";
    res.status(status).json({ status, message });
    return;
  }
  const access_token = createToken({ email, password });
  res.status(200).json({ access_token });
});


const protectedRoute = express.Router(); 
protectedRoute.use((req, res, next) => {
    const token = req.headers['authorization'];

    if (token) {
      jwt.verify(token, SECRET_KEY, (err, decoded) => {      
        if (err) {
          return res.status(401).json({ auth: false, mensaje: 'Token inválida' });    
        } else {
          req.decoded = decoded;    
          next();
        }
      });
    } else {
      res.status(401).send({ 
          auth: false,
          message: 'token no proporcionada' 
      });
    }
 });

 app.get('/api/auth/islogged', protectedRoute, (req, res) => {
  const datos ={
    auth: true
  };
  
  res.json(datos);
 });

 app.get('/api/private', protectedRoute, (req, res) => {
  const datos ={
    auth: true
  };
  
  res.json(datos);
 });


