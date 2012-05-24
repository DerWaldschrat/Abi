CREATE VIEW abi_v_award AS
SELECT category.categoryid, award.awardid, category.title, award.userid, award.maleid, award.femaleid FROM abi_category AS category
LEFT JOIN abi_award AS award ON award.categoryid = category.categoryid