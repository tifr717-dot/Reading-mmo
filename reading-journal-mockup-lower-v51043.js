(()=>{
  'use strict';
  if(window.__v51043JournalMockupLower)return;
  window.__v51043JournalMockupLower=true;

  const PARTS=Array.from({length:7},(_,i)=>`./journal-mockup-lower-pack-part-${String(i+1).padStart(2,'0')}.txt?v=lower-exact-1`);
  let assets=null;
  let loading=null;
  const data=k=>assets?.[k]?`data:image/webp;base64,${assets[k]}`:'';

  async function loadAssets(){
    if(assets)return assets;
    if(loading)return loading;
    loading=Promise.all(PARTS.map(p=>fetch(p,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`Journal art ${r.status}`);return r.text()})))
      .then(parts=>JSON.parse(parts.join('')))
      .then(pack=>{assets=pack; installStyle(); decorate(); return pack;})
      .catch(err=>{console.warn('[Journal mockup lower art]',err); loading=null; return null;});
    return loading;
  }

  function installStyle(){
    if(!assets)return;
    const id='v51043-journal-mockup-lower';
    const old=document.getElementById(id); if(old)old.remove();
    const s=document.createElement('style'); s.id=id;
    s.textContent=`
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-ledger-note{
        position:relative!important;display:grid!important;grid-template-columns:1fr 1fr!important;grid-template-rows:1fr 1fr!important;
        gap:0!important;width:100%!important;aspect-ratio:805/250!important;min-height:0!important;margin:1px 0 3px!important;padding:0!important;
        border:0!important;outline:0!important;border-radius:0!important;background:url('${data('ledger')}') center/100% 100% no-repeat!important;box-shadow:none!important;overflow:hidden!important;
      }
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-ledger-note:after{content:none!important;display:none!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-ledger-note>div{
        position:relative!important;display:flex!important;align-items:flex-start!important;justify-content:flex-start!important;min-height:0!important;margin:0!important;
        border:0!important;background:transparent!important;box-shadow:none!important;
      }
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-ledger-note>div:nth-child(1){padding:31% 4% 4% 20%!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-ledger-note>div:nth-child(2){padding:31% 11% 4% 11%!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-ledger-note>div:nth-child(3){padding:25% 4% 4% 20%!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-ledger-note>div:nth-child(4){padding:25% 11% 4% 11%!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-ledger-note span{
        position:absolute!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important;white-space:nowrap!important;
      }
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-ledger-note b{
        display:block!important;margin:0!important;color:#352317!important;background:transparent!important;font:500 clamp(12.5px,3.65vw,21px)/1.05 Georgia,'Times New Roman',serif!important;
        letter-spacing:-.25px!important;white-space:nowrap!important;text-shadow:0 1px rgba(255,245,217,.45)!important;
      }
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-section-head{
        position:relative!important;display:block!important;width:min(84%,465px)!important;aspect-ratio:465/87!important;min-height:0!important;height:auto!important;
        margin:2px auto 2px!important;padding:0!important;border:0!important;background:url('${data('ribbon')}') center/100% 100% no-repeat!important;box-shadow:none!important;text-align:center!important;
      }
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-section-head:before,
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-section-head:after{content:none!important;display:none!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-section-head b{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-section-head small{position:absolute!important;left:50%!important;bottom:4%!important;transform:translateX(-50%)!important;margin:0!important;color:#392717!important;background:rgba(239,216,169,.63)!important;padding:1px 6px!important;border-radius:999px!important;font:700 clamp(6px,1.6vw,8px)/1 Georgia,'Times New Roman',serif!important;letter-spacing:.5px!important;text-transform:uppercase!important;white-space:nowrap!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-day{position:relative!important;margin:0 0 4px!important;padding:0!important;border:0!important;background:transparent!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-day:before{content:'';position:absolute;left:37px;top:17px;bottom:5px;width:1px;background:linear-gradient(#8f6a31,#c3a36d 76%,transparent);opacity:.9;z-index:0}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-day-head{position:relative!important;height:26px!important;margin:0!important;padding:4px 0 0 54px!important;border:0!important;background:transparent!important;z-index:2}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-day-head:before{content:'✦';position:absolute;left:29px;top:2px;width:17px;height:17px;border:2px solid #8b642c;border-radius:50%;display:grid;place-items:center;background:#ead09c;color:#765320;font:700 7px/1 Georgia;box-shadow:0 0 0 2px rgba(89,58,27,.2)}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-day-head b{color:#4b301f!important;font:700 clamp(7px,1.85vw,9px)/1 Georgia,'Times New Roman',serif!important;letter-spacing:.2px!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-entry{position:relative!important;display:grid!important;grid-template-columns:58px minmax(0,1fr)!important;gap:0!important;align-items:center!important;margin:0 0 5px!important;padding:0!important;border:0!important;background:transparent!important;overflow:visible!important;z-index:1}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-time{align-self:start!important;padding:15px 5px 0 0!important;color:#432b1b!important;font:700 clamp(7.5px,2vw,10px)/1 Georgia,'Times New Roman',serif!important;text-align:center!important;white-space:nowrap!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-entry-main{position:relative!important;width:100%!important;aspect-ratio:520/104!important;min-height:0!important;margin:0!important;padding:17% 21% 7% 12%!important;border:0!important;border-radius:0!important;background:url('${data('lav')}') center/100% 100% no-repeat!important;box-shadow:none!important;overflow:hidden!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-entry:nth-of-type(even) .v51034-entry-main{aspect-ratio:520/114!important;background-image:url('${data('blue')}')!important;padding-top:18%!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-entry-top{display:block!important;margin:0!important;padding:0!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-entry-book{margin:0!important;color:#352317!important;font:500 clamp(12px,3.2vw,19px)/1.02 Georgia,'Times New Roman',serif!important;letter-spacing:-.3px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-entry-numbers{display:flex!important;align-items:baseline!important;justify-content:flex-start!important;gap:8px!important;margin:7px 0 0!important;padding:0!important;white-space:nowrap!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-range{color:#352317!important;font:500 clamp(10.5px,2.8vw,16px)/1 Georgia,'Times New Roman',serif!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-gain,.v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-duration{color:#493323!important;font:500 clamp(6.2px,1.7vw,8.5px)/1 Georgia,'Times New Roman',serif!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-source{position:absolute!important;right:3.7%!important;top:24%!important;width:58px!important;height:58px!important;display:flex!important;align-items:center!important;justify-content:center!important;margin:0!important;padding:5px!important;border:0!important;border-radius:50%!important;background:radial-gradient(circle,rgba(74,27,25,.84) 0 57%,rgba(74,27,25,.28) 64%,transparent 70%)!important;color:#f7e6c7!important;font:500 7px/1.08 Georgia,'Times New Roman',serif!important;text-align:center!important;white-space:normal!important;box-shadow:none!important;z-index:4!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-entry:nth-of-type(even) .v51034-source{background:radial-gradient(circle,rgba(29,45,63,.88) 0 57%,rgba(29,45,63,.28) 64%,transparent 70%)!important}
      .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-footer-art{width:100%;aspect-ratio:590/104;margin:2px 0 0;background:url('${data('footer')}') center/100% 100% no-repeat;pointer-events:none;user-select:none}
      @media(max-width:360px){.v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-entry{grid-template-columns:52px minmax(0,1fr)!important}.v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-day:before{left:33px}.v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-day-head{padding-left:49px!important}.v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-day-head:before{left:25px}.v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-source{width:51px!important;height:51px!important;font-size:6.4px!important}.v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-entry-numbers{gap:5px!important}}
    `;
    document.head.appendChild(s);
    document.documentElement.dataset.readingJournalMockupLower='51043-exact-v1';
  }

  function decorate(){
    const shell=document.querySelector('.v51034-shell.v51043-mockup');
    const body=document.getElementById('v51034JournalBody');
    if(!shell||!body)return;
    if(shell.dataset.journalMode==='book'){
      if(!body.querySelector('.v51034-footer-art')){const f=document.createElement('div');f.className='v51034-footer-art';f.setAttribute('aria-hidden','true');body.appendChild(f);}
    }else body.querySelector('.v51034-footer-art')?.remove();
  }
  function observe(){const body=document.getElementById('v51034JournalBody');if(!body||body.__v51043LowerObserved)return;body.__v51043LowerObserved=true;new MutationObserver(()=>{if(assets)decorate();}).observe(body,{childList:true});}
  function queue(){[0,50,120,260].forEach(ms=>setTimeout(()=>{loadAssets();observe();decorate();},ms));}
  document.addEventListener('change',e=>{if(e.target?.id==='v51034BookFilter')queue();},false);
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-journal-book],#v51034JournalLaunch,#v51034LibraryJournalLaunch'))queue();},false);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});else queue();
  window.addEventListener('pageshow',queue);
})();