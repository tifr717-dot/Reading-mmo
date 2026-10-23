const TARGET='./reading-hub/?appv=51053';

self.addEventListener('install',event=>{
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('reading-mmo-')).map(k=>caches.delete(k)));
    await self.clients.claim();
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    await Promise.all(windows.map(client=>{
      try{
        const u=new URL(client.url);
        if(u.origin!==self.location.origin)return Promise.resolve();
        if(!u.pathname.includes('/reading-hub/')){
          return client.navigate(new URL(TARGET,self.registration.scope).href).catch(()=>undefined);
        }
      }catch(_){}
      return Promise.resolve();
    }));
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.mode==='navigate'){
    const u=new URL(req.url);
    if(u.origin===self.location.origin && !u.pathname.includes('/reading-hub/')){
      event.respondWith(Response.redirect(new URL(TARGET,self.registration.scope).href,302));
    }
  }
});
