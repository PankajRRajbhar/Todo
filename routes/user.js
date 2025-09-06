const { Router } = require("express");
const { register, login } = require("../controller/users");


const route = Router();

route.post("/user/register", register);
route.post("/user/login", login);

module.exports = route;