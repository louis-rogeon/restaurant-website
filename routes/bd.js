
function insereResa(connection, tabReq, res) { //tabReq = [nom,mail,tel,nbrInvit,date,heure];
  /* -----------
  INSERT Client
  ----------- */
  //On verifie que le client n'existe pas déjà dans la bd
  connection.query("SELECT * FROM Client WHERE nom=? AND email=? AND telephone=?;", [tabReq[0],tabReq[1],tabReq[2]], function(error, rows) {
    if(error) {
      throw error;
      console.log("Erreur lors de l'insertion du client.");
      var message = "-<strong>Erreur lors de l'ajout du client'</strong : "+error2.message+".</br>";
      res.render('pages/reservation', {message_alert: message});
    }
    //Aucun client similaire retrouvé
    else if(rows.length == 0){
      var req = "INSERT INTO Client VALUES (null,'"+tabReq[0]+"','"+tabReq[1]+"','"+tabReq[2]+"');";


      connection.query(req, function(error1, results) {
        if(error1==null) {
          console.log("Insertion du client réussie.");
          /* ---------------
          INSERT Reservation
          ---------------- */
          var idClient = results.insertId;
          var datetime = tabReq[4]+" "+tabReq[5];
          var req = "INSERT INTO Reservation VALUES (null,"+idClient+","+tabReq[3]+",'"+datetime+"');";

          connection.query(req, function(error2, rows) {
            if(error2==null) {
              console.log("Insertion de la réservation réussie.");
              res.render('pages/reservation-complete');
            } else {
              console.log("Erreur insertion réservation : "+error2);
              var message = "-<strong>Erreur lors de la réservation</strong : "+error2.message+".</br>";
              res.render('pages/reservation', {message_alert: message});
            }
          });

        } else {
          console.log("Erreur insertion client : "+error1);
          var message = "-<strong>Erreur lors de la réservation</strong : "+error1.message+".</br>";
          res.render('pages/reservation', {message_alert: message});
        }
      });


      //Le client existe deja
    } else {
      connection.query("SELECT id_Client FROM Client WHERE nom=? AND email=? AND telephone=?;",[tabReq[0],tabReq[1],tabReq[2]], function(error, results) {
        if(error) {
          throw error;
          console.log("Erreur insertion réservation : "+error);
          var message = "-<strong>Erreur lors de la réservation</strong : "+error.message+".</br>";
          res.render('pages/reservation', {message_alert: message});
        } else {
          var idClient = results[0].id_Client;
          var datetime = tabReq[4]+" "+tabReq[5];
          var req = "INSERT INTO Reservation VALUES (null,"+idClient+","+tabReq[3]+",'"+datetime+"');";

          connection.query(req, function(error2, rows) {
            if(error2==null) {
              console.log("Insertion de la réservation réussie.");
              res.render('pages/reservation-complete');
            } else {
              console.log("Erreur insertion réservation : "+error2);
              var message = "-<strong>Erreur lors de la réservation</strong : "+error2.message+".</br>";
              res.render('pages/reservation', {message_alert: message});
            }
          });

        }
      });
    }
  });
  connection.commit();
};

function getAdminTemp(connection, res) {
  connection.query("SELECT * FROM Admin_temp;", function(error , rows) {
    if(error) {
      throw error;
      res.render('pages/administration');
    } else if(rows.length!=0) {
      var resJson = JSON.stringify(rows);
      res.render('pages/administration', {resJson: resJson});//tabJSON: tabJSON});
    } else {
      res.render('pages/administration');
    }
  });
};

function estAdmin(connection, infos, res) { //infos = [valide,pseudo,mdp];
  req = "SELECT * FROM Admin WHERE pseudo=? AND mdp=?;";
  bool = false
  connection.query(req, [infos[1],infos[2]], function(error, rows, next) {
    if(error) {
      throw error;
      console.log("Erreur lors de la vérification du compte admin : "+error);
    } else {
      if(rows.length != 0) {
        //connecté en admin, on prend les infos a afficher sur la page et on les renvoient
        //On écrit le cookie pour se rappeller du pseudo
        res.cookie("uti", {pseudo: infos[1], mdp: infos[2]}, { maxAge: 900000, signed: true, httpOnly: true});
        getAdminTemp(connection, res);
      } else {
        res.render('pages/connexion', {message_alert: "-Aucun compte admin associé à ce pseudo et ce mot de passe.</br>"});
      }
    }
  });
};

function insereAdminTemp(connection, tabReq, res) { //tabReq = [prenom,nom,pseudo,mail,mdp];
  //On vérifie que le pseudo n'apparait pas deja dans la BALISES
  connection.query("SELECT * FROM Admin WHERE pseudo=?;", [tabReq[2]], function(error, rows) {
    if(error) {
      throw error;
      console.log("Erreur insertion administrateur temporaire : "+erreur);
      var message = "-<strong>Erreur lors de la réservation</strong : "+erreur.message+".</br>";
      res.render('pages/inscription', {message_alert: message});
    } else if(rows.length==0) { // pseudo non prsent dans Admin


      connection.query("SELECT * FROM Admin_temp WHERE pseudo=?;", [tabReq[2]], function(err, results) {
        if(err) {
          throw err;
          console.log("Erreur insertion administrateur temporaire : "+erreur);
          var message = "-<strong>Erreur lors de la réservation</strong : "+erreur.message+".</br>";
          res.render('pages/inscription', {message_alert: message});
        } else if(results.length==0) { // pseudo non présents dans Admin_temp;
          //On insere

          var req = "INSERT INTO Admin_temp VALUES(null,'"+tabReq[2]+"','"+tabReq[4]+"','"+tabReq[0]+"','"+tabReq[1]+"','"+tabReq[3]+"');";
          connection.query(req, function(erreur, lignes) {
            if(erreur) {
              throw erreur;
              console.log("Erreur insertion administrateur temporaire : "+erreur);
              var message = "-<strong>Erreur lors de la réservation</strong : "+erreur.message+".</br>";
              res.render('pages/inscription', {message_alert: message});
            } else {
              console.log("Insertion d'administrateur temporaire réussi.");
              res.render('pages/inscription-complete');
            }
          });

        } else { // pseudo déjà existant
          var message = "-Le pseudo choisit existe déjà, veuillez en choisir un autre.</br>";
          res.render('pages/inscription', {message_alert: message});
        }
      });


    } else { // pseudo déjà existant
      var message = "-Le pseudo choisit existe déjà, veuillez en choisir un autre.</br>";
      res.render('pages/inscription', {message_alert: message});
    }
  });
};

function ajoutPlat(connection, tabReq, res) {// tabReq = [libzllé,descr,urlIm,comm,prix];
  connection.query("SELECT * FROM Plat WHERE libelle=?;", [tabReq[0]], function(err, results) {
    if(err) {
      throw err;
      console.log("Erreur insertion du plat : "+err);
      var msg = "<strong>Erreur lors de l'insertion du plat</strong> :"+err.message;
      res.render('pages/administration', {message_alert: msg});
    } else if(results.length==0) {//Aucun plat du meme nom on insere
      var req = "INSERT INTO Plat VALUES(null,"+connection.escape(tabReq[0])+","+connection.escape(tabReq[1])+","+connection.escape(tabReq[2])+","+connection.escape(tabReq[3])+","+tabReq[4]+");";
      connection.query(req, function(error, rows) {
        if(error) {
          console.log("Erreur insertion du plat : "+error);
          throw error;
          var msg = "<strong>Erreur lors de l'insertion du plat</strong> :"+error.message;
          res.render('pages/administration', {message_alert: msg});
        } else {//Insertion réussie
          console.log("Insertion d'un nouveau plat réussie.");
          res.render('pages/administration', {message_conf: "Le plat a bien été ajouté ! Il apparaitra dorénavant sur la page <em>Spécialités</em du site."});
        }
      });
    } else {//Plat déjà existant
      console.log("Erreur insertion du plat : le plat existe déjà.");
      res.render('pages/administration', {message_alert: "Le plat existe déjà ! Veuillez choisir un autre nom ou supprimer le plat obsolète du site"});
    }
  });
};

function getSpecialites(connection, res) {
  connection.query("SELECT * FROM Plat;", function(error, rows) {
    if(error) {
      throw error;
      res.render('pages/specialites', {message_inf: "<strong>Erreur lors de la récupération des spécialités</strong> : "+error.message});
    } else if(rows.length != 0){
      tabJson = JSON.stringify(rows);
      res.render('pages/specialites', {tabJson: tabJson});
    } else {//Rien a afficher
      res.render('pages/specialites', {message_inf: "Auncun plat à afficher..."});
    }
  });
};


exports.insereResa = insereResa;
exports.estAdmin = estAdmin;
exports.insereAdminTemp = insereAdminTemp;
exports.ajoutPlat = ajoutPlat;
exports.getSpecialites = getSpecialites;
