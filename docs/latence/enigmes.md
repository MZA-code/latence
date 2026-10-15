# LATENCE : les énigmes

> Spoilers. Toutes les réponses sont ici. C'est la référence pour coder les énigmes et leurs tests.

## Principes

- **Tout est à l'écran.** Chaque donnée nécessaire s'affiche en clair sur le terminal. Rien dans le HTML, le CSS, la console ou le code source.
- **Une seule solution par énigme, sur toutes les saisies possibles**, prouvée par un test dans `tests/`. Les données vivent dans `src/scenarios/latence/data.js`, et les tests les lisent.
- **Un refus qui a du caractère.** Chaque mauvaise réponse a son message en rangée 24. Pas d'« Erreur ».
- **Pas de blocage définitif.** On peut réessayer autant qu'on veut. Seule l'horloge punit.
- **Papier et crayon** pour le code Baudot (E4) et les calculs (E3, E9). Jamais plus de quelques minutes d'affilée.

## Données de référence

Toutes les valeurs du jeu, au même endroit. Les documents et les écrans doivent les reprendre exactement.

| Donnée | Valeur |
|---|---|
| Date du jeu | mardi 17/09/2097 |
| Début, alarme, fin de la fenêtre | 14:00:00, 15:35:00, 15:45:00 |
| Départ du Martinet de la Terre | 11/09/2097 |
| Alix Vernier | TL-4471 |
| Irène Vasseur | TL-2203, 61 kg en 2095, 54 kg aujourd'hui |
| Accident du Loriot | 03/09/2095 |
| Note de Lenglet | 19/09/2095 |
| Silence de L7, clé 2 retirée | 29/08/2097 à 03:17 |
| Dernière émission de l'émetteur de secours de L7 | 30/08/2097 à 10:20 |
| Désignation d'Alix | 30/08/2097, « à la demande du Contrôle », à la place de T. Ndiaye |
| Coupure de l'antenne du Martinet | 17/09/2097 à 09:12:04, origine L7/SERVICE |
| Distance du Martinet à la Terre | 100 000 000 km |
| Distance du Martinet à L7 au début | 1 200 km |
| Vitesse de la lumière (manuel) | 300 000 km/s |
| Délai simple, aller-retour | 333 s (5 min 33 s), 666 s (11 min 06 s) |
| Message F2 de la Terre | 12 min 06 s après le renvoi de LUCIOLE |
| Message F3 de la Terre | 12 min après la remise en service de L7 |
| Relais L7 | mis en service en 2081, 12 modules |
| Quartiers de garde | scellés le 02/06/2089, 24 °C aujourd'hui |
| Consommation d'oxygène | 0,84 kg par personne et par jour |
| Durée du retour | 6 jours |
| Oxygène du Martinet | 6,0 kg |
| Bouteilles de secours du relais | 4 bouteilles de 2,5 kg d'oxygène, 18 kg chacune pleine |
| Masse du Martinet au départ | 4 100 kg, pilote et soute compris |
| Soute | module émetteur de rechange 85 kg (à rapporter : NON), caisse à outils 32 kg (OUI), échantillons 4 kg (OUI) |
| Session d'Irène | ouverte depuis 745 jours |

## Les objectifs

La touche GUIDE porte sur l'objectif en cours : le premier objectif non terminé, dans l'ordre. O10 n'existe que si le joueur choisit de partir avec Irène.

| Objectif | Énigme | Terminé quand |
|---|---|---|
| O1 Se connecter au serveur de bord | E1 | E1 réussie |
| O2 Rebrancher l'antenne | E2 | E2 réussie |
| O3 Synchroniser le récepteur | E3 | E3 réussie |
| O4 Confirmer la liaison avec la Terre | E4 | LUCIOLE renvoyé |
| O5 Réussir la jonction | E5 | E5 réussie |
| O6 Entrer dans le serveur du relais | E6 | E6 réussie |
| O7 Refaire le plan de fréquences | E7 | E7 réussie |
| O8 Ouvrir les quartiers de garde | E8 | E8 réussie |
| O9 Décider | aucune | Un choix fait au menu PARTIR |
| O10 Calculer le retour à deux | E9 | E9 réussie |

## E1 : la connexion au serveur de bord

- **Objectif** : O1.
- **Écran** : `SERVEUR DE BORD - MARTINET VMR-07`, deux champs : `IDENTIFIANT` (lettres, 10) et `CODE D'ACCES` (chiffres, 4, masqué). En pied de page : `SUITE relire l'ordre de mission`.
- **Document** : l'ordre de mission, affiché au prologue et relisible depuis l'écran de connexion (SUITE, puis RETOUR). « Identifiant : votre nom. Code d'accès : le jour et le mois du départ du Martinet (JJMM). » Plus haut : « Départ du Martinet : 11/09/2097 ».
- **Réponse** : `VERNIER` et `1109`.
- **Refus** : « Identifiant ou code inconnu. Le Martinet vous regarde sans vous reconnaître. »
- **Débloque** : le menu de bord, le message C02.
- **Indices** :
  1. L'ordre de mission explique comment composer le code. SUITE le réaffiche.
  2. Le code est une date : le jour et le mois du départ du Martinet.
  3. Identifiant VERNIER, code 1109.
- **Test** : la date de départ des données donne 1109.

## E2 : le répartiteur de l'antenne

- **Objectif** : O2.
- **Écran** : `SYSTEMES > ANTENNE`. « Antenne longue portée : HORS SERVICE. Le répartiteur commuté a été réaffecté : la chaîne de réception est coupée. »
- **Écran du répartiteur** : un répartiteur commuté, réglé depuis le terminal. Quatre câbles numérotés de 1 à 4, dessinés en pavés, chacun dans sa couleur, donc dans son gris. Un écran `TESTEUR` mesure leur luminance :

| Câble | Luminance | Couleur dessinée |
|---|---|---|
| 1 | 50 % | rouge |
| 2 | 90 % | jaune |
| 3 | 70 % | vert |
| 4 | 40 % | bleu |

- **Documents** (manuel du Martinet) :
  - *Table des gris du V40* : noir 0 %, bleu 40 %, rouge 50 %, magenta 60 %, vert 70 %, cyan 80 %, jaune 90 %, blanc 100 %. Ce sont les vraies valeurs de la norme, celles du moteur (`GREY` dans `src/engine/constants.js`).
  - *Chaîne de réception* : entrée A, antenne : câble rouge ; entrée B, amplificateur : câble vert ; entrée C, filtre : câble bleu ; entrée D, modem : câble jaune.
- **Saisie** : quatre champs d'un chiffre, A, B, C et D : le numéro du câble affecté à chaque entrée.
- **Réponse** : A = 1, B = 3, C = 4, D = 2.
- **Refus** : « Pas de signal. Les affectations ne correspondent pas à la chaîne de réception. »
- **Débloque** : l'antenne, le récepteur (à synchroniser, E3), le message C03, et le journal complet de l'antenne : `17/09/2097 09:12:04 RECONFIGURATION A DISTANCE - ORIGINE : L7/SERVICE`. Ce journal est officiel : son heure s'écrit `09:12:04`.
- **Indices** :
  1. Le V40 est monochrome : les couleurs des câbles sont devenues des gris. Le manuel donne la table.
  2. Le testeur mesure le gris de chaque câble. 50 %, c'est le rouge.
  3. A : 1, B : 3, C : 4, D : 2.
- **Test** : chaque luminance correspond à une seule couleur de la table, la chaîne donne 1-3-4-2, et une seule saisie est acceptée.

## E3 : le délai de propagation

- **Objectif** : O3.
- **Écran** : `RECEPTEUR`. « Récepteur longue portée : NON SYNCHRONISE. Délai de propagation Terre-Martinet, en secondes : ... »
- **Documents** : `TRAJECTOIRE` affiche « Distance à la Terre : 100 000 000 km ». Le manuel, page *Délai de propagation* : « Un signal voyage à la vitesse de la lumière, 300 000 km par seconde. Délai en secondes = distance en km divisée par 300 000, arrondi à la seconde inférieure. »
- **Saisie** : trois chiffres.
- **Réponse** : `333`.
- **Refus** : « Synchronisation impossible. Ce délai ne correspond pas à la distance. »
- **Débloque** : le récepteur affiche « SYNCHRONISE. Délai : 333 s (5 min 33 s). Aller-retour avec la Terre : 666 s (11 min 06 s). » Le message de service F1 arrivera à la dizaine de minutes pleine suivante.
- **Indices** :
  1. La page « Délai de propagation » du manuel donne la formule.
  2. Divisez la distance à la Terre par la vitesse de la lumière.
  3. 100 000 000 divisé par 300 000 : 333.
- **Test** : distance / vitesse, arrondi à l'inférieur, donne 333 ; le double donne 11 min 06 s.

## E4 : le premier message de la Terre

- **Objectif** : O4.
- **Quand** : Nadia émet le message de service F1 toutes les dix minutes, à chaque dizaine de minutes pleine (14:10:00, 14:20:00…). Le premier reçu après la synchronisation s'affiche. Tant que LUCIOLE n'est pas renvoyé, chaque nouvelle émission remplace l'heure de réception ; le texte reste le même. Une fois LUCIOLE renvoyé, les messages de service ne s'affichent plus.
- **Écran** : `RECEPTEUR > MESSAGES`. « Message reçu à hh:mm:ss » (l'heure réelle de réception), « 35 caractères. Code télégraphique Baudot. »
  - Page 1 : la bande. Une ligne par caractère, numérotée, cinq positions de trou par ligne, trou 1 à gauche. Un trou est un pavé plein, une position vide un point. Trois colonnes de 12 lignes, rangées 06 à 17.
  - Page 2 (SUITE) : la table Baudot en version compacte, pour ne pas avoir à passer par le manuel.
  - Sur les deux pages, rangée 19 : le champ `MOT DE CONTROLE` (lettres, 8).
- **Document** : la table ci-dessous, en page 2 et dans le manuel.
- **Message** : `ICI NADIA BON VOL ALIX CODE LUCIOLE`
- **Raccourci** : le mot de contrôle suit le mot CODE. Un joueur malin ne décode que la fin.
- **Réponse** : `LUCIOLE`.
- **Refus** : « Mot de contrôle incorrect. La liaison avec la Terre n'est pas confirmée. »
- **Débloque** : le message en clair dans le dossier, le message C04, l'approche finale. LUCIOLE part vers la Terre avec le journal de bord du Martinet (procédure P-12) : c'est ainsi que la Terre apprend ce qui se passe.
- **Indices** :
  1. Chaque ligne de trous est une lettre. La table est en page 2.
  2. Lisez chaque ligne de gauche à droite et cherchez le motif dans la table. Le mot de contrôle est le dernier mot, après CODE.
  3. Le message dit : ICI NADIA BON VOL ALIX CODE LUCIOLE. Le mot de contrôle est LUCIOLE.
- **Test** : la bande affichée se décode en ce texte, et la table n'a pas deux fois le même motif.

### La table Baudot (ITA2, lettres)
Trous numérotés de 1 à 5, de gauche à droite ; 1 = trou, 0 = pas de trou.

| Lettre | Trous | Lettre | Trous | Lettre | Trous |
|---|---|---|---|---|---|
| A | 11000 | J | 11010 | S | 10100 |
| B | 10011 | K | 11110 | T | 00001 |
| C | 01110 | L | 01001 | U | 11100 |
| D | 10010 | M | 00111 | V | 01111 |
| E | 10000 | N | 00110 | W | 11001 |
| F | 10110 | O | 00011 | X | 10111 |
| G | 01011 | P | 01101 | Y | 10101 |
| H | 00101 | Q | 11101 | Z | 10001 |
| I | 01100 | R | 01010 | espace | 00100 |

Exemple : `ICI` donne `01100 01110 01100`.

### Le second message (F2, facultatif)
- **Quand** : 12 min 06 s après le renvoi de LUCIOLE. Le journal du Martinet met 5 min 33 s pour atteindre la Terre, Nadia y découvre des messages « du Contrôle » que Toulouse n'a jamais envoyés, elle réagit en une minute, et sa réponse met 5 min 33 s à revenir.
- **Message** : `LE CONTROLE NE VOUS A RIEN ENVOYE MEFIANCE CODE SILENCE` (55 caractères, même affichage que F1, sur deux pages de bande).
- **Mot de contrôle** : `SILENCE`. Facultatif. Il débloque la question Q5 et compte pour la question Q6.

## E5 : la jonction manuelle

- **Objectif** : O5.
- **Écran** : `TRAJECTOIRE > JONCTION`. Une grille de 9 colonnes sur 7 rangées, dessinée en pavés : le Martinet (M), l'anneau de jonction (J) et la structure du relais (#), c'est-à-dire ses panneaux solaires, son pylône et ses antennes.

```
. . . . . . . . .
# # # . . . # # #
. . # . J . # . .
. . # . # . # . .
. . . . # . . . .
. # # # # . # # .
M . . . . . . . .
```

- **Document** : le manuel, page *Jonction manuelle* : « Chaque impulsion déplace le Martinet d'une case : H haut, B bas, G gauche, D droite. Le réservoir de manœuvre permet huit impulsions. Tout contact avec la structure interrompt la manœuvre, comme toute sortie de la zone de jonction. » Le message C05 du Contrôle rappelle les huit impulsions.
- **Saisie** : un champ de directions (H, B, G, D), 8 caractères.
- **Réponse** : `HHDDDHHD`.
- **Refus** : rejouer le trajet case par case sur la grille, puis, selon le cas :
  - « Contact avec la structure à la 4e impulsion. Le Martinet revient en position d'attente. »
  - « Sortie de la zone de jonction à la 2e impulsion. Le Martinet revient en position d'attente. »
  - « Réservoir vide avant l'anneau de jonction. »
- **Débloque** : la jonction, le message C06, la touche CONNEXION/FIN vers le serveur du relais, le menu PARTIR.
- **Indices** :
  1. Recopiez la grille sur papier et cherchez un chemin de huit cases.
  2. Commencez par monter deux fois le long du bord gauche.
  3. H H D D D H H D.
- **Test** : un parcours en largeur montre un seul chemin de huit impulsions, et aucun plus court.

## E6 : le code de maintenance du relais

- **Objectif** : O6.
- **Écran** : la connexion au serveur du relais, avec sa plaque : `RELAIS L7 - MIS EN SERVICE EN 2081 - 12 MODULES`, puis `CODE DE MAINTENANCE` (chiffres, 7).
- **Document** : le carnet de formation d'Alix, page *Les codes de maintenance* : « Le code d'un relais : son numéro, puis l'année de sa mise en service écrite à l'envers, puis son nombre de modules. Exemple : L3, mis en service en 2080, 9 modules, donne 308029. »
- **Réponse** : `7180212`.
- **Refus** : « Code refusé. Les relais ne pardonnent rien, mais ils ne comptent pas les essais. »
- **Débloque** : le serveur du relais, le message C07.
- **Indices** :
  1. Le Contrôle parle d'une règle apprise en formation. Votre dossier contient votre carnet.
  2. Le carnet donne la règle, la plaque du relais donne les valeurs.
  3. 7, puis 2081 à l'envers, 1802, puis 12 : 7180212.
- **Test** : la règle appliquée à (3, 2080, 9) donne 308029 et à (7, 2081, 12) donne 7180212.

## E7 : le plan de fréquences

- **Objectif** : O7.
- **Écran** : `PLAN DE FREQUENCES`. Cinq liaisons, un champ d'un chiffre par liaison, des canaux numérotés de 1 à 5. En bas, l'état des canaux : « Canal 4 : brouillage côté Mars. »

| Code | Liaison |
|---|---|
| TM | Terre, montante |
| TD | Terre, descendante |
| MM | Mars, montante |
| MD | Mars, descendante |
| RP | Signal de repère |

- **Document** : le manuel du relais, page *Règles de compatibilité* :
  1. Un canal ne porte qu'une seule liaison.
  2. Les deux liaisons d'une même planète ne sont jamais sur des canaux voisins.
  3. Pour chaque planète, la liaison montante est sur un canal plus élevé que la liaison descendante.
  4. Le signal de repère occupe un canal extrême : 1 ou 5.
  5. Le signal de repère n'est jamais voisin d'une liaison montante.
  6. Aucune liaison ne va sur un canal signalé brouillé pour sa planète.
- **Réponse** : TM 4, TD 2, MM 5, MD 3, RP 1.
- **Raisonnement** : les règles 2 et 3 imposent deux paires de canaux écartés d'au moins 2. Si le repère était sur 5, les paires seraient (3,1) et (4,2), et le canal 4, voisin du repère, porterait une liaison montante : interdit par la règle 5. Le repère est donc sur 1. Restent les paires (4,2) et (5,3). Mars ne peut pas aller sur le canal 4 : Mars prend (5,3), la Terre (4,2).
- **Refus** : indiquer la première règle violée. « Plan refusé : la règle 3 n'est pas respectée. »
- **Débloque** : le message C08 (ou sa variante, voir `scenario.md`). La mise en service attend encore la clé 2.
- **Indices** :
  1. Commencez par le signal de repère : il n'a que deux places possibles.
  2. Sur le canal 5, le repère serait forcément voisin d'une liaison montante. Il est donc sur le canal 1.
  3. TM 4, TD 2, MM 5, MD 3, RP 1.
- **Test** : sur les 3 125 saisies possibles (5 chiffres de 1 à 5), une seule respecte les six règles, et chaque règle est nécessaire (sans elle, il y a plusieurs solutions).

## E8 : la porte des quartiers de garde

- **Objectif** : O8.
- **Écran** : `QUARTIERS DE GARDE`. « Porte scellée le 02/06/2089. Code (JJMM) : .... »
- **Documents** :
  - Le manuel du relais, page *Quartiers de garde* : « Le code de la porte est le jour et le mois du dernier ravitaillement reçu par le relais. Il se met à jour automatiquement à chaque ravitaillement. »
  - Les archives, *Ravitaillements de L7* : la liste officielle de Baudot, dont le dernier est le 02/06/2089.
  - Les archives, *Capsules de fret perdues dans le secteur de L7* : dix capsules de fret automatiques, toutes perdues à moins de 500 km du relais, toutes après le 03/09/2095. Aucune perte depuis la mise en service de L7, en 2081, jusqu'en 2095.

| Capsule | Date de la perte | Distance à L7 | Chargement |
|---|---|---|---|
| C-114 | 12/11/2095 | 310 km | vivres, eau |
| C-122 | 20/01/2096 | 280 km | pièces détachées |
| C-131 | 03/04/2096 | 450 km | vivres, oxygène |
| C-139 | 30/06/2096 | 120 km | eau, semences |
| C-147 | 15/09/2096 | 390 km | vivres |
| C-152 | 02/12/2096 | 205 km | oxygène, médicaments |
| C-160 | 18/02/2097 | 330 km | vivres, eau |
| C-171 | 09/05/2097 | 260 km | pièces détachées, vivres |
| C-180 | 21/07/2097 | 140 km | oxygène |
| C-188 | 26/08/2097 | 95 km | vivres, eau, oxygène |

- **Réponse** : `2608`.
- **Refus** :
  - avec `0206` : « Code refusé. Ce code a été remplacé depuis 2089. »
  - sinon : « Code refusé. La porte reste fermée. »
- **Raisonnement** : le code a changé après 2089, donc le relais a été ravitaillé depuis. Les seuls arrivages possibles sont ces capsules « perdues », qui ne l'ont pas été pour tout le monde. La dernière date du 26/08/2097.
- **Débloque** : la révélation.
- **Indices** :
  1. Le code a changé depuis 2089. Quelque chose a donc ravitaillé le relais depuis.
  2. Les archives listent des capsules de fret perdues près de L7. Perdues pour qui ?
  3. La dernière capsule « perdue » date du 26/08/2097. Le code est 2608.
- **Test** : le dernier ravitaillement officiel est en 2089, toutes les pertes suivent le 03/09/2095, et la plus récente donne 2608.

## E9 : le retour à deux

- **Objectif** : O10. Seulement si le joueur choisit de partir avec Irène.
- **Écran** : `PARTIR`, avec Irène. « Pilote automatique : passagère inconnue. I. VASSEUR, TL-2203 : statut DECEDEE. Calcul manuel requis. » Deux saisies : `BOUTEILLES D'OXYGENE A EMBARQUER` (1 chiffre) et `DUREE DE POUSSEE` (minutes, 1 chiffre ; secondes, 2 chiffres).
- **Documents** :
  - Manuel du Martinet, *Consommation d'oxygène* : 0,84 kg d'oxygène par personne et par jour.
  - `TRAJECTOIRE` : durée du retour, 6 jours.
  - `SYSTEMES > OXYGENE` : réserve du Martinet, 6,0 kg.
  - Serveur du relais, `SYSTEMES DE VIE` : 4 bouteilles de secours de 2,5 kg d'oxygène, 18 kg chacune pleine.
  - `SYSTEMES > MASSE ET SOUTE` : masse au départ 4 100 kg, et la soute (voir les données de référence).
  - Manuel du Martinet, *Calcul du retour* : « Masse au départ = masse du Martinet + passagers + chargement ajouté − matériel laissé sur L7. Pour alléger le Martinet, ne laisser que le matériel marqué « à rapporter : NON ». N'embarquer que l'oxygène nécessaire au retour : chaque bouteille compte dans la masse. » Puis la table :

| Masse au départ | Durée de poussée |
|---|---|
| moins de 4 040 kg | 5 min 55 s |
| 4 040 à 4 049 kg | 6 min 00 s |
| 4 050 à 4 059 kg | 6 min 05 s |
| 4 060 à 4 069 kg | 6 min 10 s |
| 4 070 à 4 079 kg | 6 min 15 s |
| 4 080 à 4 089 kg | 6 min 20 s |
| 4 090 à 4 099 kg | 6 min 25 s |
| 4 100 à 4 109 kg | 6 min 30 s |
| 4 110 à 4 119 kg | 6 min 35 s |
| 4 120 à 4 129 kg | 6 min 40 s |
| 4 130 kg et plus | retour impossible dans la fenêtre |

  - La main courante d'Irène, 16/09/2097 : « Pesée ce matin : 54 kg. » Le rapport d'incident de 2095 indique encore 61 kg.
- **Calcul** :
  - Oxygène : 2 personnes × 6 jours × 0,84 = 10,08 kg. Il en manque 4,08 : il faut **2 bouteilles**. Une troisième serait de trop, et le manuel l'interdit.
  - Masse : 4 100 + 54 + 2 × 18 − 85 = **4 105 kg**, donc **6 min 30 s**.
- **Réponse** : `2`, `6`, `30`.
- **Pièges prévus** : avec 61 kg, on trouve 4 112 kg et 6 min 35 s. Avec une seule bouteille, l'oxygène manque. Avec trois, la règle du manuel n'est pas respectée. Sans laisser le module, la masse dépasse 4 130 kg.
- **Refus** :
  - moins de 2 bouteilles : « Oxygène insuffisant pour deux personnes pendant six jours. »
  - plus de 2 : « Une bouteille de trop : n'embarquez que l'oxygène nécessaire. »
  - mauvaise durée : « Trajectoire refusée. La poussée ne correspond pas à la masse. »
- **Débloque** : la fin « Deux étoiles », si L7 a été remis en service ; sinon la fin « La Muette ».
- **Indices** :
  1. Deux calculs : l'oxygène pour deux pendant le retour, puis la masse au départ.
  2. La masse, c'est le Martinet, plus Irène, plus les bouteilles, moins ce que vous laissez sur L7. Irène a maigri : sa main courante donne son poids d'aujourd'hui.
  3. 2 bouteilles. 4 100 + 54 + 36 − 85 = 4 105 kg : 6 min 30 s.
- **Test** : les données donnent 2 bouteilles et 6 min 30 s ; avec 61 kg, on obtient 6 min 35 s ; une seule combinaison est acceptée.

## Indices de l'objectif sans énigme

- **O9 Décider** (après la révélation) :
  1. Pour remettre L7 en service, il faut les deux clés. Irène a la seconde.
  2. Le menu PARTIR du Martinet propose de partir sans Irène ou avec elle.
  3. Pour tout réussir : remettre L7 en service, puis partir avec Irène et faire le calcul du retour.

## Tests à écrire

Dans `tests/latence.test.js`, à partir de `src/scenarios/latence/data.js` :
- E1 : 1109 vient de la date de départ.
- E2 : correspondance gris-couleur unique, chaîne 1-3-4-2, gris égaux aux valeurs `GREY` du moteur, une seule saisie acceptée.
- E3 : 333 s et 11 min 06 s.
- E4 : la table Baudot n'a pas de doublon, et les bandes de F1 et F2 se décodent en leur texte.
- E5 : un seul chemin de huit impulsions, aucun plus court.
- E6 : la règle donne 308029 et 7180212.
- E7 : une seule solution sur les 3 125 saisies, chaque règle nécessaire.
- E8 : 2608, et toutes les pertes sont postérieures au 03/09/2095.
- E9 : 2 bouteilles et 6 min 30 s ; 61 kg donne 6 min 35 s.
- Cohérence : chaque scène citée par le scénario existe, chaque objectif a trois indices, aucune date d'événement ne contredit les données de référence.
