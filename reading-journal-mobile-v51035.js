(()=>{
  'use strict';
  if(window.__v51035ReadableJournalMobile)return;
  window.__v51035ReadableJournalMobile=true;

  const style=document.createElement('style');
  style.id='v51035-readable-journal-mobile';
  style.textContent=`
    /* v5.10.35 — Reading Journal phone readability pass.
       Keep the parchment ledger art direction, but stop shrinking desktop-density
       typography into a mobile viewport. */
    @media (max-width: 700px){
      .v51034-backdrop{
        padding:6px 4px 84px;
      }
      .v51034-shell{
        width:100%;
        min-height:100%;
        padding:20px 14px 32px;
      }
      .v51034-shell:before,.v51034-shell:after{
        top:17px;
        font-size:19px;
      }
      .v51034-close{
        right:13px;
        top:12px;
        width:44px!important;
        min-width:44px!important;
        height:44px!important;
        min-height:44px!important;
        font-size:21px!important;
      }
      .v51034-head{
        padding:5px 46px 16px;
      }
      .v51034-kicker{
        font-size:8.5px;
        line-height:1.15;
        letter-spacing:1.25px;
      }
      .v51034-title{
        margin-top:7px;
        font-size:29px;
        line-height:1.02;
      }
      .v51034-sub{
        margin-top:8px;
        font-size:10.5px;
        line-height:1.45;
      }
      .v51034-rule{
        height:13px;
        margin:3px 0 12px;
      }
      .v51034-rule:before{top:6px}
      .v51034-rule:after{
        top:0;
        font-size:12px;
        padding:0 10px;
      }

      .v51034-toolbar{
        display:grid;
        grid-template-columns:1fr;
        gap:7px;
        margin-bottom:13px;
        padding:10px;
      }
      .v51034-toolbar-label{
        font-size:8px;
        line-height:1;
        letter-spacing:.7px;
      }
      .v51034-book-select{
        width:100%!important;
        max-width:none!important;
        height:44px!important;
        padding:7px 34px 7px 12px!important;
        font:900 12px/1.15 ui-monospace,monospace!important;
      }

      .v51034-book-hero{
        grid-template-columns:78px 1fr;
        gap:13px;
        margin:9px 0 13px;
        padding:12px;
      }
      .v51034-cover{width:78px}
      .v51034-cover span{font-size:29px}
      .v51034-book-status{gap:5px;margin-bottom:7px}
      .v51034-chip{
        padding:4px 7px;
        font-size:7.5px;
        line-height:1.05;
        letter-spacing:.25px;
      }
      .v51034-book-title{
        font-size:19px;
        line-height:1.08;
      }
      .v51034-book-author{
        margin-top:6px;
        font-size:9.5px;
        line-height:1.3;
      }
      .v51034-book-meta{
        margin-top:7px;
        font-size:8.5px;
        line-height:1.45;
      }

      .v51034-overall-hero{
        margin:7px 0 12px;
        padding:14px 13px 13px;
      }
      .v51034-overall-kicker{
        font-size:8px;
        line-height:1.1;
        letter-spacing:.8px;
      }
      .v51034-overall-title{
        margin-top:7px;
        font-size:21px;
        line-height:1.12;
      }
      .v51034-overall-sub{
        margin-top:7px;
        font-size:9.5px;
        line-height:1.5;
      }

      .v51034-ribbon{
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:8px;
        overflow:visible;
        padding:0 0 10px;
      }
      .v51034-stat-pill{
        min-width:0;
        padding:11px 10px 10px;
      }
      .v51034-stat-pill span{
        font-size:7.5px;
        line-height:1.05;
        letter-spacing:.45px;
      }
      .v51034-stat-pill b{
        margin-top:6px;
        font-size:17px;
        line-height:1.05;
        white-space:normal;
      }
      .v51034-stat-pill i{
        margin-top:5px;
        font-size:8px;
        line-height:1.25;
      }

      .v51034-ledger-note{
        gap:8px;
        margin-bottom:13px;
      }
      .v51034-ledger-note>div{
        padding:10px;
      }
      .v51034-ledger-note span{
        font-size:7.5px;
        line-height:1.05;
      }
      .v51034-ledger-note b{
        margin-top:6px;
        font-size:13px;
        line-height:1.2;
      }

      .v51034-feature-row{
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:8px;
        margin-bottom:15px;
      }
      .v51034-feature{
        padding:11px 10px;
      }
      .v51034-feature span{
        font-size:7px;
        line-height:1.05;
        letter-spacing:.4px;
      }
      .v51034-feature b{
        margin-top:6px;
        font-size:13.5px;
        line-height:1.16;
      }
      .v51034-feature i{
        margin-top:5px;
        font-size:7.5px;
        line-height:1.35;
      }

      .v51034-section-head{
        gap:9px;
        margin:14px 0 8px;
      }
      .v51034-section-head b{
        font-size:13px;
        line-height:1;
      }
      .v51034-section-head small{
        font-size:7.5px;
        line-height:1;
      }
      .v51034-day{
        margin-top:12px;
      }
      .v51034-day-head{
        gap:8px;
        margin:0 2px 7px;
      }
      .v51034-day-head b{
        font-size:8px;
        line-height:1;
        letter-spacing:.75px;
      }

      .v51034-entry{
        grid-template-columns:58px minmax(0,1fr);
        gap:8px;
        padding:9px 2px 11px 14px;
        margin-left:9px;
      }
      .v51034-entry:before{
        top:17px;
        left:-6px;
        width:12px;
        height:12px;
        font-size:9px;
      }
      .v51034-time{
        padding-top:5px;
        font-size:8px;
        line-height:1.25;
      }
      .v51034-entry-main{
        padding:12px 11px;
      }
      .v51034-entry-top{
        gap:8px;
      }
      .v51034-entry-book{
        font-size:15.5px;
        line-height:1.14;
      }
      .v51034-source{
        padding:4px 6px;
        font-size:6.8px;
        line-height:1.05;
      }
      .v51034-entry-numbers{
        gap:8px;
        margin-top:9px;
      }
      .v51034-range{
        font-size:14px;
        line-height:1.05;
      }
      .v51034-gain,.v51034-duration{
        font-size:8px;
        line-height:1.15;
      }
      .v51034-book-link{
        margin-top:10px!important;
        font:900 8px/1.1 ui-monospace,monospace!important;
        text-underline-offset:3px;
      }

      .v51034-empty{
        padding:34px 18px;
      }
      .v51034-empty b{
        font-size:17px;
        line-height:1.1;
      }
      .v51034-empty span{
        margin-top:10px;
        font-size:10px;
        line-height:1.5;
      }

      .v51034-journal-launch{
        min-height:46px!important;
        font:900 10px/1.15 ui-monospace,monospace!important;
      }
      #library .v51034-library-journal{
        min-height:46px!important;
        font:900 10px/1.15 ui-monospace,monospace!important;
      }
    }

    @media (max-width: 370px){
      .v51034-shell{padding-left:11px;padding-right:11px}
      .v51034-title{font-size:26px}
      .v51034-sub{font-size:9.5px}
      .v51034-feature-row{grid-template-columns:1fr}
      .v51034-entry{grid-template-columns:51px minmax(0,1fr);gap:7px}
      .v51034-entry-book{font-size:14px}
      .v51034-source{font-size:6.2px}
    }
  `;
  document.head.appendChild(style);
})();
