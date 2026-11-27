-- Extensions utiles à TEMPER (recherche approchée sur noms d articles, clients, employés)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
-- Base de test pour les tests d intégration de l API
CREATE DATABASE temper_test OWNER temper;
