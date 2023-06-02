const itemModel= require("../model/item");

const getAllItems = async (req,res) => {
    try {
        //to display all items in collection
        const result= await itemModel.find();
        res.json(result);
    }catch(err){
        res.status(500).json({ message: "Something went wrong", error: err });
    }
};

const getSingleItem = async (req,res) => {
    const {itemId} =req.param;
    try {
        //to display all items in collection
        const {itemId} =req.params;
        console.log(itemId);
        const result= await itemModel.findById(itemId);
        res.json(result? result : 'Something went wrong');
    }catch(err){
        res.status(500).json({ message: "Something went wrong", error: err });
    }
};

const createItem = async (req,res) => {
    try{
        //to display all items in collection
        console.log(req.body);
        const result= await itemModel.create(req.body)
        res.json(result);
    }catch(err){
        console.log("Something went wrong")
        res.status(500).json({ message: "Something went wrong", error: err });
    }
}

const updateItem = async (req,res) =>{
    const {itemId} =req.param
    try{
        //to display all items in collection
        const result= await itemModel.findByIdAndUpdate(itemId, req.body,{new:true})
        res.json(result);
    }catch(err){
        res.status(500).json({ message: "Something went wrong", error: err });
    }
};

const deleteItem = async (req,res) => {
    const {itemId} =req.param
    try{
        //to display all items in collection
        const result= await itemModel.findByIdAndDelete(itemId);
        res.json(result);
    }catch(err){
        res.status(500).json({ message: "Something went wrong", error: err });
    }
}

module.exports = {getAllItems, getSingleItem, createItem, updateItem, deleteItem};