CREATE TABLE abi_images(
    imageid INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    origname VARCHAR(255) NOT NULL,
    fromid INT NOT NULL,
    INDEX(fromid),
    UNIQUE(name)
)
