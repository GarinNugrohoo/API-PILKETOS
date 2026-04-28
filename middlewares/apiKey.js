class ApiKey {
  keyAccess(req, res, next) {
    const userApiKey = req.headers["x-api-key"];
    const validApiKey = process.env.APIKEY;

    if (!userApiKey || userApiKey !== validApiKey) {
      return res.status(401).json({
        message: "Invalid APIKEY",
      });
    }

    next();
  }
}

module.exports = new ApiKey();
