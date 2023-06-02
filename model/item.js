const mongoose=require("mongoose");

const itemSchema=mongoose.Schema({
    itemName:{
        type:String,
        required:[true,"Iitem name is required"],
        unique:true,
        minlength:3,
        maxlength:50
    },
    description:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    quantity:{
        type: Number,
        required:true,
        min: 0
    },
});

const itemModel= mongoose.model('item',itemSchema);

module.exports =itemModel;