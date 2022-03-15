const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const PORT = process.env.PORT || 3000;
// const port=80;
// app.use(express.json({extended:false}));

const ejs = require("ejs");
app.set("view engine", "ejs");


app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.get("/", (req, res) => {
  res.render("index");
});


// fetching data from  mongodb

let userSchema = {
  // _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    min: 0,
    required: true,
  },
};
let transactionSchema = {
  fromName: {
    type: String,
    required: true,
  },
  toName: {
    type: String,
    required: true,
  },
  transfer: {
    type: Number,
    required: true,
  },
};
const User = mongoose.model("User", userSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
app.get("/view", (req, res) => {
  User.find({}, function (err, users) {
    // console.log(users),
    res.render("view", {
      usersList: users,
    });
  });
});

app.get("/view/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  const users = await User.find({});
  res.render("transaction", { user, users });
});

app.get("/view/:id1/:id2", async (req, res) => {
  const { id1, id2 } = req.params;
  const fromUser = await User.findById(id1);
  const toUser = await User.findById(id2);
  res.render("form", { fromUser, toUser });
});
app.put("/view/:id1/:id2", async(req, res) =>{
    const {id1, id2} = req.params;
    const credit = parseInt(req.body.credit);
    const fromUser = await User.findById(id1);
    const toUser = await User.findById(id2);

    if(credit <= fromUser.credits && credit>0){
        
        let fromCreditsNew = fromUser.credits - credit;
        let toCreditsNew = parseInt(toUser.credits + credit);
        await User.findByIdAndUpdate(id1, {credits : fromCreditsNew}, { runValidators: true, new: true });
        await User.findByIdAndUpdate(id2, {credits : toCreditsNew}, { runValidators: true, new: true });

        let newTransaction = new Transaction();
        newTransaction.fromName = fromUser.name;
        newTransaction.toName = toUser.name;
        newTransaction.transfer = credit;
        await newTransaction.save();
        res.redirect("/view");
       
        
    }
    else{
        res.render('error');
    }
});

app.get("/history", async (req, res) => {
  const transactions = await Transaction.find({});
  res.render("history", { transactions });
});

if (process.env.NODE_ENV==='production') {
  app.use(express.static('/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname,'build','index.html'));
  })
}


// Establishing connection
// main().catch(err => console.log(err));

// async function main() {
//   await mongoose.connect('mongodb://localhost:27017/banking-system');
// }

mongoose.connect(process.env.MONGODB_URL||
  "mongodb+srv://tripti:tsf@cluster0.qt7uu.mongodb.net/banking-system?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// Start the server

app.listen(PORT, function () {
  console.log("server is running");
});