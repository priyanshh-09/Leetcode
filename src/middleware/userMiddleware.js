const userMiddleware = async (req,res,next)=>{
    const {token} = req.cookies;
    if(!token){
        throw new Error("No Token");
    }

    const payload =  Jwt.verify(token,process.env.JWT_KEY);
    const {_id} = payload;
    if(!_id){
        throw new Error("invalid Token");
    }
    const res = await User.findById(_id);
    if(!res){
      throw new Error("User Does not Exit");
    }

//    await
}