(() => {
  const canvas = document.getElementById('arena');
  const ctx = canvas.getContext('2d');
  const $ = id => document.getElementById(id);
  const game = { active:false, wave:1, health:3, gold:0, score:0, level:1, enemies:[], arrows:[], sparks:[], last:0, spawn:0, wavePause:0, pointer:{x:0,y:0} };
  const rand=(a,b)=>a+Math.random()*(b-a);
  function resize(){const r=canvas.getBoundingClientRect(),d=window.devicePixelRatio||1;canvas.width=r.width*d;canvas.height=r.height*d;ctx.setTransform(d,0,0,d,0,0)}
  function dims(){return {w:canvas.clientWidth,h:canvas.clientHeight,ground:canvas.clientHeight*.79,wall:canvas.clientWidth*.80}}
  function updateHud(){ $('wave').textContent=game.wave; $('health').textContent=Array.from({length:game.health},()=> '♥').join(' ')||'—'; $('gold').textContent=game.gold; $('score').textContent=game.score; $('upgrade-cost').textContent=(30+(game.level-1)*25)+'g'; $('upgrade').disabled=!game.active||game.gold<30+(game.level-1)*25; }
  function start(){Object.assign(game,{active:true,wave:1,health:3,gold:0,score:0,level:1,enemies:[],arrows:[],sparks:[],last:performance.now(),spawn:0,wavePause:0});$('overlay').classList.add('hidden');$('status').textContent='WAVE 1 INCOMING';updateHud()}
  function roundRect(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
  function drawScene(t){const {w,h,ground,wall}=dims();ctx.clearRect(0,0,w,h);
    const sky=ctx.createLinearGradient(0,0,0,ground);sky.addColorStop(0,'#182030');sky.addColorStop(1,'#35434b');ctx.fillStyle=sky;ctx.fillRect(0,0,w,ground);
    ctx.fillStyle='#d6be83';ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(w*.77,h*.19,24,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    // distant ridges
    ctx.fillStyle='#202c34';ctx.beginPath();ctx.moveTo(0,ground);for(let x=0;x<=w;x+=70)ctx.lineTo(x,ground-(38+Math.abs(Math.sin(x*12.9898))*42));ctx.lineTo(w,ground);ctx.fill();
    const earth=ctx.createLinearGradient(0,ground,0,h);earth.addColorStop(0,'#55513a');earth.addColorStop(1,'#292d28');ctx.fillStyle=earth;ctx.fillRect(0,ground,w,h-ground);
    // castle wall and keep
    ctx.fillStyle='#44454a';ctx.fillRect(wall,ground-64,w-wall,h-ground+64);for(let x=wall;x<w;x+=30){ctx.fillStyle='#57565a';ctx.fillRect(x,ground-76,20,15)}
    ctx.fillStyle='#626066';ctx.fillRect(wall+18,ground-140,68,76);ctx.fillRect(wall+30,ground-185,44,50);ctx.fillStyle='#34323b';ctx.beginPath();ctx.moveTo(wall+26,ground-185);ctx.lineTo(wall+52,ground-222);ctx.lineTo(wall+78,ground-185);ctx.fill();
    ctx.fillStyle='#d5ae56';ctx.fillRect(wall+49,ground-215,2,17);ctx.fillStyle='#c84840';ctx.beginPath();ctx.moveTo(wall+51,ground-213);ctx.lineTo(wall+70,ground-208);ctx.lineTo(wall+51,ground-201);ctx.fill();
    // archer tower
    const tx=wall-20,ty=ground-70;ctx.fillStyle='#796d5a';ctx.fillRect(tx-18,ty-37,36,42);ctx.fillStyle='#413b36';ctx.fillRect(tx-8,ty-20,16,24);ctx.fillStyle='#c6a661';ctx.beginPath();ctx.arc(tx,ty-43,10,Math.PI,0);ctx.fill();ctx.fillRect(tx-13,ty-44,26,6);
    ctx.strokeStyle='#e0c06e';ctx.lineWidth=2;ctx.beginPath();ctx.arc(tx,ty-17,12,Math.PI*1.12,Math.PI*1.88);ctx.stroke();
    // ambient embers
    for(let i=0;i<18;i++){const x=((i*83+t*.012)%(w+20))-10,y=ground-((i*47+t*.018)%ground);ctx.globalAlpha=.18+.2*Math.sin(t/500+i);ctx.fillStyle='#f0c56f';ctx.fillRect(x,y,2,2)}ctx.globalAlpha=1;
    for(const e of game.enemies)drawEnemy(e,t);
    for(const a of game.arrows){ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.angle);ctx.strokeStyle='#e4d4a4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(8,0);ctx.stroke();ctx.fillStyle='#d4ae5d';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(4,-3);ctx.lineTo(4,3);ctx.fill();ctx.restore()}
    for(const s of game.sparks){ctx.globalAlpha=Math.max(0,s.life);ctx.fillStyle=s.color;ctx.beginPath();ctx.arc(s.x,s.y,2.4*s.life,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
  }
  function drawEnemy(e,t){const x=e.x,y=e.y,bob=Math.sin(t/120+e.phase)*2;ctx.save();ctx.translate(x,y+bob);ctx.fillStyle='#15141a88';ctx.beginPath();ctx.ellipse(0,2,14,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=e.color;ctx.beginPath();ctx.arc(0,-17,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#815a45';ctx.fillRect(-8,-11,16,18);ctx.fillStyle='#39333a';ctx.fillRect(-7,5,5,9);ctx.fillRect(2,5,5,9);ctx.fillStyle='#77716c';ctx.fillRect(7,-11,4,15);ctx.fillStyle='#d8c37d';ctx.fillRect(9,-13,2,5);ctx.fillStyle='#e6bd68';ctx.fillRect(-9,-30,18,3);ctx.fillStyle='#b94e48';ctx.fillRect(-9,-29,18*(e.hp/e.maxHp),2);ctx.restore()}
  function addSparks(x,y,color,n=8){for(let i=0;i<n;i++)game.sparks.push({x,y,vx:rand(-85,85),vy:rand(-100,30),life:1,color})}
  function shoot(x,y){if(!game.active)return;const {wall,ground}=dims(),sx=wall-20,sy=ground-110,dx=x-sx,dy=y-sy,len=Math.hypot(dx,dy)||1;game.arrows.push({x:sx,y:sy,vx:dx/len*560,vy:dy/len*560,angle:Math.atan2(dy,dx),life:1.2})}
  function frame(now){const dt=Math.min((now-game.last)/1000,.04);game.last=now;const {wall,ground}=dims();if(game.active){
      game.spawn-=dt;if(game.spawn<=0&&game.wavePause<=0){game.enemies.push({x:wall+rand(55,160),y:ground-10,hp:1+Math.floor((game.wave-1)/3),maxHp:1+Math.floor((game.wave-1)/3),speed:rand(22,33)+game.wave*2,color:['#9b5444','#70785b','#806b84'][Math.floor(rand(0,3))],phase:rand(0,7)});game.spawn=Math.max(.45,1.6-game.wave*.09)}
      for(const e of game.enemies)e.x-=e.speed*dt;
      game.arrows=game.arrows.filter(a=>a.life>0);for(const a of game.arrows){a.x+=a.vx*dt;a.y+=a.vy*dt;a.vy+=240*dt;a.angle=Math.atan2(a.vy,a.vx);a.life-=dt;for(const e of game.enemies){if(!e.dead&&Math.hypot(a.x-e.x,a.y-(e.y-8))<17){e.hp--;a.life=0;addSparks(e.x,e.y-10,'#f1cc72',5);if(e.hp<=0){e.dead=true;game.gold+=5;game.score+=10;addSparks(e.x,e.y-10,'#e97959',12)}break}}}
      game.enemies=game.enemies.filter(e=>{if(e.x<wall-25){game.health--;addSparks(wall-10,ground-25,'#e76d64',12);return false}return !e.dead});
      game.sparks=game.sparks.filter(s=>s.life>0);for(const s of game.sparks){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=120*dt;s.life-=dt*1.8}
      if(game.enemies.length===0){game.wavePause+=dt;if(game.wavePause>2.2){game.wave++;game.gold+=10;game.spawn=.3;game.wavePause=0;$('status').textContent='WAVE '+game.wave+' INCOMING'}}
      if(game.health<=0){game.active=false;$('overlay-title').textContent='The keep has fallen';$('overlay-copy').textContent='You held through '+game.wave+' wave'+(game.wave===1?'':'s')+' and scored '+game.score+'.';$('start').innerHTML='DEFEND AGAIN <span>→</span>';$('overlay').classList.remove('hidden');$('status').textContent='BATTLE ENDED'}updateHud();
    }drawScene(now);requestAnimationFrame(frame)}
  canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect();shoot(e.clientX-r.left,e.clientY-r.top)});
  $('start').addEventListener('click',start);$('upgrade').addEventListener('click',()=>{const cost=30+(game.level-1)*25;if(game.gold>=cost){game.gold-=cost;game.level++;game.arrows.push({x:dims().wall-20,y:dims().ground-110,vx:0,vy:-300,angle:-Math.PI/2,life:.1});$('status').textContent='ARCHER UPGRADED · LV '+game.level;updateHud()}});
  // Each level adds a second arrow on every shot.
  const baseShoot=shoot;shoot=(x,y)=>{baseShoot(x,y);for(let i=1;i<game.level;i++)setTimeout(()=>{if(game.active)baseShoot(x+rand(-20,20),y+rand(-20,20))},i*85)};
  window.addEventListener('resize',resize);resize();updateHud();requestAnimationFrame(frame);
})();
