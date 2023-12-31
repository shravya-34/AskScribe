import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Router } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import path from 'path'

import dotenv from 'dotenv'
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const JWT_SECRET =process.env.JWT_SECRET;
const mongoUrl = process.env.mongoUrl;

import UserInfo from './userDetails.js';
import PdfDetails from './pdfDetails.js';

const app = express();
app.use(bodyParser.json({limit : '10mb'}));
app.use(bodyParser.urlencoded({extended:true, limit:'10mb'}));
app.use(express.json());
app.use(cors());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => console.log(e));
const User = mongoose.model("UserInfo");
const Pdf = mongoose.model("PdfDetails");

app.post("/register", async (req, res) => {
  const { fusername, femail, fpassword} = req.body;
  const encryptedPassword = await bcrypt.hash(fpassword, 10);
  try {
    const oldUser = await User.findOne({ femail });
    if (oldUser) {
      return res.json({ error: "User Exists" });
    }
    await User.create({
      fusername,
      femail,
      fpassword: encryptedPassword,
    });

  const token = jwt.sign({ femail: femail, fname: fusername }, JWT_SECRET, {
    expiresIn: "15m",
  });
  return res.json({ status: "ok", data: token });
  }catch(error){
    res.json({ status: "error" });
  }
});


app.post("/login-user", async (req, res) => {
  const {femail, fpassword} = req.body;
  const user = await User.findOne({ femail });
  if (!user) {
    return res.json({ error: "User Not found" });
  }
  if (await bcrypt.compare(fpassword, user.fpassword)) {
    const token = jwt.sign({ femail: user.femail, fname: user.fusername }, JWT_SECRET, {
      expiresIn: "15m",
    });
    if (res.status(201)) {
      return res.json({ status: "ok", data: token });
    } else {
      return res.json({ error: "error" });
    }
  }
  res.json({ status: "error", error: "Invalid Password" });
});


app.post('/upload-pdf',async(req,res)=>{
  const {base64, femail}=req.body;
  try {
    const user = await Pdf.findOne({ femail });
    if (!user) {
      await Pdf.create({
        pdf:[base64],
        femail,
      });
    }else{
      try{
        await Pdf.updateOne(
          {femail: femail},
          {$push: { pdf:base64 } } )
      }
      catch(error){
        res.send({Status:'Not able to add to pdf', data:error});
      }
    }
    res.send({Status:'ok'});
  }catch(error){
    res.send({Status:'error',data:error});
  }
})

app.get('/getpdf/:femail', async (req, res) => {
  
  const femail  = req.params.femail;
  try{
    const user = await Pdf.findOne({ femail });
    if (!user){
      return res.json({ status: "error", error:'No Pdf Exists' });
    }
    res.send({status:'ok', data:user.pdf});
  }catch (error) {
    res.json({status:"error", error:"No Pdf Exists"});
  }
});

app.post('/deletepdf', async (req, res) => {
  const {pdf, femail}=req.body;
  try{
    await Pdf.updateOne(
      {femail: femail},
      { pdf:pdf }
    );
    return res.json({status:'FILE DELETED SUCCESSFULLY'})
  }catch(error){
    res.json({status: "error", error:error})
  }
})

app.listen(process.env.port || 5000, () => {
  console.log("Server Started");
});


// app.post("/userData", async (req, res) => {
//   const { token } = req.body;
//   try {
//     const user = jwt.verify(token, JWT_SECRET, (err, res) => {
//       if (err) {
//         return "token expired";
//       }
//       return res;
//     });
//     console.log(user);
//     if (user == "token expired") {
//       return res.send({ status: "error", data: "token expired" });
//     }

//     const useremail = user.email;
//     User.findOne({ email: useremail })
//       .then((data) => {
//         res.send({ status: "ok", data: data });
//       })
//       .catch((error) => {
//         res.send({ status: "error", data: error });
//       });
//   } catch (error) { }
// });


// app.post("/forgot-password", async (req, res) => {
//   const { email } = req.body;
//   try {
//     const oldUser = await User.findOne({ email });
//     if (!oldUser) {
//       return res.json({ status: "User Not Exists!!" });
//     }
//     const secret = JWT_SECRET + oldUser.password;
//     const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
//       expiresIn: "5m",
//     });
//     const link = `http://localhost:5000/reset-password/${oldUser._id}/${token}`;
//     var transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "adarsh438tcsckandivali@gmail.com",
//         pass: "rmdklolcsmswvyfw",
//       },
//     });

//     var mailOptions = {
//       from: "youremail@gmail.com",
//       to: "thedebugarena@gmail.com",
//       subject: "Password Reset",
//       text: link,
//     };

//     transporter.sendMail(mailOptions, function (error, info) {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log("Email sent: " + info.response);
//       }
//     });
//     console.log(link);
//   } catch (error) { }
// });

// app.get("/reset-password/:id/:token", async (req, res) => {
//   const { id, token } = req.params;
//   console.log(req.params);
//   const oldUser = await User.findOne({ _id: id });
//   if (!oldUser) {
//     return res.json({ status: "User Not Exists!!" });
//   }
//   const secret = JWT_SECRET + oldUser.password;
//   try {
//     const verify = jwt.verify(token, secret);
//     res.render("index", { email: verify.email, status: "Not Verified" });
//   } catch (error) {
//     console.log(error);
//     res.send("Not Verified");
//   }
// });

// app.post("/reset-password/:id/:token", async (req, res) => {
//   const { id, token } = req.params;
//   const { password } = req.body;

//   const oldUser = await User.findOne({ _id: id });
//   if (!oldUser) {
//     return res.json({ status: "User Not Exists!!" });
//   }
//   const secret = JWT_SECRET + oldUser.password;
//   try {
//     const verify = jwt.verify(token, secret);
//     const encryptedPassword = await bcrypt.hash(password, 10);
//     await User.updateOne(
//       {
//         _id: id,
//       },
//       {
//         $set: {
//           password: encryptedPassword,
//         },
//       }
//     );

//     res.render("index", { email: verify.email, status: "verified" });
//   } catch (error) {
//     console.log(error);
//     res.json({ status: "Something Went Wrong" });
//   }
// });

// app.get("/getAllUser", async (req, res) => {
//   try {
//     const allUser = await User.find({});
//     res.send({ status: "ok", data: allUser });
//   } catch (error) {
//     console.log(error);
//   }
// });

// app.post("/deleteUser", async (req, res) => {
//   const { userid } = req.body;
//   try {
//     User.deleteOne({ _id: userid }, function (err, res) {
//       console.log(err);
//     });
//     res.send({ status: "Ok", data: "Deleted" });
//   } catch (error) {
//     console.log(error);
//   }
// });



// app.get("/get-image", async (req, res) => {
//   try {
//     await Images.find({}).then(data => {
//       res.send({ status: "ok", data: data })
//     })

//   } catch (error) {

//   }
// })

// app.get("/paginatedUsers", async (req, res) => {
//   const allUser = await User.find({});
//   const page = parseInt(req.query.page)
//   const limit = parseInt(req.query.limit)

//   const startIndex = (page - 1) * limit
//   const lastIndex = (page) * limit

//   const results = {}
//   results.totalUser=allUser.length;
//   results.pageCount=Math.ceil(allUser.length/limit);

//   if (lastIndex < allUser.length) {
//     results.next = {
//       page: page + 1,
//     }
//   }
//   if (startIndex > 0) {
//     results.prev = {
//       page: page - 1,
//     }
//   }
//   results.result = allUser.slice(startIndex, lastIndex);
//   res.json(results)
// })
