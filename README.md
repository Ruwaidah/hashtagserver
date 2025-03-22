# HashTag Chat Server

You can find the deployed project at [https://hashtagserver.onrender.com/]

# Installation Instructions

After cloning, CD into hashtagserver, run "npm install", then "npm run server".

## Tech Stack

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


## Endpoints

#### User Routs
| Method | Endpoint                              | Access Control | Description                            |
| ------ | ------------------------------------  | -------------- | -------------------------------------- |
| POST   | `/api/users/register`                 | all users      | Returns info for the logged in user.   |
| POST   | `/api/users/login`                    | all users      | Returns info for the registered user.  |
| POST   | `/api/send_recovery_email`            | all users      | Returns Hashed OTP.                    |
| POST   | `/api/change_password`                | all users      | Change The Password.                   |
| GET    | `/api/getuser/:id`                    | all users      | Get User By Id.                        |
| POST   | `/api/checkusername`                  | all users      | Check Username Availability.           |
| PUT    | `/api/updateuser/:id`                 | all users      | Update User.                           |
| PUT    | `/api/image`                          | all users      | Update Image User.                     |
| POST   | `/api/findfriend`                     | all users      | Search By Email or Username.           |
| POST   | `/api/getsearcheduser/:searcheduser`  | all users      | Get Friend By Id.                      |
| POST   | `/api/sendrequest`                    | all users      | Send Request Friend.                   |
| GET    | `/api/acceptfriendrequest`            | all users      | Accept Friend Request.                 |
| DELETE | `/api/rejectfriendrequest`            | all users      | Reject Friend Request.                 |
| DELETE | `/api/cancelrequest`                  | all users      | Cancel Friend Request.                 |
| GET    | `/api/friendslist/:id`                | all users      | Get All Friends List.                  |
| DELETE | `/api/deletefriend`                   | all users      | Delete Friend.                         |




#### Messages Routs

| Method | Endpoint                              | Access Control | Description                            |
| ------ | ------------------------------------  | -------------- | -------------------------------------- |
| POST   | `/api/auth/message`                   | all users      | Save The Message.                      |
| GET    | `/api/auth/message`                   | all users      | Get All Messages Between Two Users.    |
| GET    | `/api/auth/listmessages`              | all users      | Get All Messages.                      |
| PUT    | `/api/auth/openmessages`              | all users      | Update Open Unread Message.            |












#### [Front end]https://github.com/Ruwaidah/hashtag-fe
