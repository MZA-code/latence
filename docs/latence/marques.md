# LATENCE : les marques de l'univers et le merch

Les marques du jeu sont pensées pour exister aussi hors du jeu, sur des t-shirts, des sweats, des casquettes, des écussons brodés, des autocollants et des affiches. C'est le principe des compagnies et des vaisseaux de certains films de science-fiction : on porte le logo d'une entreprise qui n'existe pas.

## Les règles

- Rien de marin ni de nautique. Rien de Marseille ni de la Provence. Rien de militaire.
- Un style rétro-futuriste, technique, un peu usé : signalétique industrielle, télécommunications et aérospatial des années 1970 à 1990.
- Jamais le mot « Minitel », sur aucun produit.
- Avant toute vente, vérifier à l'INPI que les noms sont libres : BAUDOT, MARTINET, LA MUETTE, LIGNE TERRE-MARS, LATENCE.

## La palette

| Nom | Couleur | Usage |
|---|---|---|
| Bleu Baudot | `#34506A` | Couleur principale des marques |
| Rouge Mars | `#A8432F` | Mars, les accents |
| Jaune signal | `#D8B25C` | Les marquages techniques, l'ambre des afficheurs |
| Écru | `#E8E1D0` | Les fonds, le textile clair |
| Encre | `#1E2328` | Le texte, le textile sombre |
| Blanc phosphore | `#D9E6FF` | Ce qui vient de l'écran (P4) |
| Vert phosphore | `#7CF5A5` | Ce qui vient de l'écran (P1) |

## La typographie

- **Logos** : une grotesque condensée, technique, en capitales (Barlow Condensed, sous licence libre, convient).
- **Textes techniques et chiffres** : une police à chasse fixe (Martian Mono, déjà utilisée par le site).
- **Dans le jeu** : la police du terminal, dessinée dans le moteur.
- Pour le merch, n'utiliser que des polices sous licence libre (SIL OFL), qui autorisent l'usage commercial.

## Les marques

### BAUDOT, la Compagnie
- **Rôle** : l'exploitant de la Ligne, et le méchant de l'histoire.
- **Logo** : une courte bande de papier perforé, comme un ruban de télégraphe à cinq trous, à côté du mot BAUDOT. Les trous écrivent vraiment « BAUDOT » en code Baudot, une ligne par lettre, trous 1 à 5 de gauche à droite (1 = trou) : B `10011`, A `11000`, U `11100`, D `10010`, O `00011`, T `00001`. Gemini ne respectera pas ce motif : il faut le reprendre exactement dans la version vectorielle.
- **Slogan** : « Toujours en ligne. »
- **Produits** : t-shirt avec le logo en poitrine, motif de bande perforée en all-over, pin's.

### LIGNE TERRE-MARS
- **Rôle** : le réseau.
- **Emblème** : comme un plan de ligne de transport. Un disque bleu (la Terre), neuf petits carrés (les relais), un disque rouge (Mars). Dans le jeu, le septième carré clignote.
- **Produits** : impression longue dans le dos d'un t-shirt, autocollant, affiche.

### MARTINET VMR-07
- **Rôle** : le vaisseau du joueur.
- **Emblème** : un martinet aux ailes en faucille, construit en blocs comme une mosaïque d'écran, sur une plaque rectangulaire aux coins coupés, avec l'immatriculation VMR-07. Une forme différente de l'écusson rond de la Compagnie.
- **Produits** : casquette brodée, écusson, sweat.

### RELAIS L7, « LA MUETTE »
- **Rôle** : le lieu de l'histoire.
- **Écusson** : rond, la silhouette du relais (un pylône, deux paraboles, deux panneaux solaires), une ligne pointillée de la Terre à Mars, « RELAIS L7 » en haut et « LA MUETTE » en bas.
- **Produits** : écusson brodé, sweat à capuche, affiche.

### V40
- **Rôle** : le terminal de bord.
- **Plaque** : métal bleu, « BAUDOT » en petit, « V40 » sur un afficheur ambré à segments, « VIDEOTEX DE BORD », et un symbole de 2 × 3 petits carrés (les pavés d'une case de l'écran).
- **Produits** : autocollant, impression poitrine.

### L'écusson de la mission
- **Rôle** : la mission du jeu.
- **Écusson** : un blason arrondi, la silhouette du relais, « MISSION L7 - 2097 » et « VMR-07 MARTINET ». Une étoile par membre d'équipage : l'écusson officiel n'en porte qu'une. Celui de la fin « Deux étoiles » en porte deux : deux personnes sont rentrées.
- **Produits** : l'écusson à une étoile en vente libre ; celui à deux étoiles vendu ou offert aux joueurs qui ont la fin « Deux étoiles ».

### LATENCE, le titre
- Le mot en capitales à chasse fixe, suivi d'un curseur en pavé plein, et « 5 MIN 33 S » en dessous.
- L'image déjà générée est bonne.

### Idées de t-shirts pour les joueurs
- « 5 MIN 33 S »
- « PLT »
- « ÉCHOS PARASITES »
- « TOUJOURS EN LIGNE », pour l'ironie
- « UNE RÉPONSE QUI ARRIVE TROP VITE DOIT VOUS INQUIÉTER »

## Les prompts pour Gemini

Chaque prompt se colle tel quel, style compris. Quand Gemini propose un format, prendre celui qui est indiqué. Les prompts 1, 2, 3 et 7 donnent les images du site ; 4 et 6 servent de base aux silhouettes de l'écran (prompt 8) et au merch ; 5 ne sert qu'au merch.

### Le style commun des logos
Déjà inclus dans les prompts 1 à 6. À reprendre pour tout nouveau logo.
```
Style : logo vectoriel plat, inspiré de la signalétique industrielle, des télécommunications et des insignes aérospatiaux des années 1970-1980. Trois couleurs en aplat au maximum, traits épais, prêt pour la sérigraphie et la broderie. Palette désaturée : bleu #34506A, rouge #A8432F, jaune signal #D8B25C, écru #E8E1D0, encre #1E2328. Fond blanc pur et uni, sans ombre, sans texture, sans cadre, logo centré avec une large marge. Pas de dégradé, pas de 3D, pas de néon, pas de style NASA, pas de science-fiction de cinéma. Pas de fusée, pas de petits pictogrammes décoratifs, aucun texte en dehors du texte exact demandé. Aucun élément marin ou nautique.
```

Le fond blanc pur sert au détourage : sur le site, les écussons ont un fond transparent. Pour la même raison, les parties claires des écussons du site (prompts 1 à 3) sont en écru, jamais en blanc pur.

### 1. BAUDOT
Écusson du site. Format 16:9.
```
Logo de « BAUDOT », une compagnie fictive de télécommunications interplanétaires fondée en 1987. À gauche, une courte bande de papier perforé verticale, comme un ruban de télégraphe, avec six lignes de cinq positions de trous ronds. De haut en bas, les trous de chaque ligne, de gauche à droite (1 = trou, 0 = pas de trou) : 10011, 11000, 11100, 10010, 00011, 00001. À droite, le mot exact « BAUDOT » en capitales grotesques condensées, très lisibles. En dessous, plus petit, le slogan exact « TOUJOURS EN LIGNE ». Composition horizontale. Les parties claires du logo sont en écru #E8E1D0, jamais en blanc pur.
Style : logo vectoriel plat, inspiré de la signalétique industrielle, des télécommunications et des insignes aérospatiaux des années 1970-1980. Trois couleurs en aplat au maximum, traits épais, prêt pour la sérigraphie et la broderie. Palette désaturée : bleu #34506A, rouge #A8432F, jaune signal #D8B25C, écru #E8E1D0, encre #1E2328. Fond blanc pur et uni, sans ombre, sans texture, sans cadre, logo centré avec une large marge. Pas de dégradé, pas de 3D, pas de néon, pas de style NASA, pas de science-fiction de cinéma. Pas de fusée, pas de petits pictogrammes décoratifs, aucun texte en dehors du texte exact demandé. Aucun élément marin ou nautique.
```

Gemini ne respectera pas le motif des trous : la bande est reprise au motif exact au détourage.

### 2. La Ligne Terre-Mars
Écusson du site. Format 21:9.
```
Emblème de « LIGNE TERRE-MARS », une liaison de télécommunications fictive. Une ligne horizontale épaisse, comme sur un plan de ligne de transport, qui relie un disque bleu à gauche (la Terre) à un disque rouge à droite (Mars). Sur la ligne, exactement neuf petits carrés régulièrement espacés : les relais. Au-dessus, le texte exact « LIGNE TERRE-MARS ». Composition très horizontale, géométrique, sobre. Les parties claires du logo sont en écru #E8E1D0, jamais en blanc pur.
Style : logo vectoriel plat, inspiré de la signalétique industrielle, des télécommunications et des insignes aérospatiaux des années 1970-1980. Trois couleurs en aplat au maximum, traits épais, prêt pour la sérigraphie et la broderie. Palette désaturée : bleu #34506A, rouge #A8432F, jaune signal #D8B25C, écru #E8E1D0, encre #1E2328. Fond blanc pur et uni, sans ombre, sans texture, sans cadre, logo centré avec une large marge. Pas de dégradé, pas de 3D, pas de néon, pas de style NASA, pas de science-fiction de cinéma. Pas de fusée, pas de petits pictogrammes décoratifs, aucun texte en dehors du texte exact demandé. Aucun élément marin ou nautique.
```

### 3. Le Martinet
Écusson du site, et base de la silhouette du martinet. Format 4:3.
```
Emblème d'un petit vaisseau spatial de maintenance nommé « MARTINET ». Une plaque rectangulaire aux coins coupés, comme une plaque industrielle. Au centre, un martinet, l'oiseau aux ailes en forme de faucille, vu de dessous, construit avec des blocs rectangulaires comme une mosaïque d'écran de terminal des années 1980 : ailes longues et effilées, tête ronde, queue courte et fourchue. En bas, le texte exact « MARTINET » en capitales au pochoir et, plus petit, l'immatriculation exacte « VMR-07 ». Les parties claires du logo sont en écru #E8E1D0, jamais en blanc pur.
Style : logo vectoriel plat, inspiré de la signalétique industrielle, des télécommunications et des insignes aérospatiaux des années 1970-1980. Trois couleurs en aplat au maximum, traits épais, prêt pour la sérigraphie et la broderie. Palette désaturée : bleu #34506A, rouge #A8432F, jaune signal #D8B25C, écru #E8E1D0, encre #1E2328. Fond blanc pur et uni, sans ombre, sans texture, sans cadre, logo centré avec une large marge. Pas de dégradé, pas de 3D, pas de néon, pas de style NASA, pas de science-fiction de cinéma. Pas de fusée, pas de petits pictogrammes décoratifs, aucun texte en dehors du texte exact demandé. Aucun élément marin ou nautique.
```

### 4. Le relais L7
Base de la silhouette du relais, et merch. Format 1:1.
```
Écusson rond pour une station relais de télécommunications dans l'espace, nommée « RELAIS L7 ». Au centre, la silhouette de la station : un pylône métallique vertical, deux grandes antennes paraboliques, deux panneaux solaires rectangulaires de part et d'autre. Les panneaux, grands et horizontaux, rendent la station plus large que haute ; elle flotte dans le vide, sans sol ni socle. Une ligne pointillée horizontale traverse l'écusson, d'un petit disque bleu à gauche à un petit disque rouge à droite. En haut sur le pourtour, le texte exact « RELAIS L7 ». En bas, le texte exact « LA MUETTE ».
Style : logo vectoriel plat, inspiré de la signalétique industrielle, des télécommunications et des insignes aérospatiaux des années 1970-1980. Trois couleurs en aplat au maximum, traits épais, prêt pour la sérigraphie et la broderie. Palette désaturée : bleu #34506A, rouge #A8432F, jaune signal #D8B25C, écru #E8E1D0, encre #1E2328. Fond blanc pur et uni, sans ombre, sans texture, sans cadre, logo centré avec une large marge. Pas de dégradé, pas de 3D, pas de néon, pas de style NASA, pas de science-fiction de cinéma. Pas de fusée, pas de petits pictogrammes décoratifs, aucun texte en dehors du texte exact demandé. Aucun élément marin ou nautique.
```

### 5. La plaque du V40
Merch seulement. Format 3:2.
```
Plaque de marque d'un terminal informatique fictif des années 1980. Plaque rectangulaire aux coins arrondis, en métal peint bleu. En haut à gauche, en petit, le texte exact « BAUDOT ». Au centre, en grand, « V40 » sur un afficheur ambré à segments. En dessous, le texte exact « VIDEOTEX DE BORD ». À gauche, un symbole fait d'une grille de deux colonnes et trois rangées de petits carrés.
Style : logo vectoriel plat, inspiré de la signalétique industrielle, des télécommunications et des insignes aérospatiaux des années 1970-1980. Trois couleurs en aplat au maximum, traits épais, prêt pour la sérigraphie et la broderie. Palette désaturée : bleu #34506A, rouge #A8432F, jaune signal #D8B25C, écru #E8E1D0, encre #1E2328. Fond blanc pur et uni, sans ombre, sans texture, sans cadre, logo centré avec une large marge. Pas de dégradé, pas de 3D, pas de néon, pas de style NASA, pas de science-fiction de cinéma. Pas de fusée, pas de petits pictogrammes décoratifs, aucun texte en dehors du texte exact demandé. Aucun élément marin ou nautique.
```

Pour une version en photo, comme la première image générée, remplacer le style commun par : « Photo réaliste en gros plan, métal patiné, lumière douce. »

### 6. L'écusson de la mission
Base de la silhouette de l'écusson, et merch. Format 4:5.
```
Écusson de mission spatiale des années 1970, en forme de blason arrondi, bordure brodée. Au centre, la silhouette simplifiée d'une station relais (un pylône, deux antennes paraboliques, deux panneaux solaires) sur un fond d'espace noir. Au-dessus, une petite étoile blanche à quatre branches. En haut, le texte exact « MISSION L7 - 2097 ». En bas, le texte exact « VMR-07 MARTINET ».
Style : logo vectoriel plat, inspiré de la signalétique industrielle, des télécommunications et des insignes aérospatiaux des années 1970-1980. Trois couleurs en aplat au maximum, traits épais, prêt pour la sérigraphie et la broderie. Palette désaturée : bleu #34506A, rouge #A8432F, jaune signal #D8B25C, écru #E8E1D0, encre #1E2328. Fond blanc pur et uni, sans ombre, sans texture, sans cadre, logo centré avec une large marge. Pas de dégradé, pas de 3D, pas de néon, pas de style NASA, pas de science-fiction de cinéma. Pas de fusée, pas de petits pictogrammes décoratifs, aucun texte en dehors du texte exact demandé. Aucun élément marin ou nautique.
```

Pour la version de la fin, remplacer « une petite étoile blanche » par « deux petites étoiles blanches ».

### 7. La photo du terminal (le fond du jeu)
Pas de style commun pour celle-ci. Format 4:3, dans la plus haute résolution proposée. Le jeu affiche l'écran aussi grand que possible : la photo est un gros plan, et les écussons vont à côté de l'écran, sur la page.
```
Photo réaliste en gros plan, vue strictement de face et centrée, de l'écran d'un terminal informatique fictif des années 1980, encastré dans le tableau de bord d'un petit vaisseau spatial de maintenance. Un écran cathodique au format 4:3, légèrement bombé, dans un cadre de métal bleu usé fixé par quatre vis, lui-même pris dans un boîtier en plastique écru patiné. L'écran est éteint : verre noir profond et vide, sans texte ni image, avec un reflet très doux. L'écran occupe environ les trois quarts de la largeur de l'image ; le cadre bleu et ses quatre vis sont visibles en entier, avec un peu du boîtier autour. Le clavier est hors du cadre. Éclairage tamisé de cabine, lumière douce venue du haut, ambiance de nuit. Textures crédibles : peinture écaillée, rayures, poussière. Aucun texte lisible, aucune étiquette, aucun logo. Format 4:3, la plus haute résolution possible. Pas de néon, pas de cyberpunk, pas de rendu 3D brillant, pas de style NASA.
Cadrage : l'objectif est exactement en face du centre de l'écran, à sa hauteur ; les bords de l'écran restent droits et parallèles aux bords de l'image, sans perspective ni déformation. Les quatre coins du verre sont nets et entièrement visibles, et rien ne passe devant l'écran. Tout est net, sans flou de profondeur. Aucune personne, aucune main, aucune fenêtre ni hublot dans le cadre.
```

Le cadrage compte pour le calage : le jeu pose son écran sur les quatre coins du verre. La première photo plaçait l'écran à 38 % de la largeur, entre deux panneaux : `npm run images` la recadre sur le verre et son cadre (voir `PHOTO` dans `tools/images.mjs`) ; avec un gros plan, ce recadrage pourra disparaître.

### 8. Les silhouettes pour l'écran du jeu
Dans une nouvelle conversation, donner à Gemini l'image retenue, puis le prompt. Noir et blanc seulement : le noir devient les pavés allumés de l'écran. Les largeurs indiquées sont celles du dessin à l'écran, en pavés.

**Le martinet**, à partir de l'emblème retenu (prompt 3). Format 21:9.
```
À partir de cette image, dessine seulement le martinet, sans la plaque ni le texte, en silhouette noire pleine sur fond blanc pur. Vu de dessous, ailes en faucille grandes ouvertes, tête ronde, queue courte et fourchue bien visible. Formes simples et épaisses, aucun détail fin, aucun gris, aucun dégradé : seulement du noir et du blanc. L'oiseau remplit l'image. Il doit rester reconnaissable réduit à 32 pixels de large.
```

**Le relais**, à partir de l'écusson retenu (prompt 4). Format 21:9.
```
À partir de cette image, dessine seulement la station relais, sans l'anneau de l'écusson, sans la ligne pointillée ni les disques, sans texte, en silhouette noire pleine sur fond blanc pur. Le pylône, les deux paraboles et les deux grands panneaux solaires horizontaux, avec un espace blanc bien marqué entre les pièces. La station flotte dans le vide, sans sol ; elle remplit l'image et reste nettement plus large que haute. Formes simples et épaisses, aucun détail fin, aucun gris, aucun dégradé. Elle doit rester reconnaissable réduite à 24 pixels de large.
```

**L'écusson de la mission**, à partir de l'écusson retenu (prompt 6). Format 1:1.
```
À partir de cette image, dessine l'écusson en silhouette noire sur fond blanc pur : le contour du blason en trait noir épais, et la station relais en noir plein au centre. Rien d'autre : pas de texte, pas d'étoile, pas de fond d'espace, pas de bordure brodée. L'intérieur du blason reste blanc autour de la station, et le haut du blason reste vide. Formes simples et épaisses, aucun gris. Il doit rester reconnaissable réduit à 24 pixels de large.
```

Les étoiles, une ou deux selon la fin, sont dessinées par le jeu dans le haut du blason : les deux versions gardent ainsi le même blason.

## Après Gemini

1. Générer plusieurs variantes par prompt, garder les meilleures pistes.
2. Vérifier chaque lettre : les générateurs d'images déforment souvent les textes.
3. Pour le site, déposer les images retenues telles que Gemini les donne : `sources/images/terminal.png`, `baudot.png`, `ligne.png`, `martinet.png`, `relais.png` et `mission.png`, puis les silhouettes dans `sources/mosaique/` (`martinet.png`, `relais.png`, `mission.png`). Les fichiers du site en sont tirés par `npm run images` : la photo recadrée en AVIF et WebP, les écussons détourés (la bande de BAUDOT repercée au motif exact). Les silhouettes se convertissent en pavés par `npm run mosaique`, puis se retouchent à la main dans `art.js`.
4. Pour le merch, redessiner les logos retenus en vectoriel, en respectant les motifs exacts (la bande perforée de BAUDOT).
5. Pour les photos de produits, donner le logo final en image à Gemini et lui demander de l'imprimer sur le vêtement : il restera identique d'une photo à l'autre.

## Les images déjà générées

| Image | Décision |
|---|---|
| LATENCE (titre vert) | À garder |
| Plaque V40 | À refaire avec « BAUDOT » à la place de la CPI, une grille de 2 × 3 et sans accent |
| Écussons de la compagnie, du vaisseau et du relais de la première version | Abandonnées : remplacées par BAUDOT, MARTINET et RELAIS L7 |
| Terra Maris Atlantica | Abandonnée : hors de l'univers |
