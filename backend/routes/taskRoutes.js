const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const auth = require("../middleware/auth");

router.post("/", auth, taskController.createTask);
router.get("/", auth, taskController.getAllTasks);
router.get("/:id", auth, taskController.getTaskById);
router.patch("/:id", auth, taskController.updateTask);
router.delete("/:id", auth, taskController.deleteTask);

module.exports = router;
