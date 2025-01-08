import jwt from "jsonwebtoken";

const protectRoute = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization) {
    const secret = process.env.JWT_SECRET;
    jwt.verify(authorization, secret, function (err, decodedToken) {
      if (err) res.status(401).json({ message: "Unauthorized Invalid Token" });
      else {
        req.token = decodedToken;
        next();
      }
    });
  } else {
    res.status(401).json({ message: "Unauthorized No Token Please Login First" });
  }
};

export default protectRoute;
