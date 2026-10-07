import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {Script} from 'node:vm';
import worker from '../worker/index.js';
const response=await worker.fetch(new Request('http://localhost/'),{});
const html=await response.text();new Script(html.match(/<script>([\s\S]*)<\/script>/)[1]);
await mkdir('dist',{recursive:true});await writeFile('dist/index.html',html);
JSON.parse(await readFile('package.json','utf8'));
console.log('Client JavaScript validated; preview HTML built. Production runs with npm start.');
