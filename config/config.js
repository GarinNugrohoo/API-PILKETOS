require("dotenv").config();

const isSupabase =
  process.env.DATABASE_URL && process.env.DATABASE_URL.includes("supabase.co");

module.exports = {
  development: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectModule: require("pg"),
    dialectOptions: isSupabase
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  },

  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectModule: require("pg"),
    // pool: {
    //   max: 10,
    //   min: 0,
    //   acquire: 30000,
    //   idle: 0,
    // },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      keepAlive: false,
    },
  },
};
