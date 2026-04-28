const HttpCode = require("../controllers/http-code/httpCode");
const jwt = require("jsonwebtoken");

class isMaintenance {
  constructor() {
    this.maintenanceMode = false;
    this.role = "panitia";
  }

  activeMaintenance = (req, res, next) => {
    const { role } = req.dataUser;
    try {
      if (this.maintenanceMode) {
        if (this.role !== role) {
          return HttpCode.send(res, 503, {
            message: "Server sedang dalam pemeliharaan. Coba lagi nanti",
            retry_after: "3600",
          });
        } else {
          next();
        }
      } else {
        next();
      }
    } catch (err) {
      return HttpCode.send(res, 500, {
        message: `${err}`,
      });
    }
  };
}

module.exports = new isMaintenance();
