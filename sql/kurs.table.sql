-- Tabelle, um alle Kurse zu speichern
CREATE TABLE abi_kurs (
  kursid INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  kuerzel VARCHAR(10),
  lehrer VARCHAR(80),
  fach VARCHAR(40),
  stunden VARCHAR(40),
  fromid INT
)