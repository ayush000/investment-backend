# Backend

The repo contains the backend code for finding the value of investments.

1. Create a mysql database
2. Enter the database credentials in `index.js`. The user must have insert priveleges.
3. Run the statements in `db.sql` to create tables and indexes
4. Open `http://localhost:3005/import` to import the api data into mysql
4. Run `npm install` to install all dependencies in both backend and frontend directories
5. Run `npm start` from the backend directory, so the server will start listening on port 3005
6. Run `npm start` on frontend directory which will be hosted on port 3000.