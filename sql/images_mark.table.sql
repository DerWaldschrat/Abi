CREATE TABLE abi_images_mark (
    markid INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fromid INT NOT NULL,
    imageid INT NOT NULL,
    x SMALLINT NOT NULL,
    y SMALLINT NOT NULL,
    toid SMALLINT NOT NULL,
    INDEX(fromid),
    INDEX(toid)
)