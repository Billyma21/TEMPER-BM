# ADR-006 : Monde 3D en React Three Fiber, isométrique, alimenté par un instantané filtré

**Statut** : accepté

**Décision** : React Three Fiber + drei dans l application web (pas de moteur de jeu séparé), caméra orthographique isométrique, géométries simples, étiquettes DOM. Les données viennent d un point d entrée unique `/world/snapshot` construit côté API avec les mêmes filtres de droits que le reste ; mises à jour par événements Socket.IO regroupés.

**Alternatives écartées** : Unity / Godot en WebGL (poids, intégration des droits et du routage, compétences), Three.js impératif (moins maintenable).

**Conséquences** : le monde est léger, testable par captures, et ne peut pas révéler plus que le Bureau.

MAAYOUD
