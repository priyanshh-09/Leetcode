const express = require("express");
const Problemrouter = express.Router();


Problemrouter.post('/create',problemcreate);
Problemrouter.get('/:id',problemfetch);
Problemrouter.get('/',problemfetchall);
Problemrouter.patch('/:id',problemupdate);
Problemrouter.delete("/:id", problemdelete);
Problemrouter.get("/user",problemsolved);

