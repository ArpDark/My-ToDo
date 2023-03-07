const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set("strictQuery",false);
mongoose.connect("mongodb+srv://admin-aritra:hello123@cluster0.8a9fiy3.mongodb.net/todolistDB");

const itemsSchema=new mongoose.Schema({
  name: String
});
const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to TODO list"
});
const item2=new Item({
  name:"Hit + button to add new item"
});
const item3=new Item({
  name:"Hit Clear button to delete an item"
});

const listSchema={
  name: String,
  item:[itemsSchema]
};
const List=mongoose.model("List",listSchema);

const defaultItems=[item1,item2,item3];
app.get("/", function(req, res) {

  Item.find({},function(err,items){  //items is a js object not a JSON
    if(items.length===0)
    {
      Item.insertMany(defaultItems,function(err){  //for inserting multiple items
        if(err)
        {
          console.log(err);
        }
        else
        {
          console.log("Inserted successfully");
        }
      });
    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });

});

app.post("/", function(req, res){
  const itemName=req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });
  if(listName=="Today")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:listName},function(err,foundList){
      foundList.item.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});
app.post("/delete",function(req,res){
  const checkedItem=req.body.checkbox;
  const listName=req.body.listName;

  if(listName=="Today")
  {
    Item.findByIdAndRemove(checkedItem,function(err){
      if(err)
      {
        console.log(err);
      }
      else
      {
        console.log("Deleted successfully");
        res.redirect("/");
      }
    });
  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{item:{_id:checkedItem}}},function(err,results){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/:parameter", function(req,res){
  const customName= _.capitalize(req.params.parameter);
  
  List.findOne({name:customName},function(err,results){
    if(!results)
    {
      const list=new List({
        name:customName,
        item:defaultItems
      });
      list.save();
      console.log("saved successfully");
      res.redirect("/"+customName);
    }
    else
    {
      res.render("list", {listTitle: results.name, newListItems: results.item});
    }
  });
});

app.get("/about", function(req, res){

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
