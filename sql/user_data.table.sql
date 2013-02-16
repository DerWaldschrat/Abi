-- Enthält die Daten eines Users
CREATE TABLE abi_user_data (
  userid INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  geburtstag DATE,
  geschlecht ENUM('male', 'female'),
  strasse VARCHAR(60),
  wohnort VARCHAR(60),

-- Die eigentlich wichtigen Dinge
  danksagung TEXT,
  positiv TEXT,
  negativ TEXT,
  zukunft TEXT
);
ALTER TABLE abi_user_data ADD COLUMN german VARCHAR(3) NULL NULL;
ALTER TABLE abi_user_data ADD COLUMN math VARCHAR(3) NULL NULL;