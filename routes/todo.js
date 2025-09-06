const { Router } = require("express");
const { create, update, delete: deleteTodo, getAll,toggleDone } = require("../controller/todo");
const { isAuth } = require("../middleware/isAuth");



const route = Router();

route.post("/todo", isAuth, create);
route.put("/todo", isAuth, update);
route.delete("/todo", isAuth, deleteTodo);
route.get("/todo", isAuth, getAll );
route.get("/todo/toggle_status", isAuth, toggleDone);


module.exports = route;
