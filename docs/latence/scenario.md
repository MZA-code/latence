# LATENCE : le scénario

> Spoilers. Ce document décrit toute la partie : les règles, le déroulé, les choix du joueur et les fins. Les énigmes, leurs solutions et les objectifs sont détaillés dans `enigmes.md`, les textes dans `textes.md`.

## Le pitch, sans spoiler

Mardi 17 septembre 2097. Le relais L7, au milieu de la Ligne qui relie la Terre à Mars, ne répond plus depuis 19 jours. Vous êtes Alix Vernier, technicien ou technicienne de ligne de la Compagnie Baudot, et la seule personne à bord du petit vaisseau de maintenance Martinet. Vous avez jusqu'à 15:45 pour réparer le relais et repartir : après, la fenêtre de retour se ferme. Le Contrôle vous guide pas à pas. Mais ses réponses arrivent trop vite.

## L'histoire en entier

Le relais n'est pas en panne. Irène Vasseur, la technicienne qui a formé Alix, déclarée morte il y a deux ans, vit dans ses quartiers de garde. Baudot a entendu ses appels au secours et les a classés pour économiser une mission de secours. Elle a éteint le relais pour obliger la Compagnie à envoyer quelqu'un, elle a fait désigner Alix, et c'est elle qui joue le Contrôle depuis le matin. Le joueur le comprend peu à peu, puis décide : obéir à Baudot, la ramener, ou réussir les deux.

## Règles de jeu

### L'horloge
- La partie se joue en temps réel. L'horloge du jeu démarre à **14:00:00** et la fenêtre de retour se ferme à **15:45:00**, soit 1 h 45 de jeu.
- Le temps réel compte, parce que le délai de la lumière est réel : un aller-retour avec la Terre dure 11 min 06 s, pour le joueur aussi.
- L'horloge s'arrête sur l'écran titre, le choix du personnage, l'ordre de mission du prologue et les écrans de fin. Elle s'arrête aussi quand l'onglet est caché, comme aujourd'hui : tous les délais du jeu (réponses du Contrôle, messages de la Terre) se comptent donc sur l'horloge du jeu, pas avec des minuteries du navigateur.
- Elle s'affiche dans la rangée 00, avec les secondes : `14:23:05`.
- Une alarme se déclenche à **15:35:00** (plus que dix minutes).
- Si le Martinet n'est pas parti à 15:45:00, la partie se termine sur la fin « Hors délai ».
- Un événement prévu à une heure donnée se déclenche au premier instant où l'horloge atteint ou dépasse cette heure, même si un indice l'a fait sauter de trois minutes. Cela vaut aussi pour la fin à 15:45:00.

### Les indices
- La touche GUIDE donne un indice sur l'objectif en cours (liste des objectifs dans `enigmes.md`).
- Trois indices par objectif, du plus vague au plus précis. Chacun avance l'horloge de **3 minutes**. Un indice déjà obtenu se relit gratuitement.
- Les indices ne révèlent jamais le retournement avant que le joueur l'ait découvert.

### Le mode sans chrono
- Proposé sur l'écran titre. L'horloge tourne pour les horodatages, mais la fenêtre ne se ferme jamais et les indices ne coûtent rien. La fin « Hors délai » est impossible.

### Le personnage
- Au début de chaque partie, le joueur choisit si Alix est un homme ou une femme. Les textes s'accordent (voir la notation dans `textes.md`). Le narrateur vouvoie le joueur.

### Papier et crayon
- Annoncés sur l'écran titre. Ils servent à décoder le code Baudot et à faire les calculs.

### La sauvegarde
- La partie est sauvegardée en continu dans le navigateur.
- La touche SUITE de l'écran titre reprend la partie, horloge et découvertes comprises : à l'écran de connexion du Martinet si E1 n'est pas réussie, sinon au menu du Martinet. La connexion au relais est à refaire.
- Les succès sont rangés à part et survivent aux nouvelles parties.

## Où se trouve Alix

- **Actes I et II** : dans la cabine du Martinet, devant le V40. Après la jonction, le V40 est relié par câble au serveur du relais (touche CONNEXION/FIN).
- **Dans le relais** : pour les gestes physiques (tourner les clés dans le module technique, ouvrir la porte des quartiers de garde, entrer, parler à Irène), Alix passe dans le relais. L'écran reste le même : les pages décrivent ce qu'Alix fait sur place.
- **Les sons d'ambiance** suivent : la ventilation du Martinet jusqu'à la révélation, puis le bouillonnement doux de la cuve de spiruline des quartiers (voir `interface.md`).

## Le terminal et les deux serveurs

- **Hors connexion (indicateur F)** : le serveur de bord du Martinet. Messagerie avec le Contrôle, récepteur longue portée, trajectoire, systèmes, manuel, dossier, et, après la jonction, le départ.
- **Connecté (indicateur C)** : après la jonction, la touche CONNEXION/FIN branche le V40 sur le serveur du relais L7. FIN revient au serveur du Martinet.

Libellés de la rangée 00 :

| Situation | Libellé |
|---|---|
| Écran titre et prologue | `LATENCE` |
| Serveur du Martinet | `MARTINET VMR-07` |
| Serveur du relais | `RELAIS L7 - VERNIER` |
| Après la révélation | `RELAIS L7 - LA MUETTE` |

## Le déroulé

Les temps indiqués sont ceux d'un joueur moyen, sans indice.

### Prologue (horloge arrêtée)
1. **Écran titre.** LATENCE, le dessin de la Ligne en pavés, « ENVOI nouvelle partie », « SUITE reprendre » si une sauvegarde existe, le mode sans chrono, et la mention « Prévoyez du papier et un crayon ».
2. **Le personnage.** « Alix Vernier est : 1 un homme, 2 une femme. »
3. **L'ordre de mission**, deux pages, signé du Contrôle, avec l'écusson de la mission : une étoile, une par membre d'équipage. On y trouve la date de départ du Martinet, utile pour E1. Il reste relisible depuis l'écran de connexion (SUITE), puis dans le dossier.
4. **Le réveil.** Le Martinet réveille Alix à l'approche du relais. L'horloge démarre à 14:00:00.

### Acte I : l'approche (14:00 à 14:35)
- **E1, la connexion au serveur de bord.** Identifiant et code d'accès.
- Le Contrôle écrit dès 14:00:20 (message C01). Il guide, rassure, presse un peu.
- **E2, le répartiteur de l'antenne.** Le répartiteur commuté a été réaffecté à distance : il faut réaffecter chaque câble à son entrée, grâce à la table des gris. Le journal officiel de l'antenne montre ensuite la coupure : `17/09/2097 09:12:04 RECONFIGURATION A DISTANCE - ORIGINE : L7/SERVICE`. Le Contrôle s'empresse de l'expliquer (C03).
- **E3, le délai de propagation.** Le récepteur ne se synchronise qu'avec le bon délai : 333 secondes. L'écran affiche ensuite « Aller-retour avec la Terre : 11 min 06 s ». Le joueur a maintenant ce chiffre en tête.
- **E4, le message de service de la Terre.** Nadia l'émet toutes les dix minutes ; le premier reçu après la synchronisation s'affiche, en code Baudot. Il faut renvoyer son mot de contrôle : la procédure P-12 interdit la jonction tant que la liaison avec la Terre n'est pas confirmée. Le mot de contrôle part avec le journal de bord du Martinet.
- L'approche finale est alors autorisée (C04). Deux minutes plus tard, le Martinet est dans la zone de jonction (C05).
- **E5, la jonction manuelle.** Huit impulsions de manœuvre au maximum pour rejoindre l'anneau de jonction du relais en évitant sa structure.

### Acte II : le relais (14:35 à 15:10)
- Le Contrôle souhaite la bienvenue et rappelle que le code de maintenance ne transite jamais par la Ligne (C06).
- **E6, le code de maintenance.** La règle est dans le carnet de formation d'Alix, écrit pendant les cours d'Irène Vasseur. Les valeurs sont sur la plaque du relais.
- Le serveur du relais montre que l'émetteur principal a été **arrêté manuellement**, que **la clé 2 a été retirée le 29/08/2097 à 03:17**, que le signal de repère est arrêté, que le plan de fréquences a été effacé, et que **l'émetteur de secours a émis pour la dernière fois le 30/08/2097 à 10:20**, le jour où la désignation d'Alix a été modifiée.
- **E7, le plan de fréquences.** Cinq liaisons, cinq canaux, six règles. Une seule solution.
- Le Contrôle accepte le plan, puis explique qu'il manque la clé 2, autrefois rangée dans les quartiers de garde, et que le code de leur porte est la date du dernier ravitaillement (C08).
- **Exploration libre** du serveur du relais :
  - les systèmes de vie consomment **0,84 kg d'oxygène par jour**, exactement la consommation d'une personne au repos, et la serre est active ;
  - les archives contiennent le rapport d'incident de 2095, la liste des ravitaillements et la liste des capsules de fret perdues ;
  - le trafic montre que L7 n'a reçu **aucun message de la Terre** depuis le 29 août, et que les messages envoyés au Martinet ont une **origine locale**, la console du relais.
- **Le message F2 de la Terre** arrive 12 min 06 s après le renvoi de LUCIOLE, souvent au début de l'acte II : le Contrôle n'a rien envoyé au Martinet. Son mot de contrôle est facultatif. Une minute plus tard, le faux Contrôle le qualifie d'« échos parasites » (C09).
- **E8, la porte des quartiers de garde.** Le dernier ravitaillement officiel date de 2089, et ce code est refusé. Il faut comprendre que les capsules « perdues » ont été des ravitaillements : la dernière date du 26 août 2097.

### Acte III : la Muette (15:10 à 15:45)
- **La révélation**, dans cet ordre :
  1. La porte s'ouvre sur une bouffée d'air chaud et humide.
  2. Le message C10 arrive sur le V40 et, pour la première fois, il tutoie Alix (sauf si la question Q6 l'a déjà fait). Il se termine par « Entre. »
  3. Alix entre. Les quartiers sont habités. Sur le terminal des quartiers, une session est ouverte depuis 745 jours : `I. VASSEUR`. L'ambiance sonore change.
  4. Irène se lève derrière la cuve de spiruline.
- **La main courante.** Le journal d'Irène, douze entrées, de 2095 à ce matin. Et, gardée avec, la note interne de Gérard Lenglet : « échos parasites, ne pas donner suite ».
- **Le dialogue.** Trois questions d'abord, dans l'ordre que le joueur veut : pourquoi ce mensonge, comment tenir deux ans, pourquoi Alix. Une fois les trois posées, une quatrième apparaît, « Et maintenant ? », et Irène donne la clé 2.
- **La remise en service** (facultative). Les deux clés en place et le plan de fréquences validé, Alix les tourne ensemble dans le module technique. L7 se rallume, Mars est reconnectée. Douze minutes plus tard, l'ordre de la direction arrive par la Ligne rétablie (F3) : « Rentrez seul{|e}. »
- **Le départ.** Au menu PARTIR du Martinet, le joueur part sans Irène ou avec elle. Avec elle, le pilote automatique refuse le calcul : la passagère est enregistrée comme décédée. Il faut le faire à la main (**E9**).

## La messagerie avec le Contrôle

C'est le cœur du retournement.

- Chaque message reçu porte son heure de réception, et chaque message envoyé par le joueur son heure d'envoi.
- Les messages reçus portent la mention du canal : `CANAL DE SERVICE - COURTE PORTEE`. Une liaison courte portée ne peut pas venir de la Terre.
- Le joueur peut écrire au Contrôle à tout moment, en choisissant parmi des questions toutes faites (Q1 à Q6, voir `textes.md`). Certaines n'apparaissent qu'après une découverte.
- **Le faux Contrôle répond toujours en 15 à 40 secondes** de jeu, au hasard. Un vrai Contrôle, à Toulouse, ne pourrait pas répondre en moins de 11 min 06 s. Les réponses en attente sont sauvegardées avec la partie.
- La question Q2, « Quel est le délai de transmission actuel ? », reçoit une réponse exacte, « 5 min 33 s dans chaque sens », qui arrive au bout de vingt secondes.

### Les messages du Contrôle

| Message | Déclencheur | Condition |
|---|---|---|
| C01 | 14:00:20 | |
| C02 | E1 réussie | |
| C03 | E2 réussie | |
| C04 | LUCIOLE renvoyé (E4) | |
| C05 | Arrivée dans la zone de jonction, deux minutes après C04 | |
| C06 | E5 réussie | |
| C07 | E6 réussie | |
| C08 | E7 réussie | Irène pas encore démasquée |
| C08-I | E7 réussie | Irène démasquée (variante, signée PLT) |
| C09 | Une minute après l'arrivée de F2 | Irène pas encore démasquée |
| C10 | E8 réussie : la révélation | toujours |

### Le démasquage
Irène est **démasquée** dès que le joueur reçoit la réponse à Q6, ou au message C10.
- À partir de là, elle tutoie Alix et signe PLT.
- Les messages C08 et C09 ne sont plus envoyés comme tels : C08 devient C08-I, C09 disparaît.
- La liste des questions est remplacée par une seule ligne : « Irène vous attend dans les quartiers de garde. » Après la révélation, la messagerie ne reçoit plus rien d'Irène.

### La révélation anticipée
- La question Q4, « Qui était Irène Vasseur ? », apparaît après la lecture du rapport d'incident de 2095, dans les archives du relais.
- La question Q6, « Qui êtes-vous ? », apparaît quand E6 est réussie, que la réponse à Q2 a été reçue, et que le joueur a soit validé le mot de contrôle de F2, soit reçu la réponse à Q4.
- La réponse à Q6 arrive en trente secondes et tutoie Alix : « Viens aux quartiers de garde. Le code, tu le trouveras. PLT ». C'est la seule fois où Irène tutoie Alix avant la révélation. Le jeu enregistre le succès « Oreille fine ». La porte des quartiers reste à ouvrir (E8).

## Les messages de la Terre

- Ils passent par l'antenne longue portée du Martinet, en mode télégraphique : du code Baudot à cinq trous, une ligne de trous par caractère.
- Ils n'arrivent qu'une fois le récepteur synchronisé (E3).
- **F1**, le message de service de Nadia, émis à chaque dizaine de minutes pleine tant que LUCIOLE n'est pas renvoyé. Son mot de contrôle, LUCIOLE, est obligatoire. Le renvoyer transmet aussi le journal de bord du Martinet à la Terre.
- **F2**, 12 min 06 s après le renvoi de LUCIOLE : 5 min 33 s pour que le journal atteigne la Terre, une minute pour que Nadia y voie des messages « du Contrôle » que Toulouse n'a jamais envoyés, 5 min 33 s pour la réponse. Son mot de contrôle, SILENCE, est facultatif, mais il débloque la question Q5.
- **F3**, l'ordre de la direction, seulement si L7 est remis en service avant le départ : 12 minutes après la remise en service, en clair, puisque la Ligne fonctionne de nouveau.
- Un message décodé et validé est ensuite affiché en clair dans le dossier.

## Les indices du retournement

Tout est visible, rien n'est caché. Le joueur attentif peut tout comprendre avant la révélation.

| Indice | Où | Quand |
|---|---|---|
| La désignation d'Alix modifiée « à la demande du Contrôle » | Ordre de mission | Prologue |
| La leçon d'Irène : une réponse trop rapide doit inquiéter | Carnet de formation | Acte I |
| La signature PLT d'Irène, ses heures écrites « 8h30 » | Carnet de formation | Acte I |
| Les heures écrites « 15h45 » par le Contrôle, « 15:45 » partout ailleurs | Messages du Contrôle | Tout le jeu |
| Le canal courte portée | En-tête des messages du Contrôle | Tout le jeu |
| L'antenne coupée depuis L7 à 09:12:04 | Journal de l'antenne | Après E2 |
| Le délai de 11 min 06 s, et des réponses en 30 secondes | Récepteur et messagerie | Après E3 |
| L'émetteur arrêté à la main, la clé 2 retirée, le signal de repère arrêté | État du relais | Après E6 |
| La dernière émission de secours le 30/08/2097 à 10:20 | État du relais | Après E6 |
| 0,84 kg d'oxygène par jour, la serre active | Systèmes de vie du relais et manuel | Acte II |
| Aucun message reçu de la Terre depuis le 29 août, des messages d'origine locale | Trafic du relais | Acte II |
| Dix capsules de fret perdues près de L7, toutes après le 3 septembre 2095 | Archives | Acte II |
| « Le Contrôle ne vous a rien envoyé » | Message F2 | Acte II |
| Le Contrôle signe une fois PLT au lieu de CTL | Réponse à la question Q4 | Acte II |
| « Échos parasites » | Message C09, puis note de Lenglet | Acte II, puis III |

## Les choix du joueur et les fins

Le départ se décide au menu PARTIR du Martinet, disponible dès la jonction. Le départ est définitif, après une confirmation. Deux questions comptent : Irène est-elle à bord, et L7 a-t-il été remis en service ?

| Fin | Conditions | Ce qu'elle raconte |
|---|---|---|
| **Toujours en ligne** | Départ sans Irène, L7 remis en service | Mars est reconnectée, Baudot félicite Alix. Trois semaines plus tard, le dossier L7 est classé. Signé G.L. |
| **Silence radio** | Départ sans Irène, L7 toujours muet | Mission échouée, Irène abandonnée une seconde fois. Si le joueur part avant la révélation, l'épilogue la montre : quelqu'un regardait le Martinet s'éloigner. |
| **La Muette** | Départ avec Irène, L7 toujours muet, calcul E9 juste | Irène est sauvée, Mars reste coupée pendant quatre mois. Le scandale éclate, et Baudot licencie Alix. |
| **Deux étoiles** | Départ avec Irène, L7 remis en service, calcul E9 juste | La meilleure fin. Mars est reconnectée, Irène rentre, la main courante est publiée, Lenglet démissionne. L'écusson de la mission porte maintenant deux étoiles. |
| **Hors délai** | 15:45:00 sans départ | Le Martinet ne peut plus rentrer avant quatre mois. Si Irène a été découverte, Alix et elle attendent ensemble. Sinon, la dernière page la révèle. |

Le départ avec Irène n'est possible qu'après la révélation. Un calcul E9 faux est refusé avec un message ; le joueur peut réessayer jusqu'à 15:45:00.

### Succès (facultatifs)
- **Oreille fine** : avoir reçu la réponse à Q6.
- **Deux étoiles** : avoir obtenu la meilleure fin.
- **Sans filet** : avoir fini sans indice, en mode chronométré.

## Les événements horodatés

| Heure | Événement | Condition |
|---|---|---|
| 14:00:00 | Début de la partie | |
| 14:00:20 | Message C01 du Contrôle | |
| Chaque hh:m0:00 | Message de service F1 | Récepteur synchronisé, LUCIOLE pas encore renvoyé |
| Renvoi de LUCIOLE + 2 min | Arrivée dans la zone de jonction, message C05 | |
| Renvoi de LUCIOLE + 12 min 06 s | Message F2 | |
| Arrivée de F2 + 1 min | Message C09 | Irène pas encore démasquée |
| Remise en service + 12 min | Message F3, l'ordre de la direction | Départ pas encore lancé |
| 15:35:00 | Alarme : plus que dix minutes | Mode chronométré |
| 15:45:00 | Fermeture de la fenêtre, fin « Hors délai » | Mode chronométré, départ pas encore lancé |
