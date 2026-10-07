import http from 'node:http';
import {existsSync} from 'node:fs';
import {openDatabase} from './database.mjs';
import {createApp} from './app.mjs';
if(existsSync('.env'))process.loadEnvFile('.env');
const env=process.env;
if(env.NODE_ENV==='production'&&!env.APP_ORIGIN){console.error('Set APP_ORIGIN to the public HTTPS URL.');process.exit(1);}
let connection;
if(env.MONGODB_URI){try{connection=await openDatabase(env.MONGODB_URI,env.MONGODB_DB||'grassquest');console.log('MongoDB connected.');}catch{console.error('MongoDB connection failed. Check MONGODB_URI, database permissions, and the Atlas IP access list.');process.exit(1);}}
else console.log('MongoDB not configured; using browser journal mode.');
const handle=createApp({db:connection?.db,env});
const port=Number(env.PORT||3000);
const origin=env.APP_ORIGIN||`http://localhost:${port}`;
const server=http.createServer(async(req,res)=>{
 try{const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>1700000){res.writeHead(413,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Request is too large. Choose a smaller photo.'}));return;}chunks.push(chunk);}
 const request=new Request(origin+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
 const response=await handle(request,{ip:req.socket.remoteAddress||'unknown'});
 res.writeHead(response.status,{...Object.fromEntries(response.headers),'X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'DENY'});res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Request failed.'}));}
});
server.requestTimeout=60000;
server.listen(port,()=>console.log(`GrassQuest: ${origin}`));
async function shutdown(){server.close();await connection?.close();process.exit(0);}process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
