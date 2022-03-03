const { QueryTypes } = require('@sequelize/core');
const _ = require('lodash');
const AsciiTable = require('ascii-table');
const db = require('../../db/models');

const makeTable = (data) => {
  const dataTable = data.map((obj) => Object.values(obj));
  return AsciiTable.factory({
    title: 'Analytical report',
    heading: ['Nickname', 'Email', 'Number of posts', 'Number of comments'],
    rows: dataTable,
  });
};

const getAnalyticalReport = async (startDate, endDate) => {
  try {
    const data = await db.sequelize.query(`
    WITH countPosts AS 
      (SELECT "author_id", COUNT(*) AS "countPosts" FROM "Posts" 
      WHERE "published_at" BETWEEN '${startDate}' AND '${endDate}' GROUP BY "author_id"), 
      countsComments AS (SELECT "author_id" AS "author_comment_id", COUNT(*) AS "countComments" FROM "Comments" 
      WHERE "published_at" BETWEEN '${startDate}' AND '${endDate}' GROUP BY "author_id") 
    SELECT "nickname", "email", "countPosts", "countComments" FROM "Users" 
    LEFT JOIN countPosts ON "author_id" = "id" LEFT JOIN countsComments ON "author_comment_id" = "id" 
    GROUP BY "id", "countPosts", "countComments";`, { type: QueryTypes.SELECT });

    const sortedAnalyticalData = _.sortBy(data, (value) => {
      const posts = Number(value.countPosts) ?? 0;
      const comments = Number(value.countComments) ?? 0;
      return (-(posts + comments) / 10); //  Знака '-' необходим для сортировки по убыванию.
    });
    return makeTable(sortedAnalyticalData);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = getAnalyticalReport;
