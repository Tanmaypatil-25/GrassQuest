import {existsSync} from 'node:fs';
if(existsSync('.env')){process.loadEnvFile('.env');}
import http from 'node:http';
import worker from '../worker/index.js';
http.createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req){chunks.push(chunk);if(chunks.reduce((n,c)=>n+c.length,0)>16384){res.writeHead(413);res.end();return;}}const method=req.method;const request=new Request('http://localhost:3000'+req.url,{method,headers:req.headers,...(!['GET','HEAD'].includes(method)?{body:Buffer.concat(chunks)}:{})});const response=await worker.fetch(request,process.env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch{res.writeHead(500);res.end('Request failed');}}).listen(3000,()=>console.log('GrassQuest: http://localhost:3000'));
