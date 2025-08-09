const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Var@7-shini",
  database: "expense_tracker"
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ MySQL Connected...");
});

module.exports = db;
