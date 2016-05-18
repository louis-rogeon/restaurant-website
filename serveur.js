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
var url = require("url");
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
//On recupere les logs de la BD sur le serveur d'heroku
var urlBD = process.env.DATABASE_URL;
var hostBD = url.parse(bd).hostname;
var logsTab = (url.parse(bd).auth).split(':');
var userBD = logsTab[0];
var passwdBD = logsTab[1];
var nameBD = (url.parse(bd).pathname).substring(1);
//Set up BD
var db_config = {
  host: hostBD,//'us-cdbr-iron-east-04.cleardb.net',
  user: userBD,//'bb86fab629dfe0',
  password: passwdBD,//'a2f1c1f2',
  database: nameBD//'heroku_42fbd727a2dbadc',
};
//fonction gérant les erreurs de connection et redemande une connexion si celle-ci est perdue
function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}
handleDisconnect();

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
app.get('/ajout-admin-:pseudo', function(req, res) {
  bd.insereAdmin(connection, req.params.pseudo, res);
});
app.get('/supprimer-admintemp-:pseudo', function(req, res) {
  bd.supprimeAdminTemp(connection, req.params.pseudo, res);
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
var port = process.env.PORT || 3000;
app.listen(port);
console.log("\n*** Démarrage du serveur web sur le port "+port+" ***\n");
