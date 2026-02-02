import { useState } from 'react'

export default function Signup() {
    const[name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [password, setPassword] = useState("");


    const handleSubmit = (e)=>{
      e.preventDefault();
    }
    
  return (
    <form action="" onSubmit={handleSubmit}>
      <input
        type="text"
        name="firstName"
        value={name}
        placeholder="Enter Your Name"
        onChange={(e)=>setName(e.target.value)}
      />
    </form>
  );
}
