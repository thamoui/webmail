angular.module("MailServiceRest", [ "ngResource" ])
.factory("mailService", function($resource) {
	
	var URL_API = "http://localhost/api/";

	// var serviceRecupMails = $resource(URL_API + "dossiers/:idDossier/:idMail");
	// var serviceEnvoiMail = $resource(URL_API + "envoiMail");
	var serviceRest = $resource(URL_API + "dossiers", null,
		{ 
			"getDossiers" : { method: "GET", isArray: true },
			"getDossier" : { method: "GET", isArray: false, url: URL_API + "dossiers/:idDossier" },
			"getMail" : { method: "GET", isArray: false, url: URL_API + "dossiers/:idDossier/:idMail" },
			"envoiMail" : { method: "POST", url: URL_API + "envoi" }
		});

	// return {
	// 	getDossiers: function() {
	// 		return serviceRecupMails.query();
	// 	},
	// 	getDossier: function(valDossier) {
	// 		return serviceRecupMails.get({idDossier: valDossier});
	// 	},
	// 	getMail: function(valDossier, idMail) {
	// 		return serviceRecupMails.get({idDossier: valDossier, idMail: idMail});
	// 	},
	// 	envoiMail: function(mail) {
	// 		serviceEnvoiMail.save(mail, function() {
	// 			alert("Le mail a bien été envoyé !")
	// 		}, function(response) {
	// 			alert("Erreur " + response.status + " lors de l'envoi de mail : " + response.data);
	// 		});		
	// 	}
	// };

	return {
		getDossiers: function() {
			return serviceRest.getDossiers();
		},
		getDossier: function(valDossier) {
			return serviceRest.getDossier({idDossier: valDossier});
		},
		getMail: function(valDossier, idMail) {
			return serviceRest.getMail({idDossier: valDossier, idMail: idMail});
		},
		envoiMail: function(mail) {
			serviceRest.envoiMail(mail, function() {
				alert("Le mail a bien été envoyé !")
			}, function(response) {
				alert("Erreur " + response.status + " lors de l'envoi de mail : " + response.data);
			});
			
		}
	};

})