-- Tabelle für die Awards, die für den jeweiligen Award die Wünsche des Users speichern

CREATE TABLE abi_award (
  awardid INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  maleid INT,
  femaleid INT,
  categoryid INT,
  userid INT
);