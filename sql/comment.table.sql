-- Diese Tabelle ist für die Kommentare der User
CREATE TABLE abi_comment (
  commentid INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  fromid INT,
  toid INT,
  content TEXT
)