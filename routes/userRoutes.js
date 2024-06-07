const express = require("express");
const router = express.Router();
const users = require("./../models/user");
const {jwtAuthMiddleware,generateToken}=require('../jwt');


router.post("/signup", async (req, res) => {
  try {
    const existingAdmin = await users.findOne({ role: 'admin' });
    const signupExist=req.body.role;
  
    if (existingAdmin && signupExist==='admin') {
      return res.status(403).json({ message: "Admin already exists. Cannot create another admin." });
    }
    const data = req.body;
    const newuser = new users(data);
    const response = await newuser.save();
    console.log("data saved");
    const payload={
      id:response.id
      
    }
    console.log(JSON.stringify(payload));
    const token =generateToken(payload);
    console.log("Token is:",token);

    res.status(200).json({response:response,token:token});
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server Error" });
  }
});
router.post('/login',async(req,res)=>{
  try{
    const {aadharCardNumber,password}=req.body;
    const user=await users.findOne({aadharCardNumber:aadharCardNumber});
    if(!user || !(await user.comparePassword(password))){
      return res.status(401).json({error:"Invalid aadhar or password"});
    }
    const payload={
      id:user.id,
      aadharCardNumber:user.aadharCardNumber,
    }
    const token = generateToken(payload);
    res.json({token});

  }catch(e){
    console.error(e);
    res.status(500).json({error:'Internal server error'});

  }
});
router.get("/profile",jwtAuthMiddleware, async (req, res) => {
  try {
    const userData=req.users;
    const userId=userData.id;
    const user = await users.findById(userId);
    console.log("data fetched");
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
});

router.put("/profile/password",jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.users;
    const{currentPassword,newPassword}=req.body;
    const user=await users.findById(userId);
    if( !(await user.comparePassword(password))){
      return res.status(401).json({error:"Invalid username or password"});
    }
    users.passworrd=newpassword;
    await user.save();
    console.log("Password Updated")
    res.status(200).json({message:"Password Updated"});
  } catch (error) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
});

module.exports = router;
