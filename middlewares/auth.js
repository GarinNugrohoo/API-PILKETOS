const HttpCode = require("../controllers/http-code/httpCode");
const jwt = require("jsonwebtoken");

class Auth {
  roleAccess(rolePengguna) {
    return (req, res, next) => {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token)
        return HttpCode.send(res, 401, {
          message: "Akses tidak valid",
        });

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err)
          return HttpCode.send(res, 403, {
            message: "Login tidak valid",
          });

        req.dataUser = decoded;

        const index = rolePengguna.length;

        for (var i = 0; i < index; i++) {
          if (decoded.role == rolePengguna[i]) {
            return next();
          }
        }

        if (decoded.role !== rolePengguna) {
          return HttpCode.send(res, 401, {
            message: "Akses ditolak",
          });
        }

        next();
      });
    };
  }
}
module.exports = new Auth();
