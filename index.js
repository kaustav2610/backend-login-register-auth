import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import  jwt  from "jsonwebtoken";
import bcrypt from "bcrypt";

//database creation
mongoose.connect("mongodb://localhost:27017",{
    dbName:"back_end"
})
.then(()=>console.log("Database is connected"))
.catch((e)=>console.log(e));


//createSchema
const messegeSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
})

//creating collection
const col1=mongoose.model("col1",messegeSchema);

const app=express();


//middleware
app.use(express.static(path.join(path.resolve(),"public"))); //access static files of public
app.use(express.urlencoded({extended:true}))   //use to access data submitted by the form
app.use(cookieParser())
//setting up view engine
app.set("view engine","ejs");



const isAuthenticated=async(req,res,next)=>{
    const {token}=req.cookies;
    if(token){
        const decoded=jwt.verify(token,"ghggfgjhgjhgr");   //decoded user id
        req.user=await col1.findById(decoded._id)
        next();
    }else{
        res.redirect("/login")
    }
};
app.get("/",isAuthenticated,(req,res,)=>{
    
    res.render("logout",{name: req.user.name}) 
});
app.get("/register",(req,res,)=>{
    
    res.render("register")
});
app.get("/login",(req,res,)=>{
    
    res.render("login")
});


app.get("/logout",(req,res)=>{
    res.cookie("token","null",{
        httpOnly: true,
        expires:new Date(Date.now()),
    });
    res.redirect("/")
});




//Authentication

app.post("/login",async(req,res)=>{
    const{email,password}=req.body;
    let user=await col1.findOne({email});
    if (!user) {
        return res.redirect("/register"); 
      }

    const isMatch=await bcrypt.compare(password,user.password);

    if(!isMatch) return res.render("login",{email,message:"Incorrest password"})

    const token=jwt.sign({_id:user._id},"ghggfgjhgjhgr")


    res.cookie("token",token,{
        httpOnly:true,          //making it more secure(cookie access by server side only,not n client side)
        expires:new Date(Date.now()+60*1000),
    });
    
    res.redirect("/")
      
})
app.post("/register",async(req,res)=>{
    const{name,email,password}=req.body;

    
    let user=await col1.findOne({email})
    if (user) {
        return res.redirect("/login"); 
    }

    const hashedPassword=await bcrypt.hash(password,10)
      

    user=await col1.create({name,email,password:hashedPassword})

    const token=jwt.sign({_id:user._id},"ghggfgjhgjhgr")


    res.cookie("token",token,{
        httpOnly:true,          //making it more secure(cookie access by server side only,not n client side)
        expires:new Date(Date.now()+60*1000),
    });
    
    res.redirect("/")

});



app.listen(5000,()=>{
    console.log("server running Smoothly");
});