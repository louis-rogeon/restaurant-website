/* --------------------------------------
Gestion des données reçues par formulaire
--------------------------------------- */
var fs = require('fs');
var ejs = require('ejs');

function formulaireResa(req, res) {
  var nom = req.body.nom;
  var nbrInvit = req.body.nbrInvit;
  var mail = req.body.mail;
  var tel = req.body.tel;
  var date = req.body.date;
  var heure = req.body.heure;

  //console.log("\nRequete reçue :\nnom:"+nom+",\nnombre d'invités:"+nbrInvit+",\nmail:"+mail+",\nnuméro de téléphone:"+tel+",\ndate:"+date+",\nheure:"+heure);

  var valide = true;
  var message = "";

  if(nom=="") {
    valide = false;
    message += "-Nom invalide.</br>";
  }
  if(nbrInvit<1 || nbrInvit>15){
    valide = false;
    message += "-Le nombre d'invités doit-être compris entre 1 et 15.</br>";
  }
  if(mail=="") {
    valide = false;
    message += "-Veuillez renseigner votre e-mail.</br>";
  }
  if(tel=="") {
    valide = false;
    message += "-Veuillez renseigner votre numéro de téléphone.</br>";
  }
  if(date=="") {
    valide = false;
    message += "-Veuillez indiquer une date pour la réservation.</br>";
  }
  if(heure==""){
    valide = false;
    message += "-Veuillez indiquer une heure.</br>";
  }

  if(valide) {
    var tabReq = [nom,mail,tel,nbrInvit,date,heure];
    return tabReq;
  } else {
    res.render('pages/reservation', {message_info: message});
    var tabReq = null;
    return tabReq;
  }
};

function formulaireConn(req, res) {
  var pseudo = req.body.pseudo;
  var mdp = req.body.mdp;

  var valide = true,
      message = "";
  //On vérifie les valeurs rentrées
  if(pseudo== "") {
    valide = false;
    message += "-Le pseudo ne peut pas être vide.</br>"
  }
  if(mdp== "") {
    valide = false;
    message += "-Le mot de passe doit-être renseigné.</br>"
  }

  //Si invalide on renvoie avec message contenant les erreurs
  if(!valide) {
    res.render('pages/connexion', {message_info: message});
  }
  //Si undefined on renvoie la page sans rien (1er accès, var pseudo et mdp undefined)
  if((mdp == undefined) || (pseudo == undefined)) {
    res.render('pages/connexion');
    var valide = false;
    var tabReq = [valide];
  } else {
    var tabReq = [valide,pseudo,mdp];
  }
  return tabReq;
};

function formulaireInscr(req, res) {
  var prenom = req.body.prenom;
  var nom = req.body.nom;
  var pseudo = req.body.pseudo;
  var mail = req.body.mail;
  var mdp = req.body.mdp;
  var mdpConf = req.body.mdpConf;

  var valide = true,
      message = "";

  if(prenom=="") {
    valide = false;
    message += "-Veuillez indiquer votre prénom.</br>";
  }
  if(nom=="") {
    valide = false;
    message += "-Veuillez indiquer votre nom.</br>";
  }
  if(pseudo=="") {
    valide = false;
    message += "-Veuillez choisir un pseudo.</br>";
  }
  if(mail=="") {
    valide = false;
    message += "-Veuillez indiquer votre e-mail.</br>";
  }
  if(mdp=="") {
    valide = false;
    message += "-Veuillez définir un mot de passe.</br>";
  }
  if(mdp!=mdpConf) {
    valide = false;
    message += "-Les mots de passe sont différents";
  }

  if(!valide) {
    res.render('pages/inscription', { message_info: message});
    return null;
  } else {
    var tabReq = [prenom,nom,pseudo,mail,mdp];
    return tabReq;
  }
};



function formulaireAjout(req, res) {
  var nom = req.body.nom;
  var descr = req.body.descr;
  var urlIm = null;
  var prix = req.body.prix;
  var comm = req.body.comm;


  var valide = true,
      message = "";

  if(nom=="" || nom==undefined) {
    valide = false;
    message += "-Veuillez indiquer le nom du plat.</br>";
  }
  if(prix==0 || prix==undefined) {
    valide = false;
    message += "-Veuillez choisir un prix.</br>";
  }

  if(!valide) {
    res.render('pages/administration', { message_info: message});
    return null;
  } else {
    var tabReq = [nom,descr,urlIm,comm,prix];
    return tabReq;
  }
};

exports.formulaireResa = formulaireResa;
exports.formulaireConn = formulaireConn;
exports.formulaireInscr = formulaireInscr;
exports.formulaireAjout = formulaireAjout;
