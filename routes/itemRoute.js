const express=require("express");
const router=express.Router();
const {getAllItems, getSingleItem, createItem, updateItem, deleteItem} = require('../controller/itemController');

router.get("/", getAllItems);
router.get("/:itemId",getSingleItem);
router.post("/", createItem);
router.patch("/:itemId",updateItem);
router.delete("/:itemId",deleteItem);


module.exports = router;