import express from 'express'
import prisma from '../prismaClient.js'


const router=express.Router();

//get all tasks
router.get('/',async(req,res)=>{
  const statusFilter = req.query.status; 

    let whereStmt = {
        userId: req.userId,
        //isDeleted: false
    };

    
    if (statusFilter === 'completed') {
  
        whereStmt.status = true;
    } else if (statusFilter === 'pending') {
        
        whereStmt.status = false;
    }
    

    try {
        const tasks = await prisma.task.findMany({
            where: whereStmt,
            orderBy: {
                date: 'desc' 
            }
        });
        res.json(tasks);
    } catch (err) {
        console.error("Error fetching tasks:", err.message);
        res.sendStatus(500);
    }
})

//create a new task

router.post('/',async(req,res)=>{
  const {content}=req.body;
  const task=await prisma.task.create({
    data:{
      content,
      userId:req.userId
    }
  })
  res.json({task})
})


router.put('/:id',async(req,res)=>{
  const {status}=req.body;
  const {id}=req.params;
  const updateTask=await prisma.task.update({
     where:{
      id:parseInt(id),
      userId:req.userId
    },
    data:{
      status:!!status
    }
   
  })
  //console.log(updateTask)
  res.json({message:"task updated"})
})


export default router