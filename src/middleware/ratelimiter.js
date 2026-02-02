const redisClient = require("../config/redis")


const submitRateLimiter = async(req,res,next)=>{
    if (!req.result || !req.result._id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    
    const userId = req.result._id;
    const redisKey = `submit_cooldown:${userId}`;
    try{
      const exists = await redisClient.exists(redisKey);
      if(exists){
        return res.status(429).json({
            error:"Please wait for 10 seconds before submitting"
        });
      }

      await redisClient.set(redisKey, 'cooldown_active',{
        EX:10,
        NX:true
      })
      next()
    }
    catch(err){
     console.error('Rate Limiter Error: ', err);
     res.status(500).json({error:"internal serverc error"});
    }
}

module.exports = submitRateLimiter;