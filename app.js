// Run npm install, then also install mongoose and lodash

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


// Run main function and catch error, run async function for mongoose
main().catch(err => console.log(err));
async function main() {
  // For local server
  // await mongoose.connect('mongodb://localhost:27017/todolistDB');
  // For mongoDB atlas
  await mongoose.connect('mongodb+srv://admin-kevin:toyotamr2@atlascluster.4jtuj3y.mongodb.net/todolistDB');
  // Create schema
  const itemsSchema = new mongoose.Schema({
    name: String
  });
  // Create model
  const Item = mongoose.model("Item", itemsSchema);
  const item1 = new Item({
    name: "Welcome to your todolist!"
  });
  const item2 = new Item({
    name: "Hit the + button to add a new item."
  });
  const item3 = new Item({
    name: "<-- Hit this to delete an item."
  });

  const defaultItems = [item1, item2, item3];

  // Create new Schema
  const listSchema = {
    name: String,
    items: [itemsSchema]
  };
  // Create new model
const List = mongoose.model("List", listSchema);


  app.get("/", function (req, res) {
    Item.find({}, function (err, foundItems) {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err)
          } else {
            console.log("Successfully saved default items to DB.");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: foundItems
        });
      };
    });
  });

  app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
      if(!err){
        if(!foundList){
// Create a new list
const list = new List({
  name: customListName,
  items: defaultItems
});
 list.save();
 res.redirect("/" + customListName);
        } else {
// Show an existing list
res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
        };
      };
    });
  });

  app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
      name: itemName
    });
    if(listName === "Today"){
    item.save();
    res.redirect("/");
    } else {
      List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    };
  });

  app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
      Item.findByIdAndRemove(checkedItemId, function (err) {
        if (!err) {
          console.log("Successfully deleted checked item.")
          res.redirect("/");
        };
      });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
              res.redirect("/" + listName)
            };
        });
      };
  });

  // End async function main
};




app.get("/about", function (req, res) {
  res.render("about");
});

// Heroku port
let port = process.env.PORT || 3000
app.listen(port, ()=>{
console.log("server running on " + port)})
// Kept for record during touble shooting
// let port = process.env.PORT;
// if (port == null || port == ""){
//   port = 3000;
// };
// app.listen(port, function () {
//   console.log("Server has started successfully!");
// });

// Keep for record. During trouble shooting this wasa in package.json under "scripts" originaly
    // "test": "echo \"Error: no test specified\" && exit 1"