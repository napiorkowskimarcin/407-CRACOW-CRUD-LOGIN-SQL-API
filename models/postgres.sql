-- create DB:
CREATE DATABASE todo_db;

-- go with \c to new database

CREATE TABLE todo_user(
    us_id SERIAL PRIMARY KEY,
    us_name VARCHAR(255),
    us_password VARCHAR(255)
);

--
SELECT us_name, us_password FROM todo_user WHERE us_name = 'www';