const express = require("express");
const router = express.Router();
const Candidate = require("./../models/candidate");
const {jwtAuthMiddleware,generateToken}=require('../jwt');
const User = require("./../models/user");

const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (user && user.role === 'admin') {
      return true;
    }
    return false;
  } catch (e) {
    console.error(e);
    return false;
  }
};
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(401).json({ message: "user has not admin role" });
    }
    const party = req.body.party;
    const existingCandidate = await Candidate.findOne({ party });

    if (existingCandidate) {
      return res.status(409).json({ message: "Candidate with the same party already exists" });
    }
    const data = req.body;
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();
    console.log("data saved");

    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server Error" });
  }
});

// List all candidates
router.get("/list", jwtAuthMiddleware, async (req, res) => {
  try {
    const candidates = await Candidate.find();
    console.log("data fetched");
    res.status(200).json(candidates);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
});

// Update a candidate
router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(401).json({ message: "user has not admin role" });
    }
    
    const candidateId = req.params.candidateId;
    const updatedCandidateData = req.body;
    const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
      new: true,
      runValidators: true
    });
    if (!response) {
      return res.status(404).json({ message: "candidate not found" });
    }
    res.status(200).json({ message: "Candidate Updated", response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
});

// Delete a candidate
router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(401).json({ message: "user has not admin role" });
    }
    const candidateId = req.params.candidateId;
    const response = await Candidate.findByIdAndDelete(candidateId);
    if (!response) {
      return res.status(404).json({ message: "candidate not found" });
    }
    res.status(200).json({ message: "Candidate Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
});
router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
  const candidateId = req.params.candidateId;
  const userId = req.user.id;

  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVoted) {
      return res.status(400).json({ message: "You have already voted" });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: "Admin cannot vote" });
    }

    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    user.isVoted = true;
    await user.save();

    return res.status(200).json({ message: "Vote registered successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/vote/count',async(req,res)=>{
  try{
    const candidates=await Candidate.find().sort({voteCount:'desc'});
    const voteRecord=candidates.map((data)=>{
      return{
        party:data.party,
        count:data.voteCount
      }
    });
    res.status(200).json(voteRecord);
  }catch(e){
    console.log(e);
    res.status(500).json({message:"Internal server error"});

  }
})
module.exports = router;
