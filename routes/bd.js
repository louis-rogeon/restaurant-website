
function insereResa(connection, tabReq, res) { //tabReq = [nom,mail,tel,nbrInvit,date,heure];
  /* -----------
  INSERT Client
  ----------- */
  //On verifie que le client n'existe pas déjà dans la bd
  connection.query("SELECT * FROM Client WHERE nom=? AND email=? AND telephone=?;", [tabReq[0],tabReq[1],tabReq[2]], function(error, rows) {
    if(error) {
      console.log("Erreur lors de l'insertion du client.");
      res.render('pages/reservation', {message_warning: error.message});
      throw error;
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
              res.render('pages/reservation', {message_success: "<strong>Votre réservation a bien été prise en compte.</strong><br/>Un email de confirmation sera envoyé, dans le cas contraire un appel vous sera passé de l'équipe du restaurant."});
            } else {
              console.log("Erreur insertion réservation : "+error2);
              res.render('pages/reservation', {message_warning: error2.message});
              throw error2;
            }
          });

        } else {
          console.log("Erreur insertion client : "+error1);
          res.render('pages/reservation', {message_warning: error1.message});
          throw error1;
        }
      });


      //Le client existe deja
    } else {
      connection.query("SELECT id_Client FROM Client WHERE nom=? AND email=? AND telephone=?;",[tabReq[0],tabReq[1],tabReq[2]], function(error, results) {
        if(error) {
          console.log("Erreur insertion réservation : "+error);
          res.render('pages/reservation', {message_warning: error.message});
          throw error;
        } else {
          var idClient = results[0].id_Client;
          var datetime = tabReq[4]+" "+tabReq[5];
          var req = "INSERT INTO Reservation VALUES (null,"+idClient+","+tabReq[3]+",'"+datetime+"');";

          connection.query(req, function(error2, rows) {
            if(error2==null) {
              console.log("Insertion de la réservation réussie.");
              res.render('pages/reservation', {message_success: "<strong>Votre réservation a bien été prise en compte.</strong><br/>Un email de confirmation sera envoyé, dans le cas contraire un appel vous sera passé de l'équipe du restaurant."});
            } else {
              console.log("Erreur insertion réservation : "+error2);
              res.render('pages/reservation', {message_warning: error2.message});
              throw error2;
            }
          });

        }
      });
    }
  });
};

function getPlats(connection, res, adminsTemp, reservations) {//adminsTemps contient demandes de validation admin, reservations a les reservations en cours
    connection.query("SELECT * FROM Plat;", function(error, rows) {
      if(error) {
        res.render('pages/administration', {resJson: adminsTemp, resas: reservations});
        throw error;
      } else if(rows.length != 0) {//plats a afficher
        var plats = JSON.stringify(rows);
        res.render('pages/administration', {resJson: adminsTemp, resas: reservations, plats: plats});
      } else {
        res.render('pages/administration', {resJson: adminsTemp, resas: reservations});
      }
    })
}

function getReservations(connection, res, adminsTemp) {//adminsTemps objet json contenant les demandes d'admin si existantes, sinon null
  connection.query("SELECT nom, email, telephone, nbr_Invites, DAYOFMONTH(date_Resa) as jour, MONTH(date_Resa) as mois, YEAR(date_Resa) as annee, TIME(date_Resa) as heure FROM Reservation NATURAL JOIN Client ORDER BY annee, mois, jour;", function(error, rows) {
    if(error) {
      var reservations = null;
      getPlats(connection, res, adminsTemp, reservations);
      throw error;
    } else if(rows.length!=0) {//Résas à afficher
      var reservations = JSON.stringify(rows);
      getPlats(connection, res, adminsTemp, reservations);
    } else {
      var reservations = null;
      getPlats(connection, res, adminsTemp, reservations);
    }
  });
};

function getAdminTemp(connection, res) {
  connection.query("SELECT * FROM Admin_temp;", function(error , rows) {
    if(error) {
      var adminsTemp = null;
      getReservations(connection, res, adminsTemp);
      throw error;
    } else if(rows.length!=0) {
      var adminsTemp = JSON.stringify(rows);
      getReservations(connection,res,adminsTemp);/*
      */
    } else {
      var adminsTemp = null;
      getReservations(connection, res, adminsTemp);
    }
  });
};

function estAdmin(connection, infos, res) { //infos = [valide,pseudo,mdp];
  req = "SELECT * FROM Admin WHERE pseudo=? AND mdp=?;";
  bool = false
  connection.query(req, [infos[1],infos[2]], function(error, rows, next) {
    if(error) {
      console.log("Erreur lors de la vérification du compte admin : "+error);
      res.render('pages/connexion', {message_warning: error.message});
      throw error;
    } else {
      if(rows.length != 0) {
        //connecté en admin, on prend les infos a afficher sur la page et on les renvoient
        //On écrit le cookie pour se rappeller du pseudo
        res.cookie("uti", {pseudo: infos[1], mdp: infos[2]}, { maxAge: 900000, signed: true, httpOnly: true});
        getAdminTemp(connection, res);
      } else {
        res.render('pages/connexion', {message_info: "Aucun compte admin associé à ce pseudo et ce mot de passe.</br>"});
      }
    }
  });
};

function insereAdminTemp(connection, tabReq, res) { //tabReq = [prenom,nom,pseudo,mail,mdp];
  //On vérifie que le pseudo n'apparait pas deja dans la BALISES
  connection.query("SELECT * FROM Admin WHERE pseudo=?;", [tabReq[2]], function(error, rows) {
    if(error) {
      console.log("Erreur insertion administrateur temporaire : "+erreur);
      res.render('pages/inscription', {message_warning: err.message});
      throw error;
    } else if(rows.length==0) { // pseudo non prsent dans Admin


      connection.query("SELECT * FROM Admin_temp WHERE pseudo=?;", [tabReq[2]], function(err, results) {
        if(err) {
          console.log("Erreur insertion administrateur temporaire : "+erreur);
          res.render('pages/inscription', {message_warning: err.message});
          throw err;
        } else if(results.length==0) { // pseudo non présents dans Admin_temp;
          //On insere

          var req = "INSERT INTO Admin_temp VALUES(null,'"+tabReq[2]+"','"+tabReq[4]+"','"+tabReq[0]+"','"+tabReq[1]+"','"+tabReq[3]+"');";
          connection.query(req, function(erreur, lignes) {
            if(erreur) {
              console.log("Erreur insertion administrateur temporaire : "+erreur);
              res.render('pages/inscription', {message_warning: err.message});
              throw erreur;
            } else {
              console.log("Insertion d'administrateur temporaire réussi.");
              res.render('pages/inscription', {message_success: "<strong>Inscription réussie.<br/>ATTENTION :</strong>La validation par un compte administrateur est <strong>obligatoire</strong> pour bénéficier des privilèges administrateur."});
            }
          });

        } else { // pseudo déjà existant
          var message = "Le pseudo choisit existe déjà, veuillez en choisir un autre.</br>";
          res.render('pages/inscription', {message_info: message});
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
      console.log("Erreur insertion du plat : "+err);
      res.render('pages/administration-complete-task', {message_alert: err.message});
      throw err;
    } else if(results.length==0) {//Aucun plat du meme nom on insere
      var req = "INSERT INTO Plat VALUES(null,"+connection.escape(tabReq[0])+","+connection.escape(tabReq[1])+","+connection.escape(tabReq[2])+","+connection.escape(tabReq[3])+","+tabReq[4]+");";
      connection.query(req, function(error, rows) {
        if(error) {
          console.log("Erreur insertion du plat : "+error);
          res.render('pages/administration-complete-task', {message_alert: error.message});
          throw error;
        } else {//Insertion réussie
          console.log("Insertion d'un nouveau plat réussie.");
          res.render('pages/administration-complete-task', {message_success: "Le plat a bien été ajouté ! Il apparaitra dorénavant sur la page <em>Spécialités</em du site."});
        }
      });
    } else {//Plat déjà existant
      console.log("Erreur insertion du plat : le plat existe déjà.");
      res.render('pages/administration-complete-task', {message_info: "Le plat existe déjà ! Veuillez choisir un autre nom ou supprimer le plat obsolète du site"});
    }
  });
};

function getSpecialites(connection, res) {
  connection.query("SELECT * FROM Plat;", function(error, rows) {
    if(error) {
      res.render('pages/specialites', {message_warning: "error.message"});
      //throw error;
    } else if(rows.length != 0){
      tabJson = JSON.stringify(rows);
      res.render('pages/specialites', {tabJson: tabJson});
    } else {//Rien a afficher
      res.render('pages/specialites', {message_info: "Auncun plat à afficher..."});
    }
  });
};

function supprimeAdminTemp(connection, pseudo, res) {//pseudo de l'admin_temp
  connection.query("SELECT * FROM Admin_temp WHERE pseudo=?", pseudo, function(err, rows) {
    if(err) {
      console.log("Erreur suppression de l'admin temporaire:"+err);
      res.render('pages/administration-complete-task', {message_warning: err.message}); //render('pages/administration', {message_alert: "<strong>Erreur lors de l'ajout de l'admin</strong> : "+err.message});
      throw err;
    } else if(rows.length!=0) {//L'admintemp correspondant au pseudo existe bien
      connection.query("DELETE FROM Admin_temp WHERE pseudo='"+pseudo+"';", function(error, results) {
        if(error) {
          console.log("Erreur suppression de l'admin temporaire :"+error);
          res.render('pages/administration-complete-task', {message_warning: error.message});//render('pages/administration', {message_alert: "<strong>Erreur lors de l'ajout de l'admin</strong> : "+error.message});
          throw error;
        } else { //Admin temporaire effacé
          console.log("suppression de l'admin temporaire réussie.");
          res.render('pages/administration-complete-task', {message_success: "L'admin temporaire a bien été supprimé."});
        }
      });
    } else {//mauvais pseudo
      res.render('pages/administration-complete-task', {message_info: "Le pseudo de l'admin temporaire à supprimer n'existe pas."});//render('pages/administration', {message_alert: "Le pseudo de l'url ne correspond à aucun admin temporaire.<br/>"});
    }
  });
};

function insereAdmin(connection, pseudo, res) {
  connection.query("SELECT * FROM Admin_temp WHERE pseudo=?", pseudo, function(err, rows) {
    if(err) {
      console.log("Erreur insertion de l'admin :"+err);
      res.render('pages/administration-complete-task', {message_warning: err.message}); //render('pages/administration', {message_alert: "<strong>Erreur lors de l'ajout de l'admin</strong> : "+err.message});
      throw err;
    } else if(rows.length!=0) {//L'admintemp correspondant au pseudo existe bien
      var req = "INSERT INTO Admin VALUES(null,?,?,?,?,?);";
      connection.query(req, [rows[0].pseudo,rows[0].mdp,rows[0].prenom,rows[0].nom,rows[0].email], function(error, results) {
        if(error) {
          console.log("Erreur insertion de l'admin : "+error);
          res.render('pages/administration-complete-task', {message_warning: error.message});//render('pages/administration', {message_alert: "<strong>Erreur lors de l'ajout de l'admin</strong> : "+error.message});
          throw error;
        } else {
          //Insertion Admin réussie on efface l'admin temporaire
          connection.query("DELETE FROM Admin_temp WHERE pseudo=?", rows[0].pseudo, function(er, resu) {
            if(er) {
              console.log("Erreur insertion de l'admin :"+er);
              res.render('pages/administration-complete-task', {message_warning: er.message});//render('pages/administration', {message_alert: "<strong>Erreur lors de l'ajout de l'admin</strong> : "+er.message});
              throw er;
            } else {
              console.log("Insertion admin effectuée avec succès.");
              res.render('pages/administration-complete-task',{message_success: "Admin inséré avec succès."});//render('pages/administration', {message_conf: "Administrateur ajouté avec succès.<br/>."});
            }
          });
        }
      });
    } else {//mauvais pseudo
      res.render('pages/administration-complete-task',{message_info: "Le pseudo ne correspond pas à un admin temporaire existant."});//render('pages/administration', {message_alert: "Le pseudo de l'url ne correspond à aucun admin temporaire.<br/>"});
    }
  });
};

function supprimePlat(connection, idPlat, res) {
  connection.query("SELECT * FROM Plat WHERE id=?", idPlat, function(err, rows) {
    if(err) {
      console.log("Erreur suppression du plat :"+err);
      res.render('pages/administration-complete-task', {message_warning: err.message});
      throw err;
    } else if(rows.length!=0) {//Le plat correspondant a l'id existe bien
      connection.query("DELETE FROM Plat WHERE id='"+idPlat+"';", function(error, results) {
        if(error) {
          console.log("Erreur suppression du plat :"+error);
          res.render('pages/administration-complete-task', {message_warning: err.message});
          throw error;
        } else { //Admin temporaire effacé
          console.log("suppression du plat réussie.");
          res.render('pages/administration-complete-task', {message_success: "Suppression du plat de l'affichage du site confirmée."});
        }
      });
    } else {//mauvais pseudo
      res.render('pages/administration-complete-task', {message_info: "Aucun plat correspondant n'a été trouvé"});
    }
  });
};

exports.insereResa = insereResa;
exports.estAdmin = estAdmin;
exports.insereAdminTemp = insereAdminTemp;
exports.ajoutPlat = ajoutPlat;
exports.getSpecialites = getSpecialites;
exports.insereAdmin = insereAdmin;
exports.supprimeAdminTemp = supprimeAdminTemp;
exports.supprimePlat = supprimePlat;
