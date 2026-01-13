import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import prisma from '../prismaClient.js'

const router=express.Router()

router.post('/register',async(req,res)=>{
  const {email,password,username}=req.body;

  const hashedPassword=bcrypt.hashSync(password,10)

  try{
    const user=await prisma.user.create({
      data:{
        email,
        password:hashedPassword,
        username
      }
    })
    // const defaultTask=`this is you default first task for testing purpose`
    // await prisma.task.create({
    //   data:{
    //     content:defaultTask,
    //     userId:user.id
    //   }
    // })

    const token=jwt.sign({id:user.id},process.env.JWT_SECRET,{expiresIn:'12h'})
    res.json({token})
  }catch(err){
    console.log(err.message)
    res.sendStatus(503)
  }
})

router.post('/login',async(req,res)=>{
  const {email,password}=req.body;

  try{
    const user=await prisma.user.findUnique({
      where:{
        email:email
      }
    })
    if(!user){
      return res.status(404).send({
        message:"user not found"
      })
    }

    const passwordIsValid=bcrypt.compareSync(password,user.password)

    if(!passwordIsValid){
      return res.status(401).send({
        message:"Invalid pasword"
      })
    }
    console.log(user);

    const token=jwt.sign({id:user.id},process.env.JWT_SECRET,{expiresIn:'12h'})
    res.json({token})
  }catch(err){
    console.log(err.message)
    res.sendStatus(503)
  }
})





export default router;