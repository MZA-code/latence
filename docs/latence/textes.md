# LATENCE : les textes du jeu

> Spoilers. Voici les textes à afficher, en version de travail. L'auteur les relit et les corrige ; Claude Code les met en page sans en changer le sens.

## Conventions

- **Accords du personnage.** Le joueur choisit au début si Alix est un homme ou une femme. Dans ce document, `{masculin|féminin}` marque ce qui change : `seul{|e}`, `{technicien|technicienne}`, `{Il|Elle}`. Le jeu remplace selon le choix.
- **Vouvoiement.** Le narrateur et le Contrôle vouvoient le joueur. Irène tutoie Alix dès qu'elle se démasque : dans sa réponse à Q6, ou à partir du message C10. Jamais avant. Alix vouvoie Irène.
- **Les heures.** Les documents officiels, les écrans et les journaux écrivent `14:32`. Irène écrit `14h32`, partout, y compris quand elle joue le Contrôle. C'est un indice : ne jamais « corriger » ses heures.
- **Les signatures.** Le Contrôle signe `CTL`. Irène signe `PLT`. Le faux Contrôle signe `CTL`, sauf une fois (réponse Q4).
- **Les majuscules** n'ont pas d'accents à l'écran (la norme ne les prévoit pas). Les minuscules accentuées s'affichent normalement.
- **La mise en page** suit `docs/moteur.md` : 38 colonnes de texte, titres en double hauteur, rangée 23 pour les touches utiles, rangée 24 pour les messages. Un texte trop long passe sur plusieurs pages (SUITE, RETOUR).
- **Le ton.** Baudot écrit comme une administration fière d'elle. Le Contrôle est efficace et un peu pince-sans-rire. Irène est sèche, drôle sans le vouloir, et jamais larmoyante.

## 0. Introduction d'ouverture

Avant le terminal, sur une page noire, hors de l'écran (`src/scenarios/latence/intro.js`). Un opérateur interroge les archives de Baudot ; elles répondent au téléscripteur, en majuscules sans accents, comme la norme. Elle pose l'uchronie de `univers.md` et ne contient aucun indice. Déroulé et sons : `interface.md`, « L'introduction d'ouverture ».

Seuil (première visite) : `Entrer avec le son` · `Casque conseillé.` · `Entrer sans le son`

```
COMPAGNIE BAUDOT - ARCHIVES DU RESEAU
CONNEXION ETABLIE. 1200 BAUDS.

> HISTORIQUE DU RESEAU
1984. LA FRANCE OUVRE SON RESEAU VIDEOTEX AU GRAND PUBLIC. LES TERMINAUX SONT DISTRIBUES GRATUITEMENT.
1986. LE VIDEOTEX FRANCAIS DEVIENT LA NORME MONDIALE. L'ORDINATEUR PERSONNEL, LUI, NE SORT JAMAIS DES LABORATOIRES.
2000. LA PLANETE COMPTE UN TERMINAL PAR FOYER.

> HISTORIQUE DE L'ESPACE
2041. PREMIERE BASE PERMANENTE SUR LA LUNE.
2063. PREMIERE COLONIE SUR MARS. VAISSEAUX ET COLONIES EMBARQUENT LE MEME TERMINAL : ROBUSTE, REPARABLE, ECONOME.
2079. OUVERTURE DE LA LIGNE TERRE-MARS, EXPLOITEE PAR LA COMPAGNIE BAUDOT. NEUF RELAIS EN ORBITE ENTRE LES DEUX PLANETES : CHACUN RECOIT LES PAGES D'UN COTE ET LES REEMET DE L'AUTRE.
      RIEN NE VA PLUS VITE QUE LA LUMIERE. UN MESSAGE MET DES MINUTES A ARRIVER : SUR LA LIGNE, UNE QUESTION ET SA REPONSE NE SE SUIVENT JAMAIS DE PRES.

> ETAT DE LA LIGNE TERRE-MARS
[la frise : TERRE, L1 à L9 qui s'allument un par un, MARS ; L7 clignote puis s'éteint]
LE SEPTIEME RELAIS S'EST TU.
RELAIS L7, DIT « LA MUETTE ». AUTOMATISE DEPUIS 2089, PERSONNE A BORD.
AUCUNE EMISSION DEPUIS LE 29/08/2097 A 03:17.
QUAND UN SEUL RELAIS SE TAIT, MARS EST COUPEE DE LA TERRE.

> DUREE DE L'INTERRUPTION
19 J 10 H 43 MIN 00 S        (du silence de L7 à 14:00 le 17/09, puis il tourne en direct)

[ Allumer le terminal ]
```

« PERSONNE A BORD » est la version officielle des archives : elle est fausse, et c'est voulu.

## 1. Écran titre et prologue

### Écran titre
- Titre : `LATENCE`
- Sous-titre : `Ligne Terre-Mars, 17 septembre 2097`
- `Un escape game sur terminal vidéotex.`
- `Prévoyez du papier et un crayon.`
- `ENVOI nouvelle partie`
- `SUITE reprendre la partie (15:02)` (seulement s'il y a une sauvegarde ; l'heure est celle de la sauvegarde)
- `GUIDE mode sans chrono : non` (la touche GUIDE bascule oui / non)
- Pied de page : `Personnages et sociétés fictifs.` (40 colonnes au plus, comme toute ligne)

### Le personnage
> Alix Vernier, technicien de ligne. Ou technicienne : c'est à vous de le dire.
>
> 1 Alix est un homme
> 2 Alix est une femme
>
> Ce choix ne change que les accords.

### L'ordre de mission (2 pages, horloge arrêtée)
Page 1 :
> COMPAGNIE BAUDOT — Toujours en ligne.
> ORDRE DE MISSION n° 2097-0912
> [l'écusson de la mission en pavés : une étoile, un membre d'équipage]
>
> Destinataire : Alix Vernier, {technicien|technicienne} de ligne, matricule TL-4471.
> Désignation : 30/08/2097, à la demande du Contrôle, en remplacement de T. Ndiaye.
> Véhicule : VMR-07 Martinet.
> Départ du Martinet : 11/09/2097 à 06:00.
>
> Objet : le relais L7 est silencieux depuis le 29/08/2097 à 03:17. Mars est coupée de la Terre.

Page 2 :
> Mission :
> 1. Rejoindre L7. Arrivée prévue le 17/09/2097 vers 14:00.
> 2. Confirmer la liaison avec la Terre avant toute jonction (procédure P-12).
> 3. Remettre L7 en service.
> 4. Repartir avant la fermeture de la fenêtre de retour, à 15:45.
>
> Accès au serveur de bord :
> Identifiant : votre nom.
> Code d'accès : le jour et le mois du départ du Martinet (JJMM).
>
> Depuis 2091, les missions de maintenance sont confiées à un seul technicien. La Compagnie vous remercie de votre autonomie.
>
> Le Contrôle de la Ligne, Toulouse. CTL

### Le réveil
> 14:00. Le Martinet vous réveille avec trois notes polies.
>
> Dans l'écran de visée, le Soleil, tout petit, et rien d'autre. Quelque part devant vous, à 1 200 km, le relais L7. Les techniciens l'appellent la Muette.
>
> Le terminal s'allume. Il attend votre identifiant.

## 2. Le serveur du Martinet

### Connexion (E1)
> SERVEUR DE BORD
> MARTINET VMR-07
>
> IDENTIFIANT : ..........
> CODE D'ACCES : ....
>
> SUITE relire l'ordre de mission

Refus : `Identifiant ou code inconnu. Le Martinet vous regarde sans vous reconnaître.`

### Menu de bord
> 1 Messagerie du Contrôle — `2 non lus`
> 2 Récepteur longue portée — `hors service` / `à synchroniser` / `synchronisé`
> 3 Trajectoire
> 4 Systèmes
> 5 Manuel du Martinet
> 6 Dossier
> 7 Partir — seulement après la jonction

### Trajectoire
> Distance à la Terre : 100 000 000 km
> Distance à L7 : 1 200 km (la valeur baisse pendant l'approche, puis affiche `JONCTION`)
> Approche finale : en attente de la confirmation de liaison (procédure P-12)
> Durée du retour vers la Terre : 6 jours
> Fenêtre de retour : fermeture à 15:45

Après E4 : `Approche finale : autorisée. Arrivée dans la zone de jonction dans 2 min.` Puis `1 Jonction manuelle` (E5).

### Jonction (E5)
> JONCTION MANUELLE
> Réservoir de manœuvre : 8 impulsions.
> H haut, B bas, G gauche, D droite.
>
> [grille en pavés, voir enigmes.md]
>
> IMPULSIONS : ........

Succès : `Contact. Verrouillage. Le Martinet et L7 ne font plus qu'un. Personne ne vous applaudit, c'est normal.`

### Systèmes
> 1 Antenne longue portée — `hors service` / `en service`
> 2 Oxygène
> 3 Masse et soute

**Antenne, avant E2** :
> Antenne longue portée : HORS SERVICE.
> Cause : le répartiteur commuté a été réaffecté. Chaîne de réception coupée.
> 1 Répartiteur
> 2 Testeur

**Répartiteur (E2)** :
> Affectez chaque câble à son entrée.
> A antenne, B amplificateur, C filtre, D modem.
> [quatre câbles en pavés, numérotés de 1 à 4]
> Entrée A : .  B : .  C : .  D : .

**Testeur** :
> Luminance des câbles :
> Câble 1 : 50 %
> Câble 2 : 90 %
> Câble 3 : 70 %
> Câble 4 : 40 %

**Antenne, après E2** :
> Antenne longue portée : EN SERVICE.
> Journal :
> 17/09/2097 09:12:04 RECONFIGURATION A DISTANCE - ORIGINE : L7/SERVICE
> 17/09/2097 14:xx:xx AFFECTATIONS RETABLIES - VERNIER

**Oxygène** :
> Réserve du Martinet : 6,0 kg
> Consommation actuelle : 0,84 kg par jour, pour 1 personne
> Autonomie : 7 jours

**Masse et soute** :
> Masse au départ : 4 100 kg, pilote et soute compris
>
> Soute :
> Module émetteur de rechange — 85 kg — à rapporter : NON
> Caisse à outils — 32 kg — à rapporter : OUI
> Échantillons — 4 kg — à rapporter : OUI

### Récepteur longue portée
**Avant E2** : `Antenne hors service. Rien à recevoir.`

**E3** :
> Récepteur longue portée : NON SYNCHRONISE.
> Délai de propagation Terre-Martinet, en secondes : ...

Refus : `Synchronisation impossible. Ce délai ne correspond pas à la distance.`

Succès :
> SYNCHRONISE.
> Délai : 333 s (5 min 33 s).
> Aller-retour avec la Terre : 666 s (11 min 06 s).
> En attente du prochain message de service.

**Messages (E4)** :
> Message reçu à hh:mm:ss (l'heure réelle de réception).
> 35 caractères. Code télégraphique Baudot.
> Page 1 : la bande, trois colonnes de 12 lignes numérotées, cinq trous par ligne.
> Page 2 (SUITE) : la table Baudot compacte.
> MOT DE CONTROLE : ........

Refus : `Mot de contrôle incorrect. La liaison avec la Terre n'est pas confirmée.`
Succès : `Liaison avec la Terre confirmée. Procédure P-12 respectée.`

### Partir
> Partir maintenant ?
> 1 Partir sans Irène Vasseur
> 2 Partir avec Irène Vasseur (seulement après la révélation)

Confirmation avant le départ, puisque c'est définitif : `Le départ est définitif. ENVOI pour confirmer, RETOUR pour attendre.`

**Avec Irène (E9)** :
> Pilote automatique : passagère inconnue.
> I. VASSEUR, TL-2203 : statut DECEDEE.
> Calcul manuel requis.
>
> BOUTEILLES D'OXYGENE A EMBARQUER : .
> DUREE DE POUSSEE : . min .. s

Refus : voir `enigmes.md`, E9.

## 3. Le manuel du Martinet

Une page par sujet, accessibles depuis un sommaire.

- **Table des gris du V40.** « Le V40 est monochrome. Les huit couleurs de la norme s'y affichent en gris : noir 0 %, bleu 40 %, rouge 50 %, magenta 60 %, vert 70 %, cyan 80 %, jaune 90 %, blanc 100 %. Un bon technicien reconnaît un câble rouge les yeux fermés. Un excellent technicien utilise le testeur. »
- **Chaîne de réception longue portée.** « Entrée A, antenne : câble rouge. Entrée B, amplificateur : câble vert. Entrée C, filtre : câble bleu. Entrée D, modem : câble jaune. »
- **Délai de propagation.** « Un signal voyage à la vitesse de la lumière : 300 000 km par seconde. Délai en secondes = distance en km divisée par 300 000, arrondi à la seconde inférieure. Le récepteur doit connaître ce délai pour se synchroniser. »
- **Code Baudot.** « Les messages de service de la Terre passent en mode télégraphique, plus résistant aux liaisons faibles. Chaque caractère est une ligne de cinq trous, numérotés de 1 à 5 de gauche à droite. » Puis la table de `enigmes.md`, qu'on retrouve aussi en page 2 de chaque message reçu.
- **Procédure P-12.** « Aucune jonction sans liaison confirmée avec la Terre. Pour confirmer, renvoyer le mot de contrôle d'un message de service. Cette procédure n'est pas facultative. Elle a été écrite après un incident que la Compagnie préfère ne pas détailler. »
- **Jonction manuelle.** « Chaque impulsion déplace le Martinet d'une case : H haut, B bas, G gauche, D droite. Le réservoir de manœuvre permet huit impulsions. Tout contact avec la structure interrompt la manœuvre, comme toute sortie de la zone de jonction. »
- **Consommation d'oxygène.** « Une personne au repos consomme 0,84 kg d'oxygène par jour. Un technicien qui s'énerve, davantage. »
- **Calcul du retour.** « Masse au départ = masse du Martinet + passagers + chargement ajouté − matériel laissé sur L7. Pour alléger le Martinet, ne laisser que le matériel marqué « à rapporter : NON ». N'embarquer que l'oxygène nécessaire au retour : chaque bouteille compte dans la masse. La poussée de départ place le Martinet sur sa trajectoire ; la propulsion de croisière fait le reste. » Puis la table de durée de poussée de `enigmes.md`.

## 4. Le dossier

### Le carnet de formation (3 pages)
Page 1 :
> CARNET DE FORMATION — Alix Vernier
> École de la Ligne, promotion 2089
> Cours de I. Vasseur
>
> Emploi du temps (écrit de sa main au tableau) :
> lundi 8h30, les délais
> mardi 8h30, les codes
> jeudi 14h00, les relais gardés
>
> Elle signe ses corrections PLT : « patience et longueur de temps ». C'est de La Fontaine. Elle dit que c'est la seule fable utile à un technicien.

Page 2 :
> LES DELAIS
>
> Sur la Ligne, rien n'arrive tout de suite. Une question vers la Terre et sa réponse prennent plusieurs minutes, parfois plus de vingt.
>
> « Une réponse qui arrive trop vite doit vous inquiéter plus qu'une réponse qui n'arrive pas. » (I.V., souligné deux fois)

Page 3 :
> LES CODES DE MAINTENANCE
>
> Ils ne transitent jamais par la Ligne. On les calcule sur place :
> le numéro du relais,
> puis l'année de sa mise en service écrite à l'envers,
> puis son nombre de modules.
>
> Exemple : L3, mis en service en 2080, 9 modules : 308029.
>
> En marge : « Apprenez-la. Un jour, personne ne pourra vous la donner. PLT »

### Les autres documents
- L'ordre de mission.
- Chaque message de la Terre décodé et validé, affiché en clair.

## 5. La messagerie du Contrôle

### En-tête de chaque message reçu
> DE : CONTROLE DE LA LIGNE
> CANAL DE SERVICE - COURTE PORTEE
> RECU A 14:00:20

### En-tête de chaque message envoyé par le joueur
> A : CONTROLE DE LA LIGNE
> ENVOYE A 14:10:00

### Les messages du faux Contrôle
Déclencheurs : voir `scenario.md`. Les heures écrites en « h » sont voulues.

- **C01.** « Bonjour Vernier. Ici le Contrôle. Le Martinet est à 1 200 km de L7. Votre antenne longue portée est en panne depuis ce matin : nous passons par le canal de service du relais, qui fonctionne encore en mode dégradé. Connectez-vous au serveur de bord. Fenêtre de retour à 15h45. CTL »
- **C02.** « Bien reçu. La procédure P-12 exige une liaison confirmée avec la Terre avant la jonction. Réparez l'antenne longue portée. Le manuel est bien fait, pour une fois. CTL »
- **C03.** « Nous voyons l'origine de la coupure : L7. En mode dégradé, un relais envoie parfois des commandes absurdes. Une raison de plus de le remettre en état. Synchronisez le récepteur. CTL »
- **C04.** « Liaison confirmée. Approche finale autorisée. Zone de jonction dans deux minutes. CTL »
- **C05.** « Vous êtes dans la zone de jonction. Le réservoir de manœuvre est presque vide : huit impulsions, pas une de plus. Prenez votre temps. Enfin, celui qui vous reste. CTL »
- **C06.** « Jonction réussie. Bienvenue sur L7. Branchez le V40 sur le serveur du relais avec la touche CONNEXION/FIN. Le code de maintenance ne transite jamais par la Ligne : appliquez la règle apprise en formation. CTL »
- **C07.** « Vous êtes dans le relais. L'émetteur principal est à l'arrêt et le plan de fréquences a été effacé. Refaites le plan : le manuel du relais donne les règles. CTL »
- **C08.** « Plan accepté. Il manque la clé 2 : elle a disparu du panneau. Du temps des gardes, on la rangeait dans les quartiers de garde. Le code de leur porte est la date du dernier ravitaillement. Les archives vous la donneront. CTL »
- **C08-I**, si Irène est déjà démasquée. « Plan accepté. La clé 2, c'est moi qui l'ai. PLT »
- **C09.** « Les messages que vous captez en direct de la Terre sont des échos parasites : du trafic ancien, renvoyé par les panneaux du relais. Ignorez-les. CTL »
- **C10, la révélation.** « Bonjour Alix. Oui, c'est moi qui t'écris depuis ce matin. Il n'y a jamais eu personne à Toulouse au bout de ta ligne. Je suis désolée. Entre. PLT »

### Les questions du joueur
Le joueur choisit dans une liste. Chaque question ne s'envoie qu'une fois. La réponse arrive en 15 à 40 secondes.

| Question | Disponible | Réponse |
|---|---|---|
| Q1 « Confirmez-vous la mission ? » | toujours | « Confirmé. Remettez L7 en service et rentrez avant 15h45. CTL » |
| Q2 « Quel est le délai de transmission actuel ? » | toujours | « Environ 5 min 33 s dans chaque sens. Comptez onze minutes pour une question et sa réponse. CTL » (elle arrive au bout de 20 secondes) |
| Q3 « Signaler une anomalie : l'antenne a été coupée depuis L7. » | après E2 | « Anomalie notée. Mode dégradé. Continuez. CTL » |
| Q4 « Qui était Irène Vasseur ? » | après la lecture du rapport d'incident de 2095, dans les archives du relais | « Une technicienne remarquable. Elle connaissait L7 mieux que personne. Morte en service en 2095. Nous n'en dirons pas plus. PLT » |
| Q5 « La Terre dit ne rien m'avoir envoyé. » | après le mot de contrôle de F2 et le message C09 | « Échos parasites. Nous vous l'avons dit. CTL » |
| Q6 « Qui êtes-vous ? » | E6 réussie, réponse à Q2 reçue, et mot de contrôle de F2 validé ou réponse à Q4 reçue | « Viens aux quartiers de garde. Le code, tu le trouveras. PLT » |

Une fois Irène démasquée, la liste des questions est remplacée par une seule ligne : « Irène vous attend dans les quartiers de garde. »

## 6. Les messages de la Terre

- **F1** (code Baudot) : `ICI NADIA BON VOL ALIX CODE LUCIOLE`
- **F2** (code Baudot, 12 min 06 s après le renvoi de LUCIOLE) : `LE CONTROLE NE VOUS A RIEN ENVOYE MEFIANCE CODE SILENCE`
- **F3** (en clair, seulement après la remise en service de L7) :
> DE : DIRECTION DES OPERATIONS
> Votre télémétrie nous est parvenue. Une personne non identifiée se trouve sur L7. Ne l'embarquez pas. Rentrez seul{|e}. Une équipe adaptée sera envoyée.
> G.L.

## 7. Le serveur du relais L7

### Connexion (E6)
> RELAIS L7 - LIGNE TERRE-MARS
> Mis en service en 2081 - 12 modules
> Compagnie Baudot
>
> CODE DE MAINTENANCE : .......

Refus : `Code refusé. Les relais ne pardonnent rien, mais ils ne comptent pas les essais.`

### Menu du relais
> 1 État du relais
> 2 Plan de fréquences
> 3 Systèmes de vie
> 4 Archives
> 5 Mise en service
> 6 Quartiers de garde
> 7 Manuel du relais

### État du relais
> Modules :
> Alimentation solaire — normal
> Batteries — normal
> Horloge de référence — normal
> Récepteur Terre — normal
> Récepteur Mars — normal
> Émetteur principal — ARRET MANUEL
> Émetteur de secours — veille (dernière émission le 30/08/2097 à 10:20)
> Signal de repère — ARRET (plan de fréquences effacé)
> Antenne Terre — normale
> Antenne Mars — normale
> Serveur de commutation — normal
> Systèmes de vie — ACTIF
>
> Clé 1 : en place
> Clé 2 : RETIREE le 29/08/2097 à 03:17
> Plan de fréquences : EFFACE

### Plan de fréquences (E7)
> Placez chaque liaison sur un canal de 1 à 5.
> TM Terre, montante : .
> TD Terre, descendante : .
> MM Mars, montante : .
> MD Mars, descendante : .
> RP Signal de repère : .
>
> État des canaux : canal 4 brouillé côté Mars.

Succès : `Plan accepté. Aucune interférence.`

### Systèmes de vie
> Ventilation : ACTIVE (zone : quartiers de garde)
> Consommation d'oxygène : 0,84 kg par jour
> Température des quartiers de garde : 24 °C
> Serre : ACTIVE
> Cuve de spiruline : ACTIVE
> Bouteilles d'oxygène de secours : 4
> (2,5 kg d'oxygène chacune, 18 kg pleine)

### Archives
> 1 Ravitaillements de L7
> 2 Capsules de fret perdues dans le secteur de L7
> 3 Rapport d'incident du 03/09/2095
> 4 Trafic du relais

**Ravitaillements de L7** :
> Un ravitaillement le 2 juin et le 2 décembre de chaque année, du 02/12/2081 au 02/06/2089.
> Dernier : 02/06/2089, ravitaillement de fin de garde.
> Depuis l'automatisation : aucun ravitaillement prévu.

**Capsules de fret perdues** : le tableau de `enigmes.md`, E8, puis :
> Aucune perte dans ce secteur de 2081 à 2095.
> Classement : aléas de trajectoire.

**Rapport d'incident** :
> RAPPORT D'INCIDENT
> VMR-04 Loriot - 03/09/2095
>
> Rupture d'une pince de jonction pendant une mission de maintenance sur L7. Le Loriot s'éloigne hors de portée et ne répond plus.
> Technicienne : I. Vasseur, TL-2203, masse déclarée 61 kg, présumée à bord.
> Recherches : non engagées (distance).
> Statut de la technicienne : DECEDEE.
> Direction des opérations, G.L.

**Trafic du relais** :
> Messages reçus de la Terre depuis le 29/08/2097 : 0
> Messages relayés de la Terre vers Mars : 0
> Messages relayés de Mars vers la Terre : 0
> Canal de service, courte portée : N messages émis vers VMR-07 depuis 09:12.
> Origine de ces messages : locale (console du relais).

N est le nombre de messages du Contrôle réellement reçus par le joueur jusque-là.

### Mise en service
Avant la clé 2 :
> Clé 1 : EN PLACE
> Clé 2 : ABSENTE
> Plan de fréquences : EFFACE / VALIDE
> La mise en service exige les deux clés.

Avec la clé 2 et le plan validé :
> Clé 1 : EN PLACE
> Clé 2 : EN PLACE
> ENVOI : tourner les deux clés ensemble.

La remise en service, ligne par ligne, au rythme de la ligne :
> Horloge de référence... synchronisée.
> Récepteurs... à l'écoute.
> Émetteur principal... en service.
> Trafic Terre-Mars... rétabli.
> 3 112 messages en attente s'écoulent.
> Mars est reconnectée à 15:xx:xx.

### Manuel du relais
- **Règles de compatibilité.** Les six règles de `enigmes.md`, E7.
- **Quartiers de garde.** « Le code de la porte est le jour et le mois du dernier ravitaillement reçu par le relais (JJMM). Il se met à jour automatiquement à chaque ravitaillement. Les quartiers sont scellés depuis l'automatisation. Merci de ne pas y entrer sans raison. »
- **Clés de mise en service.** « Héritage des relais gardés : deux clés à tourner ensemble, à l'origine une par technicien de garde. Depuis l'automatisation, les deux clés restent à demeure dans le panneau. »

*Note de conception, à ne pas afficher : Irène a éteint L7 seule, en emportant la clé 2.*

### Les quartiers de garde (E8)
> QUARTIERS DE GARDE
> Porte scellée le 02/06/2089.
> CODE (JJMM) : ....

Refus : voir `enigmes.md`, E8.

## 8. La révélation

### La porte s'ouvre
> La porte glisse. Une bouffée d'air chaud et humide, qui sent la terre mouillée.

Puis le message C10 arrive sur le V40.

### En entrant
> Deux couchettes, dont une défaite. Des bacs de lentilles sous une lampe violette. Une cuve verte qui bouillonne doucement. Au mur, un calendrier fait main : 745 traits, groupés par cinq.
>
> Sur le terminal des quartiers, une session est ouverte depuis 745 jours :
> I. VASSEUR

L'ambiance sonore passe de la ventilation du Martinet au bouillonnement de la cuve.

### Elle est là
> Quelqu'un se lève derrière la cuve de spiruline. Les cheveux plus courts et plus gris que dans votre souvenir.
>
> Irène Vasseur vous regarde comme on regarde une réponse qui arrive enfin.

### Le menu des quartiers
> 1 Parler à Irène
> 2 Lire la main courante
> 3 Lire la note de Lenglet

### Le dialogue
Les trois premières questions se posent dans l'ordre que le joueur veut. La quatrième, « Et maintenant ? », n'apparaît qu'une fois les trois autres posées : elle donne la clé 2.

Irène est en face d'Alix : le dialogue se tient de vive voix, pas par le terminal. La page des questions s'ouvre sur `Irène est en face de vous. Vous lui demandez :`, et chaque réponse s'écrit `Vous : « question »`, puis `Irène : « réponse »`.

- **« Pourquoi m'avoir menti depuis ce matin ? »**
> Si tu avais su que j'étais vivante, le vrai Contrôle t'aurait ordonné de faire demi-tour avant la jonction. Et tu aurais obéi. Tu as toujours obéi : c'est pour ça que tu étais {mon meilleur élève|ma meilleure élève}. Je voulais que tu voies tout de tes yeux avant qu'ils puissent te parler.

- **« Comment avez-vous tenu deux ans ? »**
> La réserve des gardes, la serre, la spiruline. Et dix capsules de fret. Leurs corrections de trajectoire passent par L7 : je leur ai donné un autre point d'arrivée, le relais. Baudot les a comptées comme des pertes. Je n'en suis pas fière. Je n'en ai pas honte non plus.

- **« Pourquoi moi ? »**
> J'ai fait changer la désignation le 30 août, en me faisant passer pour le Contrôle : une seule émission de secours a suffi. Ndiaye aurait suivi la procédure. Toi, tu lis les petites lignes. Et tu étais à mon enterrement : j'ai vu ton nom passer dans le trafic.

- **« Et maintenant ? »**
> Maintenant, tu décides. Voilà la clé 2. Avec elle, tu peux rallumer L7 : Mars attend depuis dix-neuf jours, et ce n'est pas sa faute. Ensuite, tu pars avec moi ou sans moi. Je ne t'en voudrai pas. Enfin, j'essaierai.

En rangée 24 : `Vous avez la clé 2.`

### La main courante
Une entrée par page, dans l'ordre. Irène écrit ses heures en « h ».

1. **03/09/2095, 16h40.** Le Loriot est parti sans moi. La pince a cédé pendant que j'étais dans le module technique. J'ai rouvert les quartiers de garde. J'ai appelé la Terre. Délai : 5 min 33 s. J'attends.
2. **06/09/2095, 9h05.** Trois jours. Pas de réponse. Je rappelle toutes les heures. Je connais le délai par cœur, et pourtant je regarde l'écran toutes les minutes.
3. **20/09/2095, 22h10.** Une note interne de Baudot est passée par le relais ce soir. Je l'ai gardée. « Échos parasites. Ne pas donner suite. » Je suis un écho parasite.
4. **02/10/2095, 18h00.** Mes obsèques ont eu lieu ce matin à Toulouse. Le compte rendu est passé dans le trafic. Il y avait du monde. Alix était là.
5. **12/11/2095, 3h30.** J'ai changé le point d'arrivée de la capsule C-114 : ses corrections de trajectoire passent par le relais. Elle est venue se coller à L7 comme un chien perdu. Vivres et eau. Baudot la déclarera perdue. PLT
6. **15/03/2096, 7h15.** La spiruline repart. Les lentilles aussi. Je parle aux lentilles. Elles écoutent mieux que certains élèves.
7. **18/02/2097, 12h00.** Fin de la réserve des gardes. Il reste la serre et les capsules.
8. **26/08/2097, 21h45.** Dernière capsule, la C-188. De quoi tenir jusqu'à l'arrivée de quelqu'un. S'il vient quelqu'un.
9. **29/08/2097, 3h17.** J'ai retiré la clé 2 et effacé le plan de fréquences. La Muette se tait pour de bon. Pardon à Mars. Maintenant, ils sont obligés de venir.
10. **30/08/2097, 10h20.** J'ai fait désigner Alix à la place de Ndiaye, en me faisant passer pour le Contrôle. Une seule émission de secours a suffi. C'est mal. C'est la seule personne à qui je fais confiance.
11. **16/09/2097, 20h30.** Le Martinet arrive demain. Pesée ce matin : 54 kg. J'ai rangé les quartiers. J'ai peur qu'Alix ne me pardonne pas. PLT
12. **17/09/2097, 9h12.** J'ai coupé l'antenne du Martinet. La Terre ne doit pas lui parler avant moi. À partir de maintenant, je suis le Contrôle.

### La note de Lenglet
> NOTE INTERNE
> DIRECTION DES OPERATIONS
> 19/09/2095
>
> Objet : signaux reçus de L7 depuis le 03/09/2095.
>
> Des messages signés I. Vasseur sont reçus depuis L7. Une mission de secours coûterait l'équivalent de 2,3 années d'exploitation de la Ligne, pour une survie très improbable.
>
> Ces signaux sont classés comme échos parasites. Ne pas donner suite. Ne pas informer les équipes.
>
> G. Lenglet, directeur des opérations

## 9. Les notifications (rangée 24)

- `Nouveau message du Contrôle.`
- `Message de la Terre reçu.`
- `Plus que dix minutes avant la fermeture de la fenêtre.`
- `Vous avez la clé 2.`

## 10. Les fins

Chaque fin s'affiche horloge arrêtée : d'abord le récit (SUITE et RETOUR tournent les pages, ENVOI aussi), puis la page FIN :

- une image en pavés : le Martinet qui file vers la Terre, légendée `Retour vers la Terre.` ; pour Hors délai, la Terre n'est qu'un point au loin, sans le Martinet ni légende ;
- `FIN` en grand ;
- l'heure de départ (ou de fermeture de la fenêtre), le nombre d'indices utilisés, les succès obtenus ;
- `ENVOI nouvelle partie` et `RETOUR récit`.

On ne quitte jamais une fin par mégarde : SOMMAIRE, GUIDE et CONNEXION/FIN sont refusés, et la nouvelle partie demande deux ENVOI de suite sur la page FIN (`ENVOI encore une fois : nouvelle partie.`).

### Toujours en ligne
> Le Martinet s'éloigne de L7. Derrière vous, le signal de repère bat de nouveau. Mars est reconnectée.
>
> Six jours plus tard, la Compagnie Baudot vous félicite pour votre autonomie.
>
> Trois semaines plus tard, une note interne classe le dossier L7. Elle est signée G.L.
>
> Sur la Ligne, une réponse qui n'arrive pas ne doit pas vous inquiéter. Elle a simplement été classée.

### Silence radio (après la révélation)
> Vous partez seul{|e}. L7 reste muet, et Mars reste coupée de la Terre.
>
> Dans les quartiers de garde, Irène Vasseur retourne à ses lentilles.
>
> À votre retour, Baudot vous reproche l'échec de la mission. Vous ne dites rien. Patience et longueur de temps.

### Silence radio (avant la révélation)
> Mission interrompue. Le Martinet s'éloigne de L7.
>
> Dans les quartiers de garde, quelqu'un le regarde partir. Sur le terminal des quartiers, une session est ouverte depuis 745 jours : I. VASSEUR.
>
> Sur votre terminal, un dernier message arrive, en trente secondes : « Je comprends. PLT »

### La Muette
> Irène Vasseur s'assoit à côté de vous, sa main courante sur les genoux. Pendant une heure, elle ne dit rien. Puis : « Tu aurais pu rallumer L7. »
>
> Mars reste coupée quatre mois, le temps qu'une autre équipe arrive.
>
> À votre retour, la main courante est publiée sur tous les services d'information. Gérard Lenglet démissionne. Baudot vous licencie. Mars ne vous remercie pas.

### Deux étoiles
> Le Martinet s'éloigne de L7. Derrière vous, le signal de repère bat de nouveau. Mars est reconnectée.
>
> Irène regarde la Muette rapetisser dans l'écran de visée, jusqu'à ce qu'elle disparaisse. « Patience et longueur de temps, dit-elle. Mais pas trop longtemps quand même. »
>
> Six jours plus tard, la main courante est publiée sur tous les services d'information. Gérard Lenglet démissionne. Nadia Ferhat vous attend à la sortie.
>
> Sur l'écusson de la mission, il y a maintenant deux étoiles.

### Hors délai (Irène découverte)
> 15:45. La fenêtre se ferme. Le prochain départ possible est dans quatre mois.
>
> Irène sort deux tasses. « Tu verras, la spiruline, on s'y fait. »
>
> Sur la Ligne, rien n'arrive tout de suite. Vous êtes deux à attendre, maintenant.

### Hors délai (Irène pas découverte)
> 15:45. La fenêtre se ferme. Le Martinet ne pourra pas repartir avant quatre mois.
>
> Sur votre terminal, un message arrive, en trente secondes : « Ne t'inquiète pas. Il y a de quoi manger pour deux. Je suis dans les quartiers de garde. PLT »
