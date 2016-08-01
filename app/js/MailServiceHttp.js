angular.module("MailServiceHttp", [])
.factory("mailService", function($http) {
	
	var URL_API = "http://localhost/api/";

	return {
		getDossiers: function() {
			var promesse = $http.get(URL_API + "dossiers");
			var resultat = [];
			
			promesse.then(function(reponse) {
				angular.extend(resultat, reponse.data);
			}, function(erreur) {
				alert("Erreur " + erreur.status + " lors de la récupération des dossiers : " + erreur.data);
			});
			// parler de success et error au lieu de then
			return resultat;
		},
		getDossier: function(valDossier) {
			var promesse = $http.get(URL_API + "dossiers/" + valDossier);
			var resultat = {};
			
			promesse.then(function(reponse) {
				angular.extend(resultat, reponse.data);
			}, function(erreur) {
				alert("Erreur " + erreur.status + " lors de la récupération du dossier " + valDossier + " : " + erreur.data);
			});

			return resultat;
		},
		getMail: function(valDossier, idMail) {
			var promesse = $http.get(URL_API + "dossiers/" + valDossier + "/" + idMail);
			var resultat = {};
			
			promesse.then(function(reponse) {
				angular.extend(resultat, reponse.data);
			}, function(erreur) {
				alert("Erreur " + erreur.status + " lors de la récupération du mail " + idMail + " dans le dossier " + valDossier + " : " + erreur.data);
			});

			return resultat;
		},
		envoiMail: function(mail) {

			var promesse = $http.post(URL_API + "envoi", mail);

			promesse.error(function(erreur) {
				alert("Erreur " + erreur.status + " lors de l'envoi de mail : " + erreur.data);
			});
		}
	}
})