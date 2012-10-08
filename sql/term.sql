CREATE TABLE abi_term (
  termid INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  datum DATE,
  title VARCHAR(60),
  description TEXT,
  target VARCHAR(10),
  fromid INT,
  INDEX(datum),
  INDEX(target),
  INDEX(fromid)
)