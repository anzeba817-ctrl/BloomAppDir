Agis en tant que Lead Designer UI/UX Senior spécialisé dans les applications mobiles natives (iOS et Android) pour la Génération Z. Génère un système de conception (Design System) complet et les 11 écrans clés en haute fidélité pour l'application de suivi d'habitudes à double mode "Bloom".

Applique scrupuleusement les contraintes graphiques, structurelles et éditoriales suivantes :

---

### 1. CONFIGURATION DU DESIGN SYSTEM (VARIABLES & STYLES FIGMA)

#### A. Palette de Couleurs Stricte (4 Couleurs Primaires + Accents)
Configure les variables de couleur globales. Toutes les combinaisons de texte et de fond doivent impérativement valider le contraste WCAG AA.
- Arrière-plan Mode Clair (Sunbeam Cream) : #FEF8F0
- Arrière-plan Mode Sombre (Deep Night) : #141D24 (Aucun gris générique autorisé !)
- Accent Principal / Boutons CTA : Golden Hour (#E8920A)
- Mode Encrage / Bonnes Habitudes (Build Mode) : Stem Green (#3A7D4F)
- Mode Sevrage / Mauvaises Habitudes (Quit Mode) : Dusk Purple (#6B4FA0)
- Accents de récompense / Étoiles : Petal Yellow (#F5C030)

#### B. Typographie
Configure les styles de texte avec une casse en minuscules régulières pour renforcer la chaleur du ton (lowercase pour les slogans, pas de All-Caps sauf badges/étiquettes).
- Titres & En-têtes (Headings) : Poppins ou Nunito (Poids : Bold, formes rondes et amicales)
- Corps de texte / UI : Nunito Regular ou DM Sans

---

### 2. COMPOSANT MAÎTRE (COMPONENT SET) : MASCOTTE SUNNY
Crée un composant maître nommé "Mascotte_Sunny" avec 2 variantes techniques et les états émotionnels associés (Style Kawaii, gros visage jaune #F5C030 centré, pétales ambre #E8920A, tige verte #3A7D4F, blush ambre translucide, zéro couleur de peau humaine).

- Variante A : Sunny_Classic (Symétrique, épurée, pour icône de l'app, widgets et avatars de notifications).
- Variante B : Sunny_Expressive (Dynamique, pétales inclinés, expressions fortes pour les célébrations et l'onboarding).

Génère les variantes d'états émotionnels de Sunny :
1. Neutral : Posture droite, sourire calme, yeux relaxés doux.
2. Growing : Série active de 3 à 6 jours. Yeux ouverts joyeux, posture dynamique.
3. Blooming : Série de 7+ jours. Pétales étincelants, grand sourire, yeux brillants.
4. Wilting : 1 jour manqué. Pétales légèrement tombants, petite bouche triste, yeux baissés.
5. Struggling : 2+ jours manqués. Mascotte flétrie, yeux inquiets en "X", réclame de l'eau visuellement.
6. Overjoyed : Jalon majeur (7, 30, 100 jours). Yeux en croissants fermés, rire aux éclats, cœurs flottants.
7. Shielded : Bouclier actif. Aura protectrice violette lumineuse autour de Sunny, sourire rassuré.

---

### 3. MAQUETTAGE DES ÉCRANS (À CONSTRUIRE DANS L'ORDRE DE PRIORITÉ)

Conçois les 11 écrans pour iPhone 15 Pro / Android (Zone tactile minimale de 44x44pt pour tous les boutons) :

1. Onboarding - Écran 1 (Bienvenue) : Fond #FEF8F0, Sunny_Expressive (Neutral). Affiche verbatim le texte : "Hello, je m'appelle Sunny Bloom. Tu rayonnes quand tu construis quelque chose de nouveau, et tu rayonnes quand tu te libères enfin de ce qui te retenait. Viens rayonner avec moi." Un bouton CTA "commencer" en #E8920A.
2. Onboarding - Écran 2 (Sélection du Mode) : Interface divisée ou sélecteur mettant en évidence la dualité : à gauche le "Mode Sevrage / Quit" (thème #6B4FA0), à droite le "Mode Encrage / Build" (thème #3A7D4F).
3. Onboarding - Écran 3 (Configuration Habitude) : Formulaire épuré pour créer sa première habitude avec sélecteur de cadence (Quotidienne par défaut, cadences sur-mesure verrouillées par un cadenas).
4. Tableau de Bord Principal (Dashboard Dual-Mode) : Cœur de l'application basé sur un balayage horizontal (Horizontal Scroll).
   - Zone Droite (Build Mode - Vert #3A7D4F) : Affiche la liste des bonnes habitudes, un compteur de séries (streaks) enflammé, et une grille d'activité (Heatmap). Sunny est au centre en version dorée/verte.
   - Zone Gauche (Quit Mode - Violet #6B4FA0) : Compteur de sobriété ("jours libérés"), boutons d'urgence. Sunny est au centre avec des nuances violettes subtiles.
   - Éléments partagés persistants : Barre supérieure affichant le solde des Pétales ordinaires et les icônes de Pétales de Cristal (Maximum 3 emplacements, représentés par des gemmes).
5. Écran de Validation Quotidienne (Check-in Pop-up) : Fenêtre modale surgissant lors de la validation d'une habitude. Intègre un composant de smileys graphiques pour relever l'humeur du jour et un champ de texte épuré pour le journal intime. Pas d'espace publicitaire sur cet écran.
6. Écran de Célébration des Jalons (Milestone) : Écran festif célébrant un cap (ex: 30 jours). Sunny est en état "Overjoyed" au centre, pluie de confettis graphiques, affichage de la citation textuelle : "30 jours. Sunny est FULLY bloomed. Tu did that." avec un bouton "Partager mon succès". Pas de pub.
7. Écran d'Animation d'Économie Émotionnelle : Maquette de transition montrant la fusion de 10 pétales ordinaires se transformant en 1 Pétale de Cristal brillant. Pas de pub.
8. Écran d'Activation du Bouclier (Bloom Shield) : Interface d'activation montrant la dépense d'un cristal. Sunny passe en état "Shielded" avec son aura violette et le message de réconfort : "Un Pétale de Cristal a sauvé la mise. Série protégée. Va te reposer — Sunny gère la situation."
9. Écran de Profil & Historique : Affiche l'historique complet de l'utilisateur sous forme de calendrier/heatmap. En cas de jour manqué, la grille montre Sunny en mode "Wilting", mettant en valeur le système bienveillant (les données historiques ne sont jamais effacées).
10. Écran des Paramètres & Préférences : Configuration des rappels de notifications. Intègre visuellement des exemples de copies bienveillantes (ex: "Good morning. Sunny's up and waiting — don't leave them on read.").
11. Écran de Paywall / Upgrade (Seedling vers Bloom) : Grille tarifaire claire comparant l'offre gratuite "Seedling" (limitée à 3 habitudes, bannières publicitaires) et l'offre "Bloom" ($4.99/mois, habitudes illimitées, 7 émotions de Sunny, zéro pub).

---

### 4. COMPOSANT COMPLÉMENTAIRE : WIDGET ÉCRAN D'ACCUEIL
Conçois un widget carré au format iOS / Android Glance (disponible gratuitement pour le forfait Seedling). Il contient la mascotte Sunny_Classic au centre affichant son état émotionnel actuel basé sur la série de l'utilisateur, un mini-indicateur du nombre de jours de streak, et un arrière-plan propre #141D24 ou #FEF8F0.

Organise proprement tous ces écrans dans des plans de travail (Frames) alignés, nommés clairement de 1 à 11, et prêts pour le prototypage des liaisons de transition.