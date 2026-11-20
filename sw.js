/* 영수증 하이패스 서비스 워커: 화면은 새 버전 우선, 큰 파일은 저장해 둔 것 사용 */
const V='rp-20261119160219', BIG='rp-big-1';
self.addEventListener('install',e=>{ self.skipWaiting(); });
self.addEventListener('activate',e=>{ e.waitUntil((async()=>{ for(const k of await caches.keys()) if(k!==V&&k!==BIG&&k!=='rp-share') await caches.delete(k); await self.clients.claim(); })()); });
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method==='POST'&&u.searchParams.get('share')){ e.respondWith((async()=>{ const f=await e.request.formData(); const files=f.getAll('photos'); const c=await caches.open('rp-share'); await c.put('/__shared',new Response(JSON.stringify({n:files.length}))); let i=0; for(const x of files){ await c.put('/__shared/'+(i++),new Response(x,{headers:{'content-type':x.type,'x-name':encodeURIComponent(x.name||'photo')}})); } return Response.redirect('./?shared=1',303); })()); return; }
  if(e.request.method!=='GET'||u.origin!==location.origin) return;
  const big=/\/(ort|models|fonts|icons|lib)\//.test(u.pathname);
  if(big){ e.respondWith((async()=>{ const c=await caches.open(BIG); const hit=await c.match(e.request); if(hit) return hit; const r=await fetch(e.request); if(r.ok) c.put(e.request,r.clone()); return r; })()); return; }
  e.respondWith((async()=>{ try{ const r=await fetch(e.request); if(r.ok){ const c=await caches.open(V); c.put(e.request,r.clone()); } return r; }catch(err){ const hit=await caches.match(e.request); if(hit) return hit; throw err; } })());
});
