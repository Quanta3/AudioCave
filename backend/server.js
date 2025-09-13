import express from 'express';
import cors from 'cors';
import Api from './apiController.js';
import Auth from './authController.js';
import cookieParser from 'cookie-parser'; // Add this import
import 'dotenv/config'
// import dotenv from 'dotenv'
// import path from 'path'
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// dotenv.config({path: path.join(__dirname, '.env')});

console.log(process.env.CLIENT_ID);
const app = express();
const api = new Api(process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
    process.env.REFRESH_TOKEN
);

const auth = new Auth(process.env.CLIENT_ID, 
    process.env.CLIENT_SECRET, 
    process.env.REDIRECT_URI
);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL2
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res)=>{
    console.log("Hello World")
    res.status(200).send('<h1>Hello World</h1>')
})

app.get('/listfiles', async (req, res)=>{
    try{
        console.log(req.cookies);
        const response = await api.ListFiles(req.cookies.token);
        console.log(response);
        res.status(200).json(response);
    }
    catch(error){
        console.log("HERE");
        //console.log(error.message)
        const id = req.cookies.id;

        const token = await auth.getAccessToken(id);
        console.log("HERE I AM " + token);
        res.cookie('token', token, {httpOnly : true});
        res.status(500).json({error:'Failed to List Files'})
    }
})

app.get('/play/:filename', async (req, res)=>{
    try{
        const fileName = req.params.filename;
        console.log(`Stream Request For File ${fileName}`);

        const file = await api.getReadableStream(req.cookies.token, fileName);

        file.data.pipe(res);

    }
    catch(error){
        console.log(error.message)
        res.status(500).send('<h1>Internal Server Error</h1>')
    }
})

app.post('/logout', async ()=>{

})

app.post('/getfromyt', async (req, res)=>{

    console.log("HERE");
    const url = req.body.url;
    const name = req.body.name;
    const token = req.cookies.token;
    console.log('Uploading File To Drive...');
    try{
        await api.UploadYoutubeFile(token, name, url);
        res.status(200).send("File Uploaded Successfully");
    }
    catch(error){
        res.status(500).send('Internal Server Error');
        console.log(error.message)
    }
})



app.post('/auth', async (req, res)=>{
    try{
        console.log("HERE");
        console.log(req.body)

        const id = req.cookies.id;

        if(!!id){
            const access_token = await auth.getAccessToken(id);
            res.cookie("token", access_token, {httpOnly : true})
        }
        else{

            const authCode = req.body.code;
            
            const arr = await auth.authorize(authCode);
            console.log(`AFTER AUTHORIZING ${arr}`)
            res.cookie("id", arr[0], {httpOnly:true});
            res.cookie("token", arr[1], {httpOnly:true});
        }
        res.status(200).send("Done");
    }
    catch(error){
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
})

app.get('/auth/clientid', (req, res)=>{
    console.log("Request for ClientId");
    res.status(200).send(auth.getClientId());
})

app.get('/auth/checkLogin', async (req, res)=>{
    const id = req.cookies.id;
    const token = req.cookies.token;
    console.log("HERE");
    console.log(req.cookies);

    try{
        if(!!id && await auth.doesUserExist(id)){
            console.log("Identified User")
            res.status(200).json({flag1 : true, flag2 : !!token});
        }
        else{
            console.log("Unidentified User")
            res.status(200).json({flag1 : false, flag2: !!token});
        }
    }
    catch(error){
        console.log(error.message)
    }
})

app.post('/auth/clear', (req, res) => {
  try {
    res.clearCookie("id");
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Cookies cleared" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


app.get('/auth/refresh', async (req, res) => {
  const id = req.cookies.id;
  try {
    if (!!id) {
      const token = await auth.getAccessToken(id);
      console.log(`REFRESHING TOKEN ${token}`);
      res.cookie("token", token, { httpOnly: true });
      res.status(200).json({ success: true, message: "Token refreshed" });
    } else {
      res.status(401).json({ success: false, message: "No ID found in cookies" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3001, ()=>{
    console.log('Server Listening on Port 3001')
})