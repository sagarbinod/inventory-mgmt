const express=require("express");
const router=express.Router();
const {getAllItems, getSingleItem, createItem, updateItem, deleteItem} = require('../controller/itemController');

const {checkAPIKey,verifyTokenAdmin} = require('../middleware/auth');

router.get("/",checkAPIKey,verifyTokenAdmin, getAllItems);
router.get("/:itemId",checkAPIKey,getSingleItem);
router.post("/",checkAPIKey,verifyTokenAdmin, createItem);
router.patch("/:itemId",checkAPIKey,verifyTokenAdmin,updateItem);
router.delete("/:itemId",checkAPIKey,verifyTokenAdmin,deleteItem);


module.exports = router;