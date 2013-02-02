-- Enthält das SQL für die Datentabelle, etwa Größe, Gewicht, Schuhgröße...
CREATE TABLE abi_data (
  dataid INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  categoryid INT NOT NULL,
  `value` VARCHAR(15), -- Muss VARCHAR sein, auch wenn das eigentlich überhaupt nicht schön ist...
  userid INT NOT NULL
);
ALTER TABLE `abi_data` ADD INDEX `userid_index` ( `userid` );