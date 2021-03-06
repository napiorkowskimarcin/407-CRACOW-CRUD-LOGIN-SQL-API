const { Pool } = require("pg");
//
const isProduction = process.env.NODE_ENV === "production";
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?ssl=true`;

// const pool = new Pool({
//   user: "postgres",
//   password: "8mlody8",
//   database: "todo_db",
//   host: "localhost",
//   port: "5432",
// });

const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
