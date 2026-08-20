import oracledb from "oracledb";

const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECT_STRING,
};


let pool: oracledb.Pool;

export async function getDatabaseConnection() {
  if (!pool) {
    pool = await oracledb.createPool(dbConfig);
  }
  return await pool.getConnection();
}
