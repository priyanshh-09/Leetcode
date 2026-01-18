const validator = require('validator');

const validate = (data)=>{
   const mandatoryField = ['firstName','emailId','password'];
   const isAllowed = mandatoryField.every((k)=>Object.keys(data).includes(k));

   if(!isAllowed){
    throw new Error("Some fields missing")
   }
   if(!validator.isEmail(data.emailId)){
    throw new Error("invalid Email")
   }
   if(!validator.isStrongPassword(data.password)) {
     throw new Error("Password must be strong");
   }
}


module.exports = validate