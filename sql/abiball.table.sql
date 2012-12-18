CREATE TABLE abi_abiball (
	userid INT NOT NULL PRIMARY KEY,
	vote TINYINT NOT NULL DEFAULT 1 -- 1: nicht abgestimmt, 2: möchte keine Karten, 3: nehme Karten
)