(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))t(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&t(c)}).observe(document,{childList:!0,subtree:!0});function o(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function t(r){if(r.ep)return;r.ep=!0;const i=o(r);fetch(r.href,i)}})();const J=[{id:"hyundai-ioniq-6-se-rwd",name:"Hyundai Ioniq 6 SE RWD",msrpUsd:42800,rangeMiles:361,oneStopRangeMiles:622,cargoCuFt:11.2,chargeMilesIn15Min:178,driveType:"RWD"},{id:"hyundai-kona-electric-se",name:"Hyundai Kona Electric SE",msrpUsd:34200,rangeMiles:261,oneStopRangeMiles:457,cargoCuFt:25.5,chargeMilesIn15Min:105,driveType:"FWD"},{id:"kia-ev6-light-long-range-rwd",name:"Kia EV6 Light Long Range RWD",msrpUsd:42900,rangeMiles:310,oneStopRangeMiles:575,cargoCuFt:24.4,chargeMilesIn15Min:152,driveType:"RWD"},{id:"kia-niro-ev-wind",name:"Kia Niro EV Wind",msrpUsd:39800,rangeMiles:253,oneStopRangeMiles:439,cargoCuFt:22.8,chargeMilesIn15Min:84,driveType:"FWD"},{id:"tesla-model-3-rwd",name:"Tesla Model 3 RWD",msrpUsd:38990,rangeMiles:341,oneStopRangeMiles:621,cargoCuFt:21,chargeMilesIn15Min:175,driveType:"RWD"},{id:"tesla-model-y-rwd",name:"Tesla Model Y RWD",msrpUsd:44990,rangeMiles:320,oneStopRangeMiles:592,cargoCuFt:76.2,chargeMilesIn15Min:172,driveType:"RWD"},{id:"chevrolet-equinox-ev-2lt",name:"Chevrolet Equinox EV 2LT",msrpUsd:41995,rangeMiles:319,oneStopRangeMiles:555,cargoCuFt:57.2,chargeMilesIn15Min:118,driveType:"FWD"},{id:"ford-mustang-mach-e-select-rwd",name:"Ford Mustang Mach-E Select RWD",msrpUsd:39995,rangeMiles:250,oneStopRangeMiles:465,cargoCuFt:59.7,chargeMilesIn15Min:101,driveType:"RWD"},{id:"nissan-ariya-engage-fwd",name:"Nissan Ariya Engage FWD",msrpUsd:39950,rangeMiles:216,oneStopRangeMiles:391,cargoCuFt:59.7,chargeMilesIn15Min:87,driveType:"FWD"},{id:"subaru-solterra-premium",name:"Subaru Solterra Premium",msrpUsd:44995,rangeMiles:227,oneStopRangeMiles:413,cargoCuFt:63.5,chargeMilesIn15Min:79,driveType:"AWD"},{id:"volkswagen-id4-pro",name:"Volkswagen ID.4 Pro",msrpUsd:43895,rangeMiles:291,oneStopRangeMiles:522,cargoCuFt:64.2,chargeMilesIn15Min:126,driveType:"RWD"},{id:"toyota-bz4x-xle-fwd",name:"Toyota bZ4X XLE FWD",msrpUsd:43070,rangeMiles:252,oneStopRangeMiles:447,cargoCuFt:55.3,chargeMilesIn15Min:95,driveType:"FWD"},{id:"polestar-2-long-range-single-motor",name:"Polestar 2 Long Range Single Motor",msrpUsd:51100,rangeMiles:320,oneStopRangeMiles:584,cargoCuFt:38.7,chargeMilesIn15Min:141,driveType:"RWD"},{id:"chevrolet-blazer-ev-rs-rwd",name:"Chevrolet Blazer EV RS RWD",msrpUsd:50895,rangeMiles:324,oneStopRangeMiles:580,cargoCuFt:59.1,chargeMilesIn15Min:121,driveType:"RWD"},{id:"honda-prologue-ex-fwd",name:"Honda Prologue EX FWD",msrpUsd:48450,rangeMiles:296,oneStopRangeMiles:540,cargoCuFt:57.7,chargeMilesIn15Min:113,driveType:"FWD"}],L=5e3,g=(n,e,o)=>o===e?1:(n-e)/(o-e),T=(n,e,o)=>o===e?1:(o-n)/(o-e),m=n=>Math.max(0,Math.min(100,n*100)),C=n=>({priceFloor:Math.max(0,n-L),priceCeiling:n+L}),Q=(n,e)=>{const{priceFloor:o,priceCeiling:t}=C(e);return n.filter(r=>r.msrpUsd>=o&&r.msrpUsd<=t)},ee=(n,e)=>{const{priceFloor:o,priceCeiling:t}=C(e),r=Q(n,e);if(r.length===0)return{priceFloor:o,priceCeiling:t,eligibleVehicles:r,topThree:[],metricLeaders:{valueLeader:null,cargoRangeLeader:null,roadTripLeader:null}};const i=r.map(a=>a.msrpUsd/a.oneStopRangeMiles),c=r.map(a=>a.cargoCuFt),M=r.map(a=>a.oneStopRangeMiles),S=r.map(a=>a.chargeMilesIn15Min),v=r.map(a=>a.msrpUsd),U=Math.min(...i),_=Math.max(...i),$=Math.min(...c),x=Math.max(...c),V=Math.min(...M),q=Math.max(...M),O=Math.min(...S),N=Math.max(...S),B=Math.min(...v),z=Math.max(...v),p=r.map(a=>{const s=a.msrpUsd/a.oneStopRangeMiles,X=T(s,U,_),j=g(a.cargoCuFt,$,x),R=g(a.oneStopRangeMiles,V,q),Y=g(a.chargeMilesIn15Min,O,N),Z=T(a.msrpUsd,B,z),y=R*.55+j*.45,f=R*.45+Y*.35+Z*.2,G=X*.5+y*.3+f*.2;return{vehicle:a,metrics:{costPerOneStopMile:s,cargoRangeScore:m(y),roadTripBalanceScore:m(f),overallScore:m(G)}}}),A=[...p].sort((a,s)=>s.metrics.overallScore-a.metrics.overallScore).slice(0,3),H=[...p].sort((a,s)=>a.metrics.costPerOneStopMile-s.metrics.costPerOneStopMile)[0],k=[...p].sort((a,s)=>s.metrics.cargoRangeScore-a.metrics.cargoRangeScore)[0],K=[...p].sort((a,s)=>s.metrics.roadTripBalanceScore-a.metrics.roadTripBalanceScore)[0];return{priceFloor:o,priceCeiling:t,eligibleVehicles:r,topThree:A,metricLeaders:{valueLeader:H,cargoRangeLeader:k,roadTripLeader:K}}},re=25e3,ae=6e4,oe=500,ne=35e3,F=document.querySelector("#app");if(!F)throw new Error("App root not found");const l=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}),d=new Intl.NumberFormat("en-US",{maximumFractionDigits:2}),te=(n,e)=>{const{vehicle:o,metrics:t}=n;return`
    <article class="vehicle-card">
      <header class="vehicle-card__header">
        <p class="vehicle-card__rank">#${e+1}</p>
        <h3>${o.name}</h3>
      </header>
      <dl>
        <div>
          <dt>MSRP</dt>
          <dd>${l.format(o.msrpUsd)}</dd>
        </div>
        <div>
          <dt>One-stop range</dt>
          <dd>${o.oneStopRangeMiles} mi</dd>
        </div>
        <div>
          <dt>Cargo</dt>
          <dd>${d.format(o.cargoCuFt)} cu ft</dd>
        </div>
        <div>
          <dt>Charge (15m)</dt>
          <dd>+${o.chargeMilesIn15Min} mi</dd>
        </div>
      </dl>
      <div class="vehicle-card__scores">
        <p>Cost per one-stop mile: <strong>${l.format(t.costPerOneStopMile)}</strong></p>
        <p>Cargo + range score: <strong>${d.format(t.cargoRangeScore)}</strong></p>
        <p>Road-trip balance score: <strong>${d.format(t.roadTripBalanceScore)}</strong></p>
        <p>Overall score: <strong>${d.format(t.overallScore)}</strong></p>
      </div>
    </article>
  `};F.innerHTML=`
  <main class="page-shell">
    <section class="hero">
      <p class="hero__eyebrow">EV shortlist engine</p>
      <h1>Pick a price, get the best 3 EVs in that window.</h1>
      <p>
        Drag the slider to choose your target MSRP. We automatically search
        <strong>$5,000 below and $5,000 above</strong>, then rank by value, utility,
        and road-trip balance.
      </p>
    </section>

    <section class="controls">
      <label for="price-range" class="controls__label">Target MSRP</label>
      <div class="controls__numbers">
        <p id="target-price" class="target-price"></p>
        <p id="price-window" class="price-window"></p>
      </div>
      <input
        id="price-range"
        name="price-range"
        type="range"
        min="${re}"
        max="${ae}"
        step="${oe}"
        value="${ne}"
      />
      <p id="match-count" class="match-count"></p>
    </section>

    <section class="leaders" aria-live="polite">
      <article>
        <h2>Metric 1: Value</h2>
        <p>Lowest cost per one-stop mile.</p>
        <p id="leader-value" class="leaders__name"></p>
      </article>
      <article>
        <h2>Metric 2: Utility</h2>
        <p>Blend of cargo space and one-stop range.</p>
        <p id="leader-cargo-range" class="leaders__name"></p>
      </article>
      <article>
        <h2>Metric 3: Road Trip</h2>
        <p>Blend of one-stop range, charge speed, and price value.</p>
        <p id="leader-road-trip" class="leaders__name"></p>
      </article>
    </section>

    <section>
      <h2 class="top-three-heading">Top 3 in your band</h2>
      <div id="vehicle-results" class="vehicle-grid"></div>
    </section>
  </main>
`;const h=document.querySelector("#price-range"),w=document.querySelector("#target-price"),D=document.querySelector("#price-window"),E=document.querySelector("#match-count"),I=document.querySelector("#leader-value"),P=document.querySelector("#leader-cargo-range"),W=document.querySelector("#leader-road-trip"),u=document.querySelector("#vehicle-results");if(!h||!w||!D||!E||!I||!P||!W||!u)throw new Error("Missing one or more required DOM nodes");const b=()=>{const n=Number(h.value),e=ee(J,n);if(w.textContent=l.format(n),D.textContent=`${l.format(e.priceFloor)} to ${l.format(e.priceCeiling)}`,E.textContent=`${e.eligibleVehicles.length} vehicles in range`,I.textContent=e.metricLeaders.valueLeader?`${e.metricLeaders.valueLeader.vehicle.name} · ${l.format(e.metricLeaders.valueLeader.metrics.costPerOneStopMile)}/mi`:"No match in this band",P.textContent=e.metricLeaders.cargoRangeLeader?`${e.metricLeaders.cargoRangeLeader.vehicle.name} · ${d.format(e.metricLeaders.cargoRangeLeader.metrics.cargoRangeScore)} score`:"No match in this band",W.textContent=e.metricLeaders.roadTripLeader?`${e.metricLeaders.roadTripLeader.vehicle.name} · ${d.format(e.metricLeaders.roadTripLeader.metrics.roadTripBalanceScore)} score`:"No match in this band",e.topThree.length===0){u.innerHTML=`
      <article class="vehicle-card vehicle-card--empty">
        <h3>No vehicles in this price window</h3>
        <p>Try a higher or lower target MSRP to expand the shortlist.</p>
      </article>
    `;return}u.innerHTML=e.topThree.map((o,t)=>te(o,t)).join("")};h.addEventListener("input",b);b();
