(() => {
  const $=id=>document.getElementById(id);
  const traits={
    evening:'Evening rallies',weekend:'Weekend events',english:'English chat',spanish:'Spanish chat',
    caller:'Rally caller',defense:'Defense expert',mentor:'New-player mentor',flex:'Flexible schedule',
    competitive:'Competitive',social:'Social & casual'
  };
  const alliances=[
    {code:'TNW',name:'The Night’s Watch',color:'#55a7ff'},
    {code:'RYL',name:'Royal Legionnairs',color:'#ff6570'},
    {code:'JUS',name:'Justice',color:'#b47bff'},
    {code:'ONE',name:'One Nation Empire',color:'#55cf87'},
    {code:'ITA',name:'Imperium Æternum',color:'#c9cdd6'}
  ];
  const applicants=[
    {name:'Mara Voss',role:'Rally regular',traits:['evening','caller','english'],wants:'A team that rallies together',note:'“I can call a clean rally and keep the squad moving.”'},
    {name:'Tomas Vale',role:'New-player mentor',traits:['weekend','mentor','spanish'],wants:'A welcoming crew with weekend events',note:'“Happy to teach the ropes and show up on Saturdays.”'},
    {name:'Iris North',role:'Fortress defender',traits:['evening','defense','competitive'],wants:'Organized fights and a serious team',note:'“Give me a wall to hold and a plan to follow.”'},
    {name:'Rook Mercer',role:'Community builder',traits:['weekend','social','english'],wants:'Friendly chat and a relaxed pace',note:'“I bring bad jokes, good callouts, and spare snacks.”'},
    {name:'Elio Cruz',role:'Bilingual coordinator',traits:['flex','spanish','caller'],wants:'An active team with room to organize',note:'“I can bridge chat groups and help coordinate rallies.”'},
    {name:'Nadia Frost',role:'Competitive defender',traits:['evening','defense','english'],wants:'A focused group for evening events',note:'“I track timers, hold formation, and follow the plan.”'},
    {name:'Pip Rowan',role:'Casual all-rounder',traits:['weekend','social','flex'],wants:'A friendly alliance with flexible events',note:'“I’m here for kingdom friends and the occasional big win.”'},
    {name:'Soren Pike',role:'Rally specialist',traits:['caller','competitive','weekend'],wants:'A coordinated team that likes to compete',note:'“I like a tight roster and a decisive rally lead.”'},
    {name:'Ada Sol',role:'Mentor and scout',traits:['mentor','flex','english'],wants:'A helpful group with varied schedules',note:'“I’m patient with new players and quick with a map.”'},
    {name:'Bran Oak',role:'Shield wall',traits:['defense','weekend','social'],wants:'A steady crew that enjoys team events',note:'“I’ll hold the line, then bring the post-battle stories.”'},
    {name:'Luz Reyes',role:'Rally organizer',traits:['spanish','evening','caller'],wants:'A lively alliance with evening rallies',note:'“I can bring players together across both chat channels.”'},
    {name:'Kit Arden',role:'Flexible competitor',traits:['competitive','flex','defense'],wants:'A prepared team that adapts quickly',note:'“Give me the objective and I’ll find a way to hold it.”'}
  ];
  const state={round:[],vacancies:[],index:0,score:0,strongFits:0,placed:0,busy:false};
  const shuffle=list=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

  function beginRound(){
    state.round=shuffle(applicants).slice(0,8);state.vacancies=alliances.map(alliance=>({alliance,needs:shuffle(Object.keys(traits)).slice(0,2),seats:2,score:0}));
    state.index=0;state.score=0;state.strongFits=0;state.placed=0;state.busy=false;
    $('desk').classList.remove('finished');$('results').classList.add('hidden');$('desk-content').hidden=false;
    $('feedback').textContent='Select an alliance to review the fit.';$('feedback').className='feedback';
    renderAlliances();renderApplicant();updateSummary();
    $('advice').textContent='Read the vacancies. Read the recruit. Make a decision you can defend.';
  }
  function renderApplicant(){
    const candidate=state.round[state.index];if(!candidate){finishRound();return}
    $('round-progress').textContent=`RECRUIT ${state.index+1} / ${state.round.length}`;
    $('applicant-number').textContent=String(state.index+1).padStart(2,'0');
    $('applicant-name').textContent=candidate.name;$('applicant-role').textContent=candidate.role;
    $('applicant-note').textContent=candidate.note;$('applicant-wants').textContent=candidate.wants;
    $('applicant-avatar').textContent=candidate.name.split(' ').map(part=>part[0]).join('');
    $('applicant-traits').innerHTML=candidate.traits.map(id=>`<span class="trait">${traits[id]}</span>`).join('');
    renderAlliances();
  }
  function renderAlliances(){
    const candidate=state.round[state.index];
    $('alliances').innerHTML=state.vacancies.map((vacancy,index)=>{
      const fit=candidate?vacancy.needs.filter(tag=>candidate.traits.includes(tag)).length:0;
      const needText=vacancy.needs.map(tag=>`<span class="need">${traits[tag]}</span>`).join('');
      return `<button class="alliance-card" type="button" data-alliance="${index}" style="--accent:${vacancy.alliance.color}" ${vacancy.seats===0||state.busy?'disabled':''} aria-label="Place with ${vacancy.alliance.name}. ${fit} of 2 traits match. ${vacancy.seats} seats left"><span class="alliance-code">${vacancy.alliance.code}</span><span class="alliance-info"><strong>${vacancy.alliance.name}</strong><span class="need-list">${needText}</span></span><span class="seats"><b>${vacancy.seats}</b> SEATS</span></button>`;
    }).join('');
    $('alliances').querySelectorAll('[data-alliance]').forEach(button=>button.addEventListener('click',()=>place(Number(button.dataset.alliance))));
    updateSummary();
  }
  function updateSummary(){
    $('score').textContent=String(state.score).padStart(3,'0');
    $('vacancies').textContent=state.vacancies.reduce((sum,item)=>sum+item.seats,0);
  }
  function place(index){
    if(state.busy||!state.round[state.index])return;
    const candidate=state.round[state.index],vacancy=state.vacancies[index];if(!vacancy||!vacancy.seats)return;
    const matched=vacancy.needs.filter(tag=>candidate.traits.includes(tag)).length;
    const points=matched===2?120:matched===1?60:10;
    state.score+=points;state.placed++;vacancy.seats--;vacancy.score+=points;
    if(matched===2)state.strongFits++;
    state.busy=true;
    const feedback=$('feedback');feedback.className=`feedback ${matched===2?'perfect':matched===1?'good':'miss'}`;
    feedback.textContent=matched===2?`Perfect fit. Signed. +${points} points.`:matched===1?`One strong link. I’ll permit it. +${points} points.`:`A gamble. I expect a report. +${points} points.`;
    $('advice').textContent=matched===2?'Excellent placement. The kingdom may keep them.':matched===1?'Acceptable. Next time, read both requirements.':'Bold choice. I’ll be watching that alliance.';
    state.index++;updateSummary();
    window.setTimeout(()=>{state.busy=false;if(state.index>=state.round.length)finishRound();else renderApplicant()},650);
  }
  function pass(){
    if(state.busy||!state.round[state.index])return;
    state.busy=true;$('feedback').className='feedback';$('feedback').textContent='Passed. No points, no wasted seat.';
    $('advice').textContent='A transfer manager knows when not to force a match.';state.index++;
    window.setTimeout(()=>{state.busy=false;if(state.index>=state.round.length)finishRound();else renderApplicant()},500);
  }
  function finishRound(){
    $('desk').classList.add('finished');$('results').classList.remove('hidden');
    $('final-score').textContent=state.score;$('strong-fits').textContent=`${state.strongFits} / ${state.round.length}`;$('placed-count').textContent=`${state.placed} / ${state.round.length}`;
    const average=state.score/state.round.length;
    const rank=average>=95?'Kingdom Architect':average>=65?'Sharp Eye':average>=35?'Promising Recruiter':'Transfer Trainee';
    $('result-title').textContent=rank;
    $('result-copy').textContent=average>=95?'Slickfinger approves. The vacancies are filled with recruits who fit.':average>=55?'A solid window. A few placements could use a closer read.':'Slickfinger slides the rulebook across the desk. There’s room to improve.';
    $('advice').textContent='Window closed. The kingdom will live with your choices.';
  }
  $('pass').addEventListener('click',pass);
  $('play-again').addEventListener('click',beginRound);
  beginRound();
})();
