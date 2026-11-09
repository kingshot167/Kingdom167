(() => {
  const canvas = document.getElementById('arena');
  const ctx = canvas.getContext('2d');
  const $ = id => document.getElementById(id);
  const DISTANCE_TO_TRAP = 1000;
  const locations = [
    { name:'THE TAVERN', start:0, end:180, sky:'#4a3030', ground:'#654535', types:['barrel','bottle','stool','spill'] },
    { name:'TAVERN YARD', start:180, end:370, sky:'#6a493b', ground:'#71543b', types:['cart','hay','crate','gate'] },
    { name:'KINGDOM ROAD', start:370, end:580, sky:'#48586c', ground:'#58604a', types:['mud','branch','rock','cart'] },
    { name:'ALLIANCE RALLY', start:580, end:800, sky:'#485064', ground:'#544d43', types:['shield','target','troops','crate'] },
    { name:'BEAR TRAP', start:800, end:1000, sky:'#343c52', ground:'#4e493d', types:['stake','net','crate','shield'] }
  ];
  const game = {
    active:false, distance:0, score:0, health:3, lane:0, jump:0, shield:false,
    invulnerable:0, spawnTimer:.65, obstacles:[], last:0, statusTimer:0,
    status:'READY FOR THE RALLY', lastLane:0, shake:0, ended:false
  };
  let width=0,height=0, lastHudDistance=-1, lastHudScore=-1, lastHudHealth=-1, lastHudShield=null, stageShown=-1;
  const rand=(min,max)=>min+Math.random()*(max-min);
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const locationFor=distance=>locations.findIndex((place,i)=>distance>=place.start&&(distance<place.end||i===locations.length-1));

  function resize(){
    const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
    width=rect.width;height=rect.height;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function setStatus(message,seconds=1.2){game.status=message;game.statusTimer=seconds;$('status').textContent=message}
  function updateHud(force=false){
    const wholeDistance=Math.floor(game.distance);
    if(force||wholeDistance!==lastHudDistance){$('distance').textContent=wholeDistance;lastHudDistance=wholeDistance}
    const wholeScore=Math.floor(game.score);
    if(force||wholeScore!==lastHudScore){$('score').textContent=wholeScore;lastHudScore=wholeScore}
    if(force||game.health!==lastHudHealth){$('health').textContent=Array.from({length:Math.max(0,game.health)},()=> '♥').join(' ')||'—';lastHudHealth=game.health}
    if(force||game.shield!==lastHudShield){const power=$('power-state');power.classList.toggle('ready',game.shield);$('power-label').textContent=game.shield?'SHIELD READY':'RARE POWER';lastHudShield=game.shield}
  }
  function start(){
    Object.assign(game,{active:true,distance:0,score:0,health:3,lane:0,jump:0,shield:false,invulnerable:0,spawnTimer:.6,obstacles:[],last:performance.now(),statusTimer:0,lastLane:0,shake:0,ended:false});
    lastHudDistance=-1;lastHudScore=-1;lastHudHealth=-1;lastHudShield=null;stageShown=0;$('location').textContent=locations[0].name;
    $('overlay').classList.add('hidden');setStatus('OUT THE DOOR · BEAR TRAP IN 1,000 M');updateHud(true);
  }
  function finish(won){
    game.active=false;game.ended=true;
    $('overlay-title').textContent=won?'Made it to Bear Trap!':'Bob missed the rally';
    $('overlay-copy').textContent=won?`DirtyBob made it with ${game.score} rally points. Your alliance saved him a spot.`:`The road got the better of DirtyBob at ${Math.floor(game.distance)} metres. The alliance is still waiting.`;
    $('start').innerHTML=won?'RUN IT AGAIN <span>→</span>':'TRY THE RUN AGAIN <span>→</span>';
    $('overlay').classList.remove('hidden');setStatus(won?'RALLY REACHED':'RUN OVER',99);
  }
  function laneX(lane,z,center){return center+lane*(width*(.055+z*.17))}
  function roadPoint(z,center,horizon,ground){return horizon+(ground-horizon)*z}
  function polygon(points,color){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fill()}
  function drawFlag(x,y,color,scale=1){ctx.strokeStyle='#302b2b';ctx.lineWidth=2*scale;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-46*scale);ctx.stroke();polygon([[x,y-46*scale],[x+27*scale,y-39*scale],[x,y-30*scale]],color)}
  function drawBackdrop(stage,t,horizon,ground,center){
    const place=locations[stage];
    const sky=ctx.createLinearGradient(0,0,0,horizon);sky.addColorStop(0,place.sky);sky.addColorStop(1,'#9a8065');ctx.fillStyle=sky;ctx.fillRect(0,0,width,horizon+4);
    if(stage===0){
      ctx.fillStyle='#59382e';ctx.fillRect(0,0,width,horizon+4);
      ctx.fillStyle='#382620';ctx.fillRect(0,horizon*.26,width,12);
      for(let x=36;x<width;x+=Math.max(90,width*.16)){ctx.fillStyle='#432b24';ctx.fillRect(x,0,8,horizon)}
      ctx.fillStyle='#8c5734';ctx.fillRect(width*.08,horizon*.28,width*.25,horizon*.48);
      ctx.fillStyle='#b7773b';ctx.fillRect(width*.1,horizon*.31,width*.21,9);
      for(let i=0;i<4;i++){ctx.fillStyle='#44302b';ctx.fillRect(width*(.12+i*.05),horizon*.39,22,38);ctx.fillStyle='#c09055';ctx.fillRect(width*(.12+i*.05)+4,horizon*.43,14,4)}
      ctx.fillStyle='#d09b4c';ctx.beginPath();ctx.arc(width*.79,horizon*.27,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f6cd77';ctx.beginPath();ctx.arc(width*.79,horizon*.27,5+Math.sin(t/140)*1.5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#d3b174';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText('THE LAST CROWN TAVERN',width*.51,horizon*.2);
    }else if(stage===1){
      polygon([[0,horizon*.55],[width*.18,horizon*.3],[width*.38,horizon*.52],[width*.57,horizon*.25],[width*.8,horizon*.52],[width,horizon*.3],[width,horizon],[0,horizon]],'#544039');
      ctx.fillStyle='#765139';ctx.fillRect(0,horizon*.55,width*.3,horizon*.45);ctx.fillStyle='#3c302a';ctx.beginPath();ctx.moveTo(width*.13,horizon*.55);ctx.lineTo(width*.2,horizon*.36);ctx.lineTo(width*.27,horizon*.55);ctx.fill();
      for(let x=0;x<width;x+=54){ctx.fillStyle='#493a30';ctx.fillRect(x,horizon*.75,4,horizon*.25);ctx.fillRect(x-5,horizon*.77,15,3)}
      ctx.fillStyle='#c18e50';ctx.fillRect(width*.68,horizon*.56,3,horizon*.44);ctx.fillRect(width*.78,horizon*.6,3,horizon*.4);
    }else if(stage===2){
      polygon([[0,horizon*.73],[width*.17,horizon*.3],[width*.34,horizon*.7],[width*.53,horizon*.23],[width*.7,horizon*.72],[width*.86,horizon*.34],[width,horizon*.72],[width,horizon],[0,horizon]],'#34404c');
      polygon([[0,horizon*.79],[width*.2,horizon*.52],[width*.36,horizon*.8],[width*.6,horizon*.43],[width*.78,horizon*.8],[width,horizon*.54],[width,horizon],[0,horizon]],'#435047');
      ctx.fillStyle='#313a3b';ctx.fillRect(width*.08,horizon*.59,3,horizon*.3);drawFlag(width*.08,horizon*.62,'#4c86bd',.65);
    }else if(stage===3){
      ctx.fillStyle='#3e4148';ctx.fillRect(0,horizon*.52,width*.22,horizon*.48);ctx.fillRect(width*.78,horizon*.48,width*.22,horizon*.52);
      for(let i=0;i<3;i++){drawFlag(width*(.06+i*.07),horizon*.52,['#5b94d1','#c9514c','#6aa66a'][i],.74);drawFlag(width*(.78+i*.07),horizon*.52,['#c9514c','#9871c5','#d0ae57'][i],.74)}
      ctx.fillStyle='#5c5040';ctx.fillRect(width*.32,horizon*.66,width*.36,horizon*.34);ctx.fillStyle='#887149';ctx.beginPath();ctx.moveTo(width*.29,horizon*.67);ctx.lineTo(width*.5,horizon*.38);ctx.lineTo(width*.71,horizon*.67);ctx.fill();
      ctx.fillStyle='#e2c77d';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText('ALLIANCE RALLY CAMP',width*.5,horizon*.58);
    }else{
      polygon([[0,horizon*.64],[width*.16,horizon*.36],[width*.31,horizon*.63],[width*.5,horizon*.3],[width*.69,horizon*.63],[width*.84,horizon*.37],[width,horizon*.64],[width,horizon],[0,horizon]],'#303946');
      ctx.fillStyle='#595b5c';ctx.fillRect(width*.06,horizon*.55,width*.16,horizon*.45);ctx.fillRect(width*.78,horizon*.53,width*.16,horizon*.47);
      for(let i=0;i<4;i++){ctx.fillStyle='#414449';ctx.fillRect(width*(.075+i*.036),horizon*.48,5,horizon*.07);ctx.fillRect(width*(.795+i*.036),horizon*.46,5,horizon*.07)}
      drawFlag(width*.5,horizon*.76,'#b54c48',1.25);
      ctx.fillStyle='#f0d48d';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText('BEAR TRAP · ALLIANCE HUNT',width*.5,horizon*.7);
    }
    ctx.fillStyle=place.ground;ctx.fillRect(0,horizon,width,ground-horizon);
    // distant torches and drifting sparks
    for(let i=0;i<8;i++){
      const x=(i+.5)*width/8,y=horizon+12+Math.sin(i*4+t/900)*5;
      ctx.fillStyle='#eab66a';ctx.globalAlpha=.35+.2*Math.sin(t/260+i);ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    }
    // road perspective
    const topW=width*.115,bottomW=width*.49;
    polygon([[center-topW,horizon],[center+topW,horizon],[center+bottomW,ground],[center-bottomW,ground]],stage===0?'#75533d':stage===1?'#786044':stage===2?'#6a6652':stage===3?'#62584a':'#655b4b');
    ctx.strokeStyle='rgba(244,213,153,.3)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(center-topW,horizon);ctx.lineTo(center-bottomW,ground);ctx.moveTo(center+topW,horizon);ctx.lineTo(center+bottomW,ground);ctx.stroke();
    for(let lane=-1;lane<=1;lane+=2){ctx.strokeStyle='rgba(238,218,171,.15)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(center+lane*width*.035,horizon);ctx.lineTo(center+lane*width*.165,ground);ctx.stroke()}
    // perspective paving marks
    ctx.strokeStyle='rgba(38,31,27,.28)';ctx.lineWidth=1;
    for(let i=1;i<8;i++){const z=i/8,y=roadPoint(z,center,horizon,ground);const half=topW+(bottomW-topW)*z;ctx.beginPath();ctx.moveTo(center-half,y);ctx.lineTo(center+half,y);ctx.stroke()}
  }
  function drawBarrel(x,y,s){ctx.fillStyle='#3c2b22';ctx.fillRect(x-12*s,y-27*s,24*s,27*s);ctx.fillStyle='#956039';ctx.fillRect(x-10*s,y-25*s,20*s,23*s);ctx.fillStyle='#4f3c2b';for(const k of [-19,-7])ctx.fillRect(x-11*s,y+k*s,22*s,3*s);ctx.fillStyle='#bd8a52';ctx.fillRect(x-3*s,y-23*s,2*s,19*s)}
  function drawBottle(x,y,s){ctx.fillStyle='#43352b';ctx.beginPath();ctx.ellipse(x,y-2*s,9*s,3*s,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#426b56';ctx.fillRect(x-5*s,y-19*s,10*s,17*s);ctx.beginPath();ctx.arc(x,y-19*s,5*s,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(x-2*s,y-25*s,4*s,8*s);ctx.fillStyle='#d6bd7b';ctx.fillRect(x-4*s,y-14*s,8*s,5*s)}
  function drawObstacle(o,center,horizon,ground){
    const z=clamp(o.z,0,1.15),s=.22+z*.92,x=laneX(o.lane,z,center),y=roadPoint(z,center,horizon,ground);
    ctx.fillStyle='rgba(16,13,12,.35)';ctx.beginPath();ctx.ellipse(x,y-2*s,18*s,5*s,0,0,Math.PI*2);ctx.fill();
    if(o.type==='eggplant'){
      ctx.save();ctx.shadowColor='#c676f1';ctx.shadowBlur=18*s;ctx.fillStyle='#873bb3';ctx.beginPath();ctx.ellipse(x,y-20*s,9*s,17*s,-.45,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#76a05d';ctx.beginPath();ctx.moveTo(x+4*s,y-34*s);ctx.lineTo(x+12*s,y-39*s);ctx.lineTo(x+7*s,y-30*s);ctx.lineTo(x+14*s,y-32*s);ctx.lineTo(x+5*s,y-25*s);ctx.fill();ctx.restore();return;
    }
    if(o.type==='barrel')drawBarrel(x,y,s);
    else if(o.type==='bottle')drawBottle(x,y,s);
    else if(o.type==='stool'){ctx.fillStyle='#9b7145';ctx.fillRect(x-13*s,y-20*s,26*s,5*s);ctx.fillRect(x-10*s,y-15*s,4*s,15*s);ctx.fillRect(x+6*s,y-15*s,4*s,15*s)}
    else if(o.type==='spill'){ctx.fillStyle='#3b6670';ctx.beginPath();ctx.ellipse(x,y-3*s,19*s,6*s,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#a7c5b8';ctx.beginPath();ctx.ellipse(x-4*s,y-4*s,8*s,2*s,0,0,Math.PI*2);ctx.stroke()}
    else if(o.type==='cart'){ctx.fillStyle='#59412d';ctx.fillRect(x-19*s,y-23*s,38*s,17*s);ctx.fillStyle='#9a6d3e';ctx.fillRect(x-17*s,y-26*s,34*s,12*s);ctx.strokeStyle='#302820';ctx.lineWidth=3*s;for(const dx of [-12,12]){ctx.beginPath();ctx.arc(x+dx*s,y-4*s,6*s,0,Math.PI*2);ctx.stroke()}ctx.fillRect(x+18*s,y-12*s,14*s,3*s)}
    else if(o.type==='hay'){ctx.fillStyle='#c4a354';ctx.fillRect(x-17*s,y-22*s,34*s,22*s);ctx.fillStyle='#e0c16b';ctx.beginPath();ctx.ellipse(x,y-22*s,17*s,5*s,0,Math.PI,Math.PI*2);ctx.fill();ctx.strokeStyle='#8f753e';ctx.lineWidth=2*s;ctx.beginPath();ctx.moveTo(x-10*s,y-10*s);ctx.lineTo(x+9*s,y-10*s);ctx.stroke()}
    else if(o.type==='crate'){ctx.fillStyle='#815b39';ctx.fillRect(x-15*s,y-23*s,30*s,23*s);ctx.strokeStyle='#d0a36a';ctx.lineWidth=2*s;ctx.strokeRect(x-13*s,y-21*s,26*s,19*s);ctx.beginPath();ctx.moveTo(x-12*s,y-20*s);ctx.lineTo(x+12*s,y-3*s);ctx.moveTo(x+12*s,y-20*s);ctx.lineTo(x-12*s,y-3*s);ctx.stroke()}
    else if(o.type==='gate'){ctx.fillStyle='#42332a';ctx.fillRect(x-22*s,y-34*s,6*s,34*s);ctx.fillRect(x+16*s,y-34*s,6*s,34*s);ctx.fillStyle='#815532';ctx.fillRect(x-17*s,y-31*s,34*s,21*s);for(let i=-12;i<=12;i+=8)ctx.fillRect(x+i*s,y-29*s,3*s,17*s)}
    else if(o.type==='mud'){ctx.fillStyle='#493f32';ctx.beginPath();ctx.ellipse(x,y-3*s,21*s,8*s,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6e6045';ctx.beginPath();ctx.ellipse(x-3*s,y-5*s,10*s,3*s,0,0,Math.PI*2);ctx.fill()}
    else if(o.type==='branch'){ctx.strokeStyle='#49392b';ctx.lineWidth=5*s;ctx.beginPath();ctx.moveTo(x-17*s,y-3*s);ctx.lineTo(x+17*s,y-7*s);ctx.moveTo(x-3*s,y-5*s);ctx.lineTo(x-10*s,y-16*s);ctx.moveTo(x+7*s,y-6*s);ctx.lineTo(x+13*s,y-17*s);ctx.stroke()}
    else if(o.type==='rock'){ctx.fillStyle='#66665e';ctx.beginPath();ctx.moveTo(x-17*s,y);ctx.lineTo(x-12*s,y-16*s);ctx.lineTo(x+2*s,y-24*s);ctx.lineTo(x+17*s,y-11*s);ctx.lineTo(x+15*s,y);ctx.fill()}
    else if(o.type==='shield'){ctx.fillStyle='#6c5540';ctx.beginPath();ctx.moveTo(x-15*s,y-27*s);ctx.lineTo(x+15*s,y-27*s);ctx.lineTo(x+12*s,y-9*s);ctx.lineTo(x,y-1*s);ctx.lineTo(x-12*s,y-9*s);ctx.closePath();ctx.fill();ctx.strokeStyle='#c2a165';ctx.lineWidth=2*s;ctx.stroke();ctx.fillStyle='#d7bd78';ctx.beginPath();ctx.arc(x,y-16*s,4*s,0,Math.PI*2);ctx.fill()}
    else if(o.type==='target'){ctx.fillStyle='#4b3c30';ctx.fillRect(x-2*s,y-23*s,4*s,23*s);for(let i=0;i<3;i++){ctx.strokeStyle=['#e0d2ad','#b84c46','#e0d2ad'][i];ctx.lineWidth=4*s;ctx.beginPath();ctx.arc(x,y-27*s,12*s-i*4*s,0,Math.PI*2);ctx.stroke()}}
    else if(o.type==='troops'){for(let i=-1;i<=1;i++){const tx=x+i*10*s;ctx.fillStyle='#39343b';ctx.beginPath();ctx.arc(tx,y-21*s,5*s,0,Math.PI*2);ctx.fill();ctx.fillStyle=['#658ab3','#a54543','#72926c'][i+1];ctx.fillRect(tx-5*s,y-16*s,10*s,15*s);ctx.strokeStyle='#c9b277';ctx.lineWidth=2*s;ctx.beginPath();ctx.moveTo(tx+5*s,y-15*s);ctx.lineTo(tx+8*s,y-1*s);ctx.stroke()}}
    else if(o.type==='stake'){ctx.fillStyle='#9a7448';ctx.beginPath();ctx.moveTo(x-5*s,y);ctx.lineTo(x-3*s,y-35*s);ctx.lineTo(x,y-43*s);ctx.lineTo(x+4*s,y-34*s);ctx.lineTo(x+6*s,y);ctx.fill();ctx.fillStyle='#c6a46a';ctx.fillRect(x-2*s,y-30*s,5*s,3*s)}
    else if(o.type==='net'){ctx.strokeStyle='#9a8461';ctx.lineWidth=2*s;ctx.beginPath();ctx.moveTo(x-20*s,y-27*s);ctx.lineTo(x+19*s,y-4*s);ctx.moveTo(x+18*s,y-28*s);ctx.lineTo(x-19*s,y-4*s);ctx.moveTo(x-17*s,y-25*s);ctx.lineTo(x+17*s,y-25*s);ctx.moveTo(x-15*s,y-8*s);ctx.lineTo(x+15*s,y-8*s);ctx.stroke()}
  }
  function drawBob(center,horizon,ground,t){
    const z=.93,x=laneX(game.lane,z,center),jumpHeight=game.jump>0?Math.sin((1-game.jump/.72)*Math.PI)*height*.12:0;
    const y=ground-height*.025-jumpHeight,blink=game.invulnerable>0&&Math.floor(t/90)%2===0;
    if(blink)return;
    const s=clamp(height/430,.72,1.14),run=Math.sin(t/72);
    ctx.fillStyle='rgba(18,14,13,.45)';ctx.beginPath();ctx.ellipse(x,ground-height*.025,18*s,6*s,0,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.translate(x,y);ctx.scale(s,s);
    // boots and running legs
    ctx.strokeStyle='#302821';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(-7+run*6,13);ctx.moveTo(5,0);ctx.lineTo(7-run*6,13);ctx.stroke();
    ctx.fillStyle='#1e1d20';ctx.beginPath();ctx.ellipse(-8+run*6,14,8,4,-.18,0,Math.PI*2);ctx.ellipse(8-run*6,14,8,4,.18,0,Math.PI*2);ctx.fill();
    // fur mantle and shirt
    ctx.fillStyle='#382d29';ctx.beginPath();ctx.moveTo(-14,-31);ctx.lineTo(-21,-24);ctx.lineTo(-15,-4);ctx.lineTo(15,-4);ctx.lineTo(21,-24);ctx.lineTo(13,-31);ctx.closePath();ctx.fill();
    ctx.fillStyle='#d7d1c7';ctx.beginPath();ctx.moveTo(-9,-29);ctx.lineTo(9,-29);ctx.lineTo(12,-7);ctx.lineTo(-12,-7);ctx.closePath();ctx.fill();
    ctx.fillStyle='#684a72';ctx.font='bold 5px system-ui';ctx.textAlign='center';ctx.fillText('DIRTYBOB',0,-17);
    // swinging arms
    ctx.strokeStyle='#81543d';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-14,-27);ctx.lineTo(-21+run*2,-14);ctx.moveTo(14,-27);ctx.lineTo(20-run*2,-13);ctx.stroke();
    // head, beard and cap
    ctx.fillStyle='#a76f4d';ctx.beginPath();ctx.arc(0,-38,11,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#382823';ctx.beginPath();ctx.arc(0,-36,11,0,Math.PI);ctx.lineTo(8,-28);ctx.lineTo(5,-22);ctx.lineTo(0,-19);ctx.lineTo(-6,-22);ctx.lineTo(-9,-29);ctx.closePath();ctx.fill();
    ctx.fillStyle='#312720';ctx.beginPath();ctx.ellipse(0,-46,12,5,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(-9,-51,18,5);ctx.fillRect(4,-48,13,2);
    ctx.fillStyle='#d2b671';ctx.font='bold 5px system-ui';ctx.textAlign='center';ctx.fillText('DB',0,-47);
    ctx.restore();
    if(game.shield){ctx.strokeStyle='rgba(203,131,237,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y-20*s,25*s,42*s,0,0,Math.PI*2);ctx.stroke()}
  }
  function drawScene(t){
    if(!width||!height)return;
    const stage=locationFor(game.distance),horizon=height*.30,ground=height*.91;
    let center=width*.5+Math.sin(game.distance*.006)*width*.025;
    ctx.save();if(game.shake>0){ctx.translate(rand(-4,4)*game.shake*4,rand(-3,3)*game.shake*3)}
    drawBackdrop(stage,t,horizon,ground,center);
    for(const obstacle of game.obstacles)drawObstacle(obstacle,center,horizon,ground);
    drawBob(center,horizon,ground,t);
    // stage marker
    ctx.fillStyle='rgba(10,12,17,.42)';ctx.fillRect(14,14,Math.min(width-28,210),29);
    ctx.fillStyle='#e6bd68';ctx.font='800 10px system-ui';ctx.textAlign='left';ctx.fillText(locations[stage].name,25,33);
    // progress rail toward the Bear Trap
    const railW=Math.min(180,width*.32);ctx.fillStyle='rgba(9,11,16,.55)';ctx.fillRect(width-railW-16,17,railW,7);
    ctx.fillStyle='#e6bd68';ctx.fillRect(width-railW-16,17,railW*clamp(game.distance/DISTANCE_TO_TRAP,0,1),7);
    ctx.fillStyle='#f3e6c6';ctx.font='8px system-ui';ctx.textAlign='right';ctx.fillText('BEAR TRAP',width-16,37);
    ctx.restore();
  }
  function spawnObstacle(){
    const stage=locationFor(game.distance),place=locations[stage];
    const rare=Math.random()<.055;
    let lane=Math.floor(Math.random()*3)-1;
    if(lane===game.lastLane)lane=lane===1?-1:lane+1;
    game.lastLane=lane;
    const type=rare?'eggplant':place.types[Math.floor(Math.random()*place.types.length)];
    game.obstacles.push({lane,type,z:0,checked:false,uid:Math.random()});
  }
  function hitObstacle(obstacle){
    if(obstacle.type==='eggplant'){
      game.shield=true;game.score+=50;setStatus('RARE FIND · ONE-HIT SHIELD',1.8);return;
    }
    if(game.invulnerable>0)return;
    if(game.shield){game.shield=false;game.invulnerable=.45;setStatus('EGGPLANT SHIELD · HIT BLOCKED');return;}
    if(game.jump>0)return;
    game.health--;game.invulnerable=1.05;game.shake=.4;setStatus('WHOA · WATCH YOUR STEP');updateHud(true);
    if(game.health<=0)finish(false);
  }
  function update(dt,now){
    if(!game.active)return;
    game.distance=Math.min(DISTANCE_TO_TRAP,game.distance+dt*17);
    game.score+=dt*6;
    game.jump=Math.max(0,game.jump-dt);game.invulnerable=Math.max(0,game.invulnerable-dt);game.shake=Math.max(0,game.shake-dt);
    const stage=locationFor(game.distance);
    if(stage!==stageShown){stageShown=stage;$('location').textContent=locations[stage].name;setStatus(stage===4?'BEAR TRAP AHEAD · FINAL APPROACH':`ENTERING ${locations[stage].name}`,1.8)}
    game.spawnTimer-=dt;
    if(game.spawnTimer<=0&&game.obstacles.length<14){spawnObstacle();game.spawnTimer=rand(.82,1.2)-Math.min(.18,stage*.035)}
    for(const obstacle of game.obstacles){
      obstacle.z+=dt*.56;
      if(!obstacle.checked&&obstacle.z>=.91){obstacle.checked=true;hitObstacle(obstacle);if(!game.active)break;}
      if(obstacle.z>=1.08&&!obstacle.processed){obstacle.processed=true;if(obstacle.type!=='eggplant'&&game.invulnerable<=0)game.score+=18}
    }
    game.obstacles=game.obstacles.filter(o=>o.z<1.12);
    if(game.statusTimer>0){game.statusTimer-=dt;if(game.statusTimer<=0&&game.active)setStatus(stage===4?'BEAR TRAP AHEAD':'KEEP MOVING',99)}
    updateHud();
    if(game.distance>=DISTANCE_TO_TRAP)finish(true);
  }
  function frame(now){
    const dt=game.last?Math.min((now-game.last)/1000,.04):0;game.last=now;
    try{update(dt,now);drawScene(now)}catch(error){
      console.error('Tavern to Trap recovered from a frame error:',error);
      game.obstacles.length=0;game.jump=0;game.invulnerable=.5;
      try{drawScene(now)}catch(renderError){console.error('Tavern to Trap canvas recovery failed:',renderError)}
    }
    requestAnimationFrame(frame);
  }
  function move(direction){if(!game.active)return;game.lane=clamp(game.lane+direction,-1,1)}
  function jump(){if(game.active&&game.jump<=0)game.jump=.72}
  $('start').addEventListener('click',start);
  document.addEventListener('keydown',event=>{
    if(['ArrowLeft','ArrowRight','ArrowUp',' ','a','A','d','D','w','W'].includes(event.key))event.preventDefault();
    if(event.repeat)return;
    if(event.key==='ArrowLeft'||event.key==='a'||event.key==='A')move(-1);
    else if(event.key==='ArrowRight'||event.key==='d'||event.key==='D')move(1);
    else if(event.key==='ArrowUp'||event.key===' '||event.key==='w'||event.key==='W')jump();
  });
  document.querySelectorAll('[data-control]').forEach(button=>button.addEventListener('pointerdown',event=>{
    event.preventDefault();const control=button.dataset.control;
    if(control==='left')move(-1);else if(control==='right')move(1);else jump();
  }));
  let touchStart=null;
  canvas.addEventListener('pointerdown',event=>{if(event.pointerType==='touch')touchStart={x:event.clientX,y:event.clientY}});
  canvas.addEventListener('pointerup',event=>{
    if(!touchStart)return;const dx=event.clientX-touchStart.x,dy=event.clientY-touchStart.y;
    if(Math.abs(dx)>30)move(dx<0?-1:1);else if(dy<-25)jump();touchStart=null;
  });
  canvas.addEventListener('pointercancel',()=>{touchStart=null});
  window.addEventListener('resize',resize);
  resize();updateHud(true);requestAnimationFrame(frame);
})();
