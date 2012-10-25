-- Die User-Tabelle
-- Enthält nur die zur Anmeldung erforderlichen Daten.
CREATE TABLE abi_user (
    userid INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(60) UNIQUE,
    email VARCHAR(60) UNIQUE,
    vorname VARCHAR(60),
    nachname VARCHAR(60),
    passwort VARCHAR(140)        
);
ALTER TABLE abi_user ADD column new_vote TINYINT NOT NULL DEFAULT 0;