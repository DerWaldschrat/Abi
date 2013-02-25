CREATE TABLE abi_rating (
  ratingid INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  userid INT NOT NULL,
  lesson ENUM('german', 'math', 'history'),
  -- Die Bewertungskriterien
  kursklima TINYINT,
  zusammenhalt TINYINT,
  kreativitaet TINYINT,
  fairness TINYINT,
  motivation TINYINT,
  UNIQUE limit_entries (`userid`, `lesson`),
  INDEX fast_user (`userid`)
)