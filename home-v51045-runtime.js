(()=>{'use strict';
if(window.__v51045HomeLevelOnly)return;window.__v51045HomeLevelOnly=1;
const BUILD='v5.10.45-home-reader-xp-bar-editor2';
const MASTER='./home-v51045-master-clean-level.webp?v=51045bareditor2';
const $=id=>document.getElementById(id);

function style(){
  if($('v51045LevelOnlyStyle'))return;
  const s=document.createElement('style');
  s.id='v51045LevelOnlyStyle';
  s.textContent=
    "html,body{overscroll-behavior:none;background:#160907!important}"+
    "body.v51045-home-active header,body.v51045-home-active .bottomnav{display:none!important}"+
    "#home.v51045-level-only-home{display:block!important;padding:0!important;margin:0!important;background:#160907!important;overflow:hidden!important;min-height:0!important}"+
    "#home.v51045-level-only-home>*:not(#v51045LevelOnlyHome){display:none!important}"+
    "#v51045LevelOnlyHome{position:relative;width:100%;height:100dvh;margin:0 auto;background:#160907;overflow:hidden;opacity:0}"+
    "#v51045LevelOnlyHome.v51045-ready{opacity:1}"+
    ".v51045-stage{position:relative;width:100%;height:100%;overflow:hidden;background:#160907}"+
    ".v51045-canvas{position:absolute;top:0;left:50%;width:max(100%,calc(100dvh * 2 / 3));aspect-ratio:2/3;transform:translateX(-50%);transform-origin:top center}"+
    ".v51045-master{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:fill;z-index:1;pointer-events:none}"+
    ".v51045-level-number{position:absolute;z-index:4;left:34.25%;top:32.15%;width:9.5%;transform:translate(-50%,-50%);text-align:center;color:#3b2117;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:clamp(20px,5vw,34px);line-height:1;text-shadow:0 1px rgba(255,244,216,.55);pointer-events:none}"+
    ".v51045-rank-text{position:absolute;z-index:4;left:51.80%;top:27.95%;width:23%;transform:translate(-50%,-50%);text-align:center;color:#3b2117;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:clamp(15px,3.15vw,22px);line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px rgba(255,244,216,.55);pointer-events:none}"+
    ".v51045-rank-flourish{position:absolute;z-index:3;left:51.80%;top:28.95%;width:23.5%;height:12px;transform:translateX(-50%);pointer-events:none}"+
    ".v51045-rank-flourish::before,.v51045-rank-flourish::after{content:'';position:absolute;top:50%;width:40%;height:1px;background:linear-gradient(90deg,rgba(116,78,49,0),rgba(116,78,49,.92),rgba(116,78,49,0));transform:translateY(-50%)}"+
    ".v51045-rank-flourish::before{left:0}.v51045-rank-flourish::after{right:0}"+
    ".v51045-rank-flourish i,.v51045-rank-flourish b{position:absolute;top:50%;width:7px;height:7px;background:linear-gradient(180deg,rgba(240,220,182,.96) 0%,rgba(185,146,94,.94) 100%);border:1px solid rgba(108,73,39,.84);transform:translateY(-50%) rotate(45deg);box-shadow:0 0 0 1px rgba(255,240,211,.22);display:block}"+
    ".v51045-rank-flourish i{left:43.5%}.v51045-rank-flourish b{right:43.5%}"+
    ".v51045-exp-art{position:absolute;z-index:3;left:53.70%;top:31.50%;width:27.90%;height:3.30%;transform:translate(-50%,-50%);pointer-events:none}"+
    ".v51045-exp-art img{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:fill;z-index:1}"+
    ".v51045-exp-fill-clip{position:absolute;z-index:2;left:11.8%;right:11.8%;top:38%;height:22%;overflow:hidden;border-radius:999px}"+
    ".v51045-exp-fill{display:block;height:100%;width:0%;border-radius:999px;background:linear-gradient(180deg,#d7a0df 0%,#c17fce 48%,#9f5db3 100%);box-shadow:inset 0 1px rgba(255,255,255,.36),0 0 3px rgba(177,106,192,.18);transition:width .18s ease}"+
    ".v51045-xp-line{position:absolute;z-index:4;left:53.70%;top:36.15%;width:34%;transform:translate(-50%,-50%);text-align:center;color:#3b2117;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:clamp(9px,2.0vw,14px);line-height:1;white-space:nowrap;text-shadow:0 1px rgba(255,244,216,.55);pointer-events:none}"+
    ".v51045-bar-editor{position:fixed;z-index:9999;left:10px;top:92px;width:min(310px,calc(100vw - 20px));background:rgba(37,20,29,.96);border:1px solid #b88a53;border-radius:12px;color:#f4e5c8;font:600 12px/1.25 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.35);touch-action:none}"+
    ".v51045-bar-editor[hidden]{display:none!important}"+
    ".v51045-editor-head{display:flex;align-items:center;justify-content:space-between;padding:9px 10px;background:#4b293d;border-bottom:1px solid #b88a53;border-radius:11px 11px 0 0;cursor:move;user-select:none}"+
    ".v51045-editor-head strong{font-size:13px;letter-spacing:.04em}"+
    ".v51045-editor-close{border:0;background:transparent;color:#f4e5c8;font-size:18px;line-height:1;padding:0 4px}"+
    ".v51045-editor-body{padding:9px}"+
    ".v51045-editor-tabs{display:grid;grid-template-columns:1fr 1.2fr 1.2fr;gap:5px;margin-bottom:8px}"+
    ".v51045-editor-tabs button{min-height:34px;border:1px solid #a77d4a;border-radius:7px;background:#34202d;color:#dbc7a3;font-weight:800;font-size:10px}"+
    ".v51045-editor-tabs button.active{background:#6a3d56;color:#fff;box-shadow:inset 0 0 0 1px #d0a566}"+
    ".v51045-editor-group[hidden]{display:none!important}"+
    ".v51045-editor-row{display:grid;grid-template-columns:52px 36px minmax(0,1fr) 36px 58px;gap:5px;align-items:center;margin:6px 0}"+
    ".v51045-editor-row button{height:32px;border:1px solid #a77d4a;border-radius:7px;background:#5a3449;color:#fff;font-weight:800}"+
    ".v51045-editor-row input[type=range]{width:100%;min-width:0}"+
    ".v51045-editor-value{text-align:right;font-variant-numeric:tabular-nums;color:#f7e8ca}"+
    ".v51045-editor-actions{display:flex;gap:6px;margin-top:9px}"+
    ".v51045-editor-actions button{flex:1;min-height:36px;border:1px solid #a77d4a;border-radius:8px;background:#5a3449;color:#fff;font-weight:800}"+
    ".v51045-editor-output{margin-top:7px;padding:7px;border:1px solid rgba(184,138,83,.55);border-radius:7px;background:#24131d;color:#f4e5c8;font:600 11px/1.3 ui-monospace,monospace;word-break:break-word}"+
    ".v51045-editor-open{position:fixed;z-index:9998;left:10px;top:92px;min-height:40px;padding:0 12px;border:1px solid #b88a53;border-radius:9px;background:#4b293d;color:#fff;font:800 12px system-ui,sans-serif}"+
    ".v51045-error{position:absolute;z-index:12;left:8%;right:8%;top:12%;padding:10px;background:#3c2118;color:#f2d7a0;border:1px solid #b7863d;border-radius:8px;text-align:center;font:700 10px/1.4 ui-monospace,monospace}";
  document.head.appendChild(s);
}

function readerState(){
  try{
    if(
      typeof window.totalXp==='function' &&
      typeof window.levelFor==='function' &&
      typeof window.lvlXp==='function' &&
      typeof window.lvlNeed==='function'
    ){
      const total=Math.max(0,Number(window.totalXp())||0);
      const level=Math.max(1,Number(window.levelFor(total))||1);
      const curXp=Math.max(0,Number(window.lvlXp(total,level))||0);
      const needXp=Math.max(1,Number(window.lvlNeed(level))||1);
      let rank='';
      try{
        if(typeof window.rankFor==='function')rank=String(window.rankFor(level)||'');
      }catch(e){}
      return{
        level,
        rank,
        curXp,
        needXp,
        pct:Math.max(0,Math.min(100,(curXp/needXp)*100))
      };
    }
  }catch(e){}
  return null;
}

function renderReaderLevel(){
  const levelEl=$('v51045Level');
  const rankEl=$('v51045Rank');
  const fillEl=$('v51045ExpFill');
  const xpEl=$('v51045XpLine');
  const st=readerState();

  if(!st){
    if(levelEl)levelEl.textContent='';
    if(rankEl)rankEl.textContent='';
    if(fillEl)fillEl.style.width='0%';
    if(xpEl)xpEl.textContent='';
    return;
  }

  if(levelEl)levelEl.textContent=String(st.level);
  if(rankEl)rankEl.textContent=st.rank;
  if(fillEl)fillEl.style.width=st.pct+'%';
  if(xpEl)xpEl.textContent=
    st.curXp.toLocaleString()+' / '+st.needXp.toLocaleString()+' EXP';
}



function barEditorEnabled(){
  try{return new URLSearchParams(location.search).get('barEditor')==='1'}catch(e){return false}
}

function mountBarEditor(){
  if(!barEditorEnabled()||$('v51045BarEditor'))return;

  const bar=document.querySelector('.v51045-exp-art');
  const clip=document.querySelector('.v51045-exp-fill-clip');
  const title=$('v51045Rank');
  const flourish=document.querySelector('.v51045-rank-flourish');
  const xp=$('v51045XpLine');
  if(!bar||!clip||!title||!xp)return;

  const state={
    barX:53.70,barY:31.50,barW:27.90,barH:3.30,
    fillL:11.8,fillR:11.8,fillY:38.0,fillH:22.0,
    titleX:51.80,titleY:27.95,
    xpX:53.70,xpY:36.15
  };

  const groups=[
    {
      label:'BAR',
      rows:[
        ['barX','X / Left',40,68,.1],
        ['barY','Y / Top',25,40,.1],
        ['barW','Width',15,42,.1],
        ['barH','Height',1,6,.1]
      ]
    },
    {
      label:'PURPLE FILL',
      rows:[
        ['fillL','Left inset',0,30,.1],
        ['fillR','Right inset',0,30,.1],
        ['fillY','Y inside',0,80,.5],
        ['fillH','Height',5,80,.5]
      ]
    },
    {
      label:'TITLE + EXP',
      rows:[
        ['titleX','Title X',40,65,.1],
        ['titleY','Title Y',23,34,.1],
        ['xpX','EXP X',40,65,.1],
        ['xpY','EXP Y',30,42,.1]
      ]
    }
  ];

  const open=document.createElement('button');
  open.id='v51045EditorOpen';
  open.className='v51045-editor-open';
  open.type='button';
  open.textContent='READER EDITOR';
  document.body.appendChild(open);

  const panel=document.createElement('div');
  panel.id='v51045BarEditor';
  panel.className='v51045-bar-editor';
  panel.hidden=true;

  const groupHtml=groups.map((g,gi)=>
    '<div class="v51045-editor-group" data-group="'+gi+'"'+(gi?' hidden':'')+'>'+
      g.rows.map(row=>{
        const [k,label,min,max,step]=row;
        return '<div class="v51045-editor-row" data-key="'+k+'" data-min="'+min+'" data-max="'+max+'" data-step="'+step+'">'+
          '<span>'+label+'</span>'+
          '<button type="button" data-delta="-1">−</button>'+
          '<input type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+state[k]+'">'+
          '<button type="button" data-delta="1">+</button>'+
          '<span class="v51045-editor-value">'+state[k].toFixed(2)+'%</span>'+
        '</div>';
      }).join('')+
    '</div>'
  ).join('');

  panel.innerHTML=
    '<div class="v51045-editor-head"><strong>READER LEVEL EDITOR</strong><button type="button" class="v51045-editor-close" aria-label="Hide editor">×</button></div>'+
    '<div class="v51045-editor-body">'+
      '<div class="v51045-editor-tabs">'+
        '<button type="button" class="active" data-tab="0">BAR</button>'+
        '<button type="button" data-tab="1">PURPLE FILL</button>'+
        '<button type="button" data-tab="2">TITLE + EXP</button>'+
      '</div>'+
      groupHtml+
      '<div class="v51045-editor-actions"><button type="button" data-action="reset">RESET</button><button type="button" data-action="copy">COPY VALUES</button></div>'+
      '<div id="v51045EditorOutput" class="v51045-editor-output"></div>'+
    '</div>';
  document.body.appendChild(panel);

  const defaults={...state};

  const apply=()=>{
    bar.style.left=state.barX+'%';
    bar.style.top=state.barY+'%';
    bar.style.width=state.barW+'%';
    bar.style.height=state.barH+'%';

    clip.style.left=state.fillL+'%';
    clip.style.right=state.fillR+'%';
    clip.style.top=state.fillY+'%';
    clip.style.height=state.fillH+'%';

    title.style.left=state.titleX+'%';
    title.style.top=state.titleY+'%';
    if(flourish){
      flourish.style.left=state.titleX+'%';
      flourish.style.top=(state.titleY+1.0)+'%';
    }

    xp.style.left=state.xpX+'%';
    xp.style.top=state.xpY+'%';

    panel.querySelectorAll('.v51045-editor-row').forEach(row=>{
      const k=row.dataset.key;
      row.querySelector('input').value=state[k];
      row.querySelector('.v51045-editor-value').textContent=state[k].toFixed(2)+'%';
    });

    const out=$('v51045EditorOutput');
    if(out)out.textContent=
      'BAR left:'+state.barX.toFixed(2)+'%; top:'+state.barY.toFixed(2)+'%; width:'+state.barW.toFixed(2)+'%; height:'+state.barH.toFixed(2)+'%;\n'+
      'FILL left:'+state.fillL.toFixed(2)+'%; right:'+state.fillR.toFixed(2)+'%; top:'+state.fillY.toFixed(2)+'%; height:'+state.fillH.toFixed(2)+'%;\n'+
      'TITLE left:'+state.titleX.toFixed(2)+'%; top:'+state.titleY.toFixed(2)+'%;\n'+
      'EXP left:'+state.xpX.toFixed(2)+'%; top:'+state.xpY.toFixed(2)+'%;';
  };

  panel.querySelectorAll('.v51045-editor-row').forEach(row=>{
    const k=row.dataset.key;
    const input=row.querySelector('input');
    const min=Number(row.dataset.min),max=Number(row.dataset.max),step=Number(row.dataset.step);

    input.addEventListener('input',()=>{state[k]=Number(input.value);apply()});

    row.querySelectorAll('button[data-delta]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const dir=Number(btn.dataset.delta);
        const next=Math.max(min,Math.min(max,state[k]+dir*step));
        const precision=step<1?2:1;
        state[k]=Number(next.toFixed(precision));
        apply();
      });
    });
  });

  panel.querySelectorAll('[data-tab]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const n=btn.dataset.tab;
      panel.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===btn));
      panel.querySelectorAll('.v51045-editor-group').forEach(g=>g.hidden=g.dataset.group!==n);
    });
  });

  panel.querySelector('[data-action="reset"]').addEventListener('click',()=>{
    Object.assign(state,defaults);
    apply();
  });

  panel.querySelector('[data-action="copy"]').addEventListener('click',async()=>{
    const txt=$('v51045EditorOutput').textContent;
    try{
      await navigator.clipboard.writeText(txt);
      const b=panel.querySelector('[data-action="copy"]');
      b.textContent='COPIED!';
      setTimeout(()=>b.textContent='COPY VALUES',900);
    }catch(e){
      $('v51045EditorOutput').textContent=txt+'\n(long-press to copy)';
    }
  });

  open.addEventListener('click',()=>{panel.hidden=false;open.hidden=true});
  panel.querySelector('.v51045-editor-close').addEventListener('click',()=>{panel.hidden=true;open.hidden=false});

  const head=panel.querySelector('.v51045-editor-head');
  let drag=null;
  head.addEventListener('pointerdown',e=>{
    if(e.target.closest('button'))return;
    drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,left:panel.offsetLeft,top:panel.offsetTop};
    head.setPointerCapture(e.pointerId);
  });
  head.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    const maxX=Math.max(0,innerWidth-panel.offsetWidth);
    const maxY=Math.max(0,innerHeight-panel.offsetHeight);
    panel.style.left=Math.max(0,Math.min(maxX,drag.left+e.clientX-drag.sx))+'px';
    panel.style.top=Math.max(0,Math.min(maxY,drag.top+e.clientY-drag.sy))+'px';
  });
  head.addEventListener('pointerup',e=>{if(drag&&e.pointerId===drag.id)drag=null});
  head.addEventListener('pointercancel',()=>{drag=null});

  apply();
}

function chrome(){
  const h=$('home');
  if(!h)return;
  document.body.classList.toggle('v51045-home-active',h.classList.contains('active')&&!h.hidden);
}

function reveal(root){
  root.classList.add('v51045-ready');
  renderReaderLevel();
  document.body.classList.remove('v51045-booting-home');
  document.body.classList.add('v51045-home-active','v51045-home-ready');
  const shell=$('v51045AppShell')||document.querySelector('.app');
  if(shell)shell.style.visibility='visible';
}

async function waitForArt(art){
  if(art.complete&&art.naturalWidth){
    if(art.decode){try{await art.decode()}catch(_){}}
    return;
  }
  await new Promise((resolve,reject)=>{
    art.addEventListener('load',resolve,{once:true});
    art.addEventListener('error',()=>reject(Error('clean Home WebP failed to load')),{once:true});
  });
  if(art.decode){try{await art.decode()}catch(_){}}
}

async function mount(){
  const home=$('home');
  if(!home)return;
  style();
  home.classList.add('v51045-level-only-home');

  let root=$('v51045LevelOnlyHome');
  if(root){renderReaderLevel();chrome();mountBarEditor();return}

  root=document.createElement('div');
  root.id='v51045LevelOnlyHome';
  root.dataset.build=BUILD;
  root.innerHTML='<div class="v51045-stage">'+
    '<div class="v51045-canvas">'+
      '<img id="v51045MasterArt" class="v51045-master" alt="">'+
      '<div id="v51045Level" class="v51045-level-number" aria-label="Reader level"></div>'+
      '<div id="v51045Rank" class="v51045-rank-text" aria-label="Reader rank"></div>'+
      '<div class="v51045-rank-flourish" aria-hidden="true"><i></i><b></b></div>'+
      '<div class="v51045-exp-art" aria-label="Reader experience progress">'+
        '<img src="./home-v51045-ornate-bar-frame.png?v=51045bareditor2" alt="" aria-hidden="true">'+
        '<div class="v51045-exp-fill-clip"><i id="v51045ExpFill" class="v51045-exp-fill"></i></div>'+
      '</div>'+
      '<div id="v51045XpLine" class="v51045-xp-line" aria-label="Reader experience"></div>'+
    '</div>'+
    '<div id="v51045LevelOnlyError" class="v51045-error" hidden></div>'+
  '</div>';
  home.replaceChildren(root);

  const art=$('v51045MasterArt');
  art.src=MASTER;

  try{
    await waitForArt(art);
    reveal(root);
    mountBarEditor();
  }catch(e){
    console.error('[v51045 Home Reader XP]',e);
    const er=$('v51045LevelOnlyError');
    if(er){er.textContent='Home artwork failed to load.';er.hidden=false}
    reveal(root);
    mountBarEditor();
  }
}

mount();
document.addEventListener('DOMContentLoaded',mount,{once:true});

const bindLegacy=()=>{
  const oldGo=window.go;
  if(typeof oldGo==='function'&&!oldGo.__v51045Wrapped){
    const wrapped=function(){
      const r=oldGo.apply(this,arguments);
      setTimeout(()=>{chrome();renderReaderLevel()},0);
      return r;
    };
    wrapped.__v51045Wrapped=1;
    window.go=wrapped;
  }

  const oldRenderHome=window.renderHome;
  if(typeof oldRenderHome==='function'&&!oldRenderHome.__v51045Wrapped){
    const wrapped=function(){
      const r=oldRenderHome.apply(this,arguments);
      setTimeout(renderReaderLevel,0);
      return r;
    };
    wrapped.__v51045Wrapped=1;
    window.renderHome=wrapped;
  }
};

setInterval(()=>{try{bindLegacy();renderReaderLevel();chrome()}catch(e){}},500);
window.addEventListener('pageshow',()=>{mount();renderReaderLevel();chrome()});
})();