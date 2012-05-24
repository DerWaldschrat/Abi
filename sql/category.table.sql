-- Tabelle, die alle Abi-Award-Kategorien enthält
-- Speichert außerdem, welcher User die Kategorie erstellt hat
CREATE TABLE abi_category (
  categoryid INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(60),
  userid INT
)