import {MongoClient} from 'mongodb';
export async function openDatabase(uri,name='grassquest'){
 const client=new MongoClient(uri,{serverSelectionTimeoutMS:10000,maxPoolSize:10});
 try{await client.connect();const db=client.db(name);await Promise.all([
 db.collection('users').createIndex({email:1},{unique:true}),
 db.collection('sessions').createIndex({expiresAt:1},{expireAfterSeconds:0}),
 db.collection('entries').createIndex({userId:1,id:1},{unique:true}),
 db.collection('entries').createIndex({userId:1,completedAt:-1}),
 db.collection('limits').createIndex({expiresAt:1},{expireAfterSeconds:0})]);return {db,close:()=>client.close()};}
 catch(error){await client.close();throw error;}
}
