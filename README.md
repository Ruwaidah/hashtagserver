#### Node.js and Express

- Express provides a simple framework for build API routes.
- KnexJS allows us to write queries with JavaScript.

#### DATABASE BUILD BY Aiven [https://console.aiven.io/]

### List Of The Back End Features And Libraries.

- bcryptjs.
- cloudinary.
- jsonwebtoken.
- knex.
- nodemailer.
- pg.
- randomstring.
- socket io.
- uniqid.

# Back End Environment Variables:

In order for the app to function correctly, the user must set up their own environment variables. There should be a .env file containing the following:

- JWT_SECRET: Secret For jsonwebtoken.
- URL: Front End URL.
- DB_ENV: The Environment of DataBase.
- DEVELOPMENT_DB_PASSWORD: Password of The DataBase Development Environmrnt.
- PRODUCTION_DB_PASSWORD: Password of The DataBase Production Environmrnt.
- DB_USER: Username DataBase To Production Environmrnt For Aiven.
- DB_HOST: Host DataBase For Aiven.
- DB_DATABASE_NAME: Name DataBase For Aiven.
- DB_SSL_CA: Certify DataBase Aiven.
- CLOUD_NAME: Name for Cloudinary Config.
- CLOUD_KEY: Key for Cloudinary Config.
- CLOUD_SECRET: Secret for Cloudinary Config.
- IMAGE_PUBLIC_ID: Image Public Id for the default Image From Cloudinary.
- NO_IMAGE: Link For The Default Image when Create Account.

#### [Front end]https://github.com/Ruwaidah/hashtag-fe
