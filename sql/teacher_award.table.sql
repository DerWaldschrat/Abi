CREATE TABLE abi_teacher_award (
	awardid INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	categoryid INT NOT NULL,
	userid INT NOT NULL,
	firstid INT DEFAULT -1,
	secondid INT DEFAULT -1,
	thirdid INT DEFAULT -1,
	UNIQUE(`categoryid`, `userid`) 
)