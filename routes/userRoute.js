const express= require('express');

const router= express.Router();

const {
    getAllUsers,
    getSingleUser,
    updateUser,
    deleteUser,
}= require('../controller/userController');

const {verifyTokenAdmin,verifyTokenAdminOrUser}=require('../middleware/auth');

router.get("/" ,verifyTokenAdmin, getAllUsers);
router.get("/:userID",verifyTokenAdminOrUser, getSingleUser);
router.patch("/:userID",verifyTokenAdminOrUser, updateUser);
router.delete("/:userID",verifyTokenAdminOrUser, deleteUser);


module.exports = router;