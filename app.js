import express, { application } from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from 'url';
import path from "path";
import mongoose from "mongoose";
import _ from "lodash";



const app = express();

mongoose.connect("mongodb+srv://Anil:AnilKumar123@cluster0.8g85zse.mongodb.net/todoListDB");

const itemSchema = new mongoose.Schema({
    name: String
})

const Item = new mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "buy cloth"
})

const item2 = new Item({
    name: "buy cake"
})

const item3 = new Item({
    name: "buy food"
})

const defaultItems = [item1, item2, item3];

const listSchema = ({
    name: String,
    items: [itemSchema]
})

const List = new mongoose.model("List", listSchema);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/",async function(req,res) {


// Item.insertMany(defaultItems);

const todoData = await Item.find({});

if (todoData.length === 0) {
    await Item.insertMany(defaultItems);
    res.redirect("/");
} else {
    res.render("list",{listTitle: "Today", newListItems: todoData});
}
})



app.post("/", async function(req, res){  
    let itemName = req.body.newItem;
    let listName = req.body.list;
    const newItem = new Item({
        name: itemName
    })

    if (listName === "Today") {
        newItem.save();
        res.redirect("/");
    } else {
        const foundCustomList = await List.findOne({name: listName}).exec();
        foundCustomList.items.push(newItem);
        foundCustomList.save();
        res.redirect("/"+ listName);
    }
    
    
});

app.post("/delete",async function(req, res){
    const itemToBeRemoved = req.body.checkbox;
    const listName = req.body.listName;

   
    if (listName === "Today") {
        await Item.findByIdAndRemove(itemToBeRemoved).exec();
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName},{ $pull: {items: {_id: itemToBeRemoved }}}).exec();
        res.redirect("/" + listName);
    }

}) 


app.get("/about", function(req, res){
    res.render("about");
})


app.get("/:customListName", async function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    const found = await List.findOne({name: customListName}).exec();
    if(!found) {
        const list = new List({
            name: customListName,
            items: defaultItems
        })
        list.save();
        res.redirect("/"+customListName);
    } else {
        res.render("list", {listTitle: found.name, newListItems:found.items});
    }

})


app.listen(3000, function(){
    console.log("server is running at port 3000");
})