/* -------------------
imports + configuration
------------------- */
var index = require('./routes/index');
var bd = require('./routes/bd');
var fs = require('fs'),
  express = require('express'),
  app = module.exports.app = express();
//Serveur http pour les sockets
//var http = require('http');
//var server = http.createServer(app);
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true }));
app.use(cookieParser("i ifàç -_784 119"));

//Def chemin fichiers statiques
app.use(express.static('public'));
app.use(express.static('public/views'));
app.set('views', __dirname + '/public/views');
app.set('view engine', 'ejs');

/* --------------------
connexion bd
--------------------- */
var mysql = require('mysql');
/*var connection = mysql.createConnection({host:'localhost', user:'zippo', password:'7894561230lr', database:'restaurant'});
//Connexion BD
connection.connect();*/
var connection = mysql.createConnection({
  host     : process.env.DATABASE_URL,
  user     : 'zippo',
  password : 'introuvable ce mdp',
  database : 'heroku_42fbd727a2dbadc'
});
//Connexion BD
connection.connect();


/* ------------------
Routage
------------------ */
app.get('/', function(req, res) {
  res.render('pages/index');
});
app.get('/specialites', function(req, res) {
  bd.getSpecialites(connection, res);
});
app.get('/reserver', function(req, res) {
  res.render('pages/reservation');
});
app.get('/contact', function(req, res) {
  res.render('pages/contact');
});
app.get('/inscription', function(req, res) {
  res.render('pages/inscription.ejs');
});
app.get('/administrer', function(req, res) {
  if(req.signedCookies.uti != undefined) {
    var infos = [,req.signedCookies.uti['pseudo'], req.signedCookies.uti['mdp']];
    bd.estAdmin(connection, infos, res);
  } else {
    res.render('pages/connexion.ejs');
  }
});
app.post('/inscription', function(req,res) {
  var tabReq = index.formulaireInscr(req, res);
  if(tabReq != null) {
    bd.insereAdminTemp(connection, tabReq, res);
  }
});
app.post('/reserver', function(req,res) {
  var tabReq = index.formulaireResa(req, res);
  if(tabReq != null) {
    bd.insereResa(connection, tabReq, res);
  }
});
app.post('/administrer', function(req, res) {
  var infos = index.formulaireConn(req, res);
  if(infos[0]) {
    //On vérifie la validité du pseudo, si admin on envoie la page sinon une erreur
    bd.estAdmin(connection, infos, res);
  }
});
app.post('/ajouter-plat', function(req, res) {
  var tabReq = index.formulaireAjout(req, res);
  if(tabReq != null)
    bd.ajoutPlat(connection, tabReq, res);
});
//Gestion erreurs 404
app.use(function(req, res, next) {
  res.render('pages/erreur404');
  res.status(404);
});


/* -------------------
Démarrage du serveur
------------------- */
app.listen(process.env.PORT || 5000);
console.log("\n*** Démarrage du serveur web sur le port "+process.env.PORT+" ***\n");
/*app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});*/
