import {randomBytes,randomUUID} from 'node:crypto';
import worker from '../worker/index.js';
import {credentials,digest,hashPassword,verifyPassword,validateEntry} from './security.mjs';
const WEEK=7*24*60*60*1000;
const json=(value,status=200,headers={})=>Response.json(value,{status,headers:{'Cache-Control':'no-store',...headers}});
export function createApp({db=null,env={}}={}){
 const production=env.NODE_ENV==='production';
 const cookieName=production?'__Host-grassquest':'grassquest_session';
 const cookie=(token,maxAge=604800)=>`${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${production?'; Secure':''}`;
 async function session(request){const raw=request.headers.get('cookie')||'';const token=raw.split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1);if(!token||!/^[a-f0-9]{64}$/.test(token)||!db)return null;const item=await db.collection('sessions').findOne({_id:digest(token),expiresAt:{$gt:new Date()}});if(!item)return null;const user=await db.collection('users').findOne({_id:item.userId});return user?{user,id:item._id}:null;}
 async function limit(scope,max,windowMs=60000){const bucket=Math.floor(Date.now()/windowMs);const _id=digest(scope+':'+bucket);try{await db.collection('limits').updateOne({_id},{$inc:{count:1},$setOnInsert:{expiresAt:new Date((bucket+2)*windowMs)}},{upsert:true});}catch(e){if(e.code!==11000)throw e;await db.collection('limits').updateOne({_id},{$inc:{count:1}});}const item=await db.collection('limits').findOne({_id});return item.count<=max;}
 async function issueSession(user,old){if(old)await db.collection('sessions').deleteOne({_id:old.id});const token=randomBytes(32).toString('hex');await db.collection('sessions').insertOne({_id:digest(token),userId:user._id,expiresAt:new Date(Date.now()+WEEK)});return json({user:{email:user.email}},200,{'Set-Cookie':cookie(token)});}
 return async function handle(request,{ip='local'}={}){
  const url=new URL(request.url),path=url.pathname,mutating=!['GET','HEAD','OPTIONS'].includes(request.method);
  try{
   if(mutating){const origin=request.headers.get('origin');if((origin&&origin!==(env.APP_ORIGIN||url.origin))||request.headers.get('sec-fetch-site')==='cross-site')return json({error:'Request origin is not allowed.'},403);if(!(request.headers.get('content-type')||'').startsWith('application/json'))return json({error:'JSON content type required.'},415);}
   if(path==='/api/health')return json({ok:true,storage:db?'mongodb':'local'});
   if(path==='/api/status'){const response=await worker.fetch(request,env);return json({...await response.json(),cloud:!!db});}
   if(path==='/api/auth/me'){const auth=await session(request);return json({cloud:!!db,user:auth?{email:auth.user.email}:null});}
   if(path.startsWith('/api/auth/')||path.startsWith('/api/journal')){
    if(!db)return json({error:'Cloud storage is not configured.'},503);
    const auth=await session(request);
    if(['/api/auth/signup','/api/auth/login'].includes(path)&&request.method==='POST'){
     if(!await limit('auth-ip:'+ip,20,15*60000))return json({error:'Too many sign-in attempts. Try again in 15 minutes.'},429);
     let value;try{value=credentials(await request.json());}catch(e){return json({error:e.message},400);}
     if(!await limit('auth-email:'+value.email,10,15*60000))return json({error:'Too many sign-in attempts. Try again in 15 minutes.'},429);
     const users=db.collection('users');
     if(path.endsWith('signup')){const user={_id:randomUUID(),email:value.email,passwordHash:await hashPassword(value.password),createdAt:new Date()};try{await users.insertOne(user);}catch(e){if(e.code===11000)return json({error:'Could not create this account. Try signing in instead.'},409);throw e;}return issueSession(user,auth);}
     const user=await users.findOne({email:value.email});const dummy='0'.repeat(32)+':'+ '0'.repeat(128);const valid=await verifyPassword(value.password,user?.passwordHash||dummy);if(!user||!valid)return json({error:'Email or password is incorrect.'},401);return issueSession(user,auth);
    }
    if(path==='/api/auth/logout'&&request.method==='POST'){if(auth)await db.collection('sessions').deleteOne({_id:auth.id});return json({ok:true},200,{'Set-Cookie':cookie('',0)});}
    if(!auth)return json({error:'Please sign in to use your cloud journal.'},401);
    const entries=db.collection('entries'),userId=auth.user._id;
    if(path==='/api/journal'&&request.method==='GET'){const data=await entries.find({userId},{projection:{_id:0,userId:0}}).sort({completedAt:-1}).toArray();return json({entries:data});}
    if(path==='/api/journal'&&request.method==='POST'){
     if(!await limit('write:'+userId,30))return json({error:'Too many saves. Try again shortly.'},429);
     let entry;try{entry=validateEntry(await request.json());}catch(e){return json({error:e.message},400);}
     await entries.updateOne({userId,id:entry.id},{$set:{...entry,userId}},{upsert:true});return json({entry});
    }
    if(path.startsWith('/api/journal/')&&request.method==='DELETE'){const id=decodeURIComponent(path.slice('/api/journal/'.length));const result=await entries.deleteOne({userId,id});return result.deletedCount?json({ok:true}):json({error:'Entry not found.'},404);}
    return json({error:'Route not found.'},404);
   }
   if(path==='/api/quest'&&db){const auth=await session(request);if(!await limit('quest:'+(auth?.user._id||ip),6))return json({error:'Please wait a minute before generating more quests.'},429);}
   return await worker.fetch(request,env);
  }catch{return json({error:'The server could not complete your request. Please try again.'},500);}
 };
}
