const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const screens={home:$('#homeScreen'),modes:$('#modesScreen'),game:$('#gameScreen'),results:$('#resultsScreen'),profile:$('#profileScreen'),events:$('#eventsScreen'),collection:$('#collectionScreen'),leaderboard:$('#leaderboardScreen'),career:$('#careerScreen'),shop:$('#shopScreen'),settings:$('#settingsScreen')};
const defaultProfile={level:1,xp:0,coins:250,gems:10,games:0,correct:0,questions:0,best:0,bestStreak:0,totalTime:0,unlocked:['starter'],owned:['neon'],sound:true,vibration:true,motion:true,contrast:false};
let profile={...defaultProfile,...JSON.parse(localStorage.getItem('dqc_profile')||'{}')};
const previewCache=new Map();
const state={mode:'classic',round:0,totalRounds:10,score:0,correct:0,streak:0,bestStreak:0,lives:3,responseTimes:[],current:null,timerId:null,startedAt:0,duration:10000,audio:null,nodes:[],previewTimer:null,muted:!profile.sound,answered:false,power:{fifty:2,replay:2,freeze:1},usedTracks:[],preview:null,audioStarted:false,loadingPreview:false};
const tracks=[
{artist:'a-ha',title:'Take On Me',decade:'80',genre:'Synthpop',country:'Noruega',search:'a-ha Take On Me',icon:'🎹'},
{artist:'Bon Jovi',title:'Livin’ On a Prayer',decade:'80',genre:'Rock',country:'EE. UU.',search:'Bon Jovi Livin On A Prayer',icon:'🎸'},
{artist:'Madonna',title:'Like a Prayer',decade:'80',genre:'Pop',country:'EE. UU.',search:'Madonna Like a Prayer',icon:'✨'},
{artist:'Michael Jackson',title:'Billie Jean',decade:'80',genre:'Pop',country:'EE. UU.',search:'Michael Jackson Billie Jean',icon:'🕺'},
{artist:'Europe',title:'The Final Countdown',decade:'80',genre:'Rock',country:'Suecia',search:'Europe The Final Countdown',icon:'🚀'},
{artist:'Whitney Houston',title:'I Wanna Dance with Somebody',decade:'80',genre:'Pop',country:'EE. UU.',search:'Whitney Houston I Wanna Dance With Somebody',icon:'💃'},
{artist:'Mecano',title:'Hijo de la Luna',decade:'80',genre:'Pop español',country:'España',search:'Mecano Hijo de la Luna',icon:'🌙'},
{artist:'Hombres G',title:'Devuélveme a Mi Chica',decade:'80',genre:'Pop rock',country:'España',search:'Hombres G Devuelveme a Mi Chica',icon:'😎'},
{artist:'Roxette',title:'The Look',decade:'80',genre:'Pop rock',country:'Suecia',search:'Roxette The Look',icon:'👀'},
{artist:'The Police',title:'Every Breath You Take',decade:'80',genre:'Rock',country:'Reino Unido',search:'The Police Every Breath You Take',icon:'🌃'},
{artist:'Depeche Mode',title:'Enjoy the Silence',decade:'90',genre:'Synthpop',country:'Reino Unido',search:'Depeche Mode Enjoy the Silence',icon:'🌹'},
{artist:'Nirvana',title:'Smells Like Teen Spirit',decade:'90',genre:'Grunge',country:'EE. UU.',search:'Nirvana Smells Like Teen Spirit',icon:'🔥'},
{artist:'Spice Girls',title:'Wannabe',decade:'90',genre:'Pop',country:'Reino Unido',search:'Spice Girls Wannabe',icon:'✌️'},
{artist:'Backstreet Boys',title:'I Want It That Way',decade:'90',genre:'Pop',country:'EE. UU.',search:'Backstreet Boys I Want It That Way',icon:'🎤'},
{artist:'Cher',title:'Believe',decade:'90',genre:'Dance pop',country:'EE. UU.',search:'Cher Believe',icon:'💫'},
{artist:'Los del Río',title:'Macarena',decade:'90',genre:'Pop latino',country:'España',search:'Los del Rio Macarena',icon:'💃'},
{artist:'La Oreja de Van Gogh',title:'Cuéntame al Oído',decade:'90',genre:'Pop español',country:'España',search:'La Oreja de Van Gogh Cuentame al Oido',icon:'🌻'},
{artist:'Aqua',title:'Barbie Girl',decade:'90',genre:'Eurodance',country:'Dinamarca',search:'Aqua Barbie Girl',icon:'🩷'},
{artist:'Corona',title:'The Rhythm of the Night',decade:'90',genre:'Eurodance',country:'Italia',search:'Corona The Rhythm of the Night',icon:'🪩'},
{artist:'Oasis',title:'Wonderwall',decade:'90',genre:'Britpop',country:'Reino Unido',search:'Oasis Wonderwall',icon:'🎶'}
];
const modes=[
{id:'classic',icon:'🎤',name:'¿Quién canta?',desc:'10 fragmentos, cuatro artistas y puntuación por rapidez.'},
{id:'title',icon:'🎵',name:'¿Cómo se llama?',desc:'Adivina el título de cada tema.'},
{id:'decades',icon:'📆',name:'80 contra 90',desc:'Decide a qué década pertenece el fragmento.'},
{id:'eighties',icon:'📼',name:'Solo años 80',desc:'Una selección neón exclusivamente ochentera.'},
{id:'nineties',icon:'💿',name:'Solo años 90',desc:'Dance, pop y rock de la década de los 90.'},
{id:'survival',icon:'❤',name:'Supervivencia',desc:'Tres vidas. Juega hasta quedarte sin ninguna.'},
{id:'speed',icon:'⚡',name:'Contrarreloj',desc:'Fragmentos de 7 segundos y máxima velocidad.'},
{id:'legend',icon:'👑',name:'La última nota',desc:'5 segundos, sin comodines y una sola vida.',tag:'EXPERTO'}
];
const achievements=[{id:'starter',icon:'🎤',name:'Primer concierto',test:p=>p.games>=1},{id:'ears',icon:'👂',name:'Buen oído',test:p=>p.correct>=25},{id:'streak5',icon:'🔥',name:'Racha de fuego',test:p=>p.bestStreak>=5},{id:'century',icon:'💯',name:'100 respuestas',test:p=>p.questions>=100},{id:'legend',icon:'👑',name:'Leyenda musical',test:p=>p.best>=12000},{id:'veteran',icon:'💿',name:'Coleccionista',test:p=>p.games>=10}];
const shopItems=[{id:'neon',icon:'🌌',name:'Neón original',price:0},{id:'miami',icon:'🌴',name:'Miami Sunset',price:500},{id:'vinyl',icon:'💿',name:'Vinilo dorado',price:750},{id:'arcade',icon:'🕹️',name:'Arcade 1990',price:900},{id:'laser',icon:'⚡',name:'Laser Stage',price:1200},{id:'platinum',icon:'🎙️',name:'Micrófono platino',price:1500}];
function save(){localStorage.setItem('dqc_profile',JSON.stringify(profile));renderAll();}
function rankName(level){return level>=20?'Icono musical':level>=15?'Leyenda':level>=10?'Maestro':level>=7?'Experto':level>=5?'Melómano':level>=3?'DJ':'Aficionado'}
function xpNeed(level){return 400+level*100}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800)}
function show(name){Object.values(screens).forEach(x=>x.classList.remove('active'));screens[name].classList.add('active');$$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.go===name));window.scrollTo({top:0,behavior:'smooth'});if(name==='profile')renderProfile();if(name==='collection')renderCollection();if(name==='leaderboard')renderLeaderboard();if(name==='career')renderCareer();if(name==='shop')renderShop()}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function renderAll(){while(profile.xp>=xpNeed(profile.level)){profile.xp-=xpNeed(profile.level);profile.level++;profile.coins+=100;toast(`¡Nivel ${profile.level} alcanzado! +100 monedas`)}$('#coinsTop').textContent=profile.coins;$('#gemsTop').textContent=profile.gems;$('#levelText').textContent=profile.level;$('#playerRank').textContent=rankName(profile.level);$('#xpText').textContent=`${profile.xp} / ${xpNeed(profile.level)} XP`;$('#xpBar').style.width=`${profile.xp/xpNeed(profile.level)*100}%`;$('#soundToggle').textContent=state.muted?'🔇':'🔊';$('#soundSetting').checked=!state.muted;$('#vibrationSetting').checked=profile.vibration;$('#motionSetting').checked=profile.motion;$('#contrastSetting').checked=profile.contrast;document.body.classList.toggle('no-motion',!profile.motion);document.body.classList.toggle('high-contrast',profile.contrast)}
function renderModes(){$('#modeGrid').innerHTML=modes.map(m=>`<button class="mode-card" data-mode="${m.id}">${m.tag?`<em>${m.tag}</em>`:''}<span>${m.icon}</span><h3>${m.name}</h3><p>${m.desc}</p></button>`).join('')}
function modeConfig(id){const cfg={classic:{rounds:10,time:10,lives:3},title:{rounds:10,time:10,lives:3},decades:{rounds:10,time:10,lives:3},eighties:{rounds:10,time:10,lives:3},nineties:{rounds:10,time:10,lives:3},survival:{rounds:30,time:10,lives:3},speed:{rounds:12,time:7,lives:3},legend:{rounds:20,time:5,lives:1}};return cfg[id]||cfg.classic}
function startGame(mode='classic'){const cfg=modeConfig(mode);Object.assign(state,{mode,round:0,totalRounds:cfg.rounds,duration:cfg.time*1000,lives:cfg.lives,score:0,correct:0,streak:0,bestStreak:0,responseTimes:[],answered:false,power:{fifty:mode==='legend'?0:2,replay:mode==='legend'?0:2,freeze:mode==='legend'?0:1},usedTracks:[]});$('#modeLabel').textContent=modes.find(m=>m.id===mode)?.name||'Clásico';show('game');nextRound()}
function eligibleTracks(){if(state.mode==='eighties')return tracks.filter(t=>t.decade==='80');if(state.mode==='nineties')return tracks.filter(t=>t.decade==='90');return tracks}
async function nextRound(){
  clearInterval(state.timerId);stopAudio();
  if(state.round>=state.totalRounds||state.lives<=0)return endGame();
  state.round++;state.answered=false;state.preview=null;state.audioStarted=false;state.loadingPreview=false;
  let pool=eligibleTracks().filter(t=>!state.usedTracks.includes(t.artist));
  if(!pool.length){state.usedTracks=[];pool=eligibleTracks()}
  state.current=pool[Math.floor(Math.random()*pool.length)];state.usedTracks.push(state.current.artist);
  $('#roundLabel').textContent=`${state.round}/${state.totalRounds}`;$('#scoreLabel').textContent=state.score;$('#streakLabel').textContent=`Racha ${state.streak}`;
  $('#livesLabel').textContent='❤'.repeat(state.lives)+'♡'.repeat(Math.max(0,3-state.lives));$('#roundProgress').style.width=`${(state.round-1)/state.totalRounds*100}%`;
  $('#feedback').textContent='Pulsa el botón para cargar y escuchar una canción real.';$('#fiftyCount').textContent=state.power.fifty;$('#replayCount').textContent=state.power.replay;$('#freezeCount').textContent=state.power.freeze;
  renderAnswers();setAnswersEnabled(false);
  const listen=$('#listenButton');listen.disabled=false;listen.textContent='▶ Cargar y escuchar canción real';listen.hidden=false;
  $('#providerStatus').textContent='Catálogo: Apple/iTunes Preview · conexión necesaria';
}
function setAnswersEnabled(enabled){$$('.answer-button').forEach(b=>b.disabled=!enabled)}
function answerField(t){if(state.mode==='title')return t.title;if(state.mode==='decades')return `Años ${t.decade}`;return t.artist}
function questionText(){if(state.mode==='title')return '¿Cómo se llama la canción?';if(state.mode==='decades')return '¿De qué década es?';return '¿Quién canta?'}
function renderAnswers(){const correct=answerField(state.current);let opts;if(state.mode==='decades')opts=['Años 80','Años 90','Años 70','Años 2000'];else{const vals=[...new Set(tracks.filter(t=>answerField(t)!==correct).map(answerField))];opts=[correct,...shuffle(vals).slice(0,3)]}opts=shuffle(opts);$('#questionText').textContent=questionText();$('#answers').innerHTML=opts.map((v,i)=>`<button class="answer-button" data-value="${v.replaceAll('"','&quot;')}">${String.fromCharCode(65+i)} · ${v}</button>`).join('');$$('.answer-button').forEach(b=>b.onclick=()=>answer(b.dataset.value,b))}
function startTimer(){clearInterval(state.timerId);const circumference=326.72;state.startedAt=performance.now();const tick=()=>{const elapsed=performance.now()-state.startedAt,remain=Math.max(0,state.duration-elapsed);$('#timerText').textContent=(remain/1000).toFixed(1);$('#timerProgress').style.strokeDashoffset=circumference*(elapsed/state.duration);if(remain<=0){clearInterval(state.timerId);answer(null,null)}};tick();state.timerId=setInterval(tick,70)}
function answer(choice,btn){if(state.answered)return;state.answered=true;clearInterval(state.timerId);stopAudio();const elapsed=Math.min(state.duration/1000,(performance.now()-state.startedAt)/1000);state.responseTimes.push(elapsed);const correct=answerField(state.current),ok=choice===correct;$$('.answer-button').forEach(b=>{b.disabled=true;if(b.dataset.value===correct)b.classList.add('correct')});if(ok){state.correct++;state.streak++;state.bestStreak=Math.max(state.bestStreak,state.streak);const gained=500+Math.round((state.duration/1000-elapsed)*90)+Math.min(state.streak-1,6)*120;state.score+=gained;$('#feedback').textContent=`✅ ¡Correcto! +${gained} · ${state.current.artist} — ${state.current.title}`;beep(880,.12,'sine');vibrate(40)}else{state.streak=0;state.lives--;if(btn)btn.classList.add('wrong');$('#feedback').textContent=`❌ Era ${correct} · ${state.current.artist} — ${state.current.title}`;beep(120,.18,'sawtooth');vibrate([70,40,70])}$('#scoreLabel').textContent=state.score;$('#streakLabel').textContent=`Racha ${state.streak}`;setTimeout(nextRound,1500)}
function endGame(){stopAudio();const avg=state.responseTimes.length?state.responseTimes.reduce((a,b)=>a+b,0)/state.responseTimes.length:0;const xp=Math.round(state.correct*55+state.score/35),coins=Math.round(state.correct*12+state.score/220);profile.games++;profile.correct+=state.correct;profile.questions+=state.round;profile.best=Math.max(profile.best,state.score);profile.bestStreak=Math.max(profile.bestStreak,state.bestStreak);profile.totalTime+=state.responseTimes.reduce((a,b)=>a+b,0);profile.xp+=xp;profile.coins+=coins;const newly=[];achievements.forEach(a=>{if(!profile.unlocked.includes(a.id)&&a.test(profile)){profile.unlocked.push(a.id);newly.push(a.name)}});$('#finalScore').textContent=state.score;$('#finalCorrect').textContent=`${state.correct}/${state.round}`;$('#finalStreak').textContent=state.bestStreak;$('#finalAverage').textContent=`${avg.toFixed(1)} s`;$('#rewardXp').textContent=xp;$('#rewardCoins').textContent=coins;$('#finalTitle').textContent=state.correct/state.round>=.9?'¡Leyenda musical!':state.correct/state.round>=.7?'¡Gran oído!':state.correct/state.round>=.5?'¡Buen ritmo!':'¡Sigue entrenando!';$('#resultBadge').textContent=state.correct/state.round>=.9?'👑':state.correct/state.round>=.7?'🏆':state.correct/state.round>=.5?'🎧':'🎤';$('#newAchievements').textContent=newly.length?`🏅 Nueva insignia: ${newly.join(', ')}`:'';save();show('results')}
function ensureAudio(){if(!state.audioContext)state.audioContext=new(window.AudioContext||window.webkitAudioContext)();if(state.audioContext.state==='suspended')state.audioContext.resume();return state.audioContext}
function jsonpItunes(track){
  return new Promise((resolve,reject)=>{
    const callback='dqcJsonp_'+Date.now()+'_'+Math.random().toString(36).slice(2);
    const script=document.createElement('script');
    const timeout=setTimeout(()=>{cleanup();reject(new Error('Tiempo agotado al consultar el catálogo'))},12000);
    function cleanup(){clearTimeout(timeout);delete window[callback];script.remove()}
    window[callback]=data=>{cleanup();resolve(data)};
    script.onerror=()=>{cleanup();reject(new Error('No se pudo conectar con el catálogo musical'))};
    script.src=`https://itunes.apple.com/search?term=${encodeURIComponent(track.search)}&entity=song&limit=10&country=ES&callback=${callback}`;
    document.head.appendChild(script);
  });
}
async function resolvePreview(track){
  if(previewCache.has(track.search))return previewCache.get(track.search);
  const data=await jsonpItunes(track);
  const norm=v=>(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const artist=norm(track.artist), title=norm(track.title);
  const results=Array.isArray(data.results)?data.results:[];
  const match=results.find(r=>r.previewUrl&&norm(r.artistName).includes(artist.split(' ')[0])&&norm(r.trackName).includes(title.split(' ')[0]))||results.find(r=>r.previewUrl);
  const result=match?{url:match.previewUrl,artwork:match.artworkUrl100,store:match.trackViewUrl,artist:match.artistName,title:match.trackName}:null;
  previewCache.set(track.search,result);return result;
}
async function playCurrent(){
  if(state.loadingPreview||state.answered)return;
  if(state.muted){state.muted=false;profile.sound=true;renderAll()}
  state.loadingPreview=true;const listen=$('#listenButton');listen.disabled=true;listen.textContent='Cargando preview oficial…';
  $('#feedback').textContent='Buscando la canción real en el catálogo…';
  try{
    const preview=state.preview||await resolvePreview(state.current);
    if(!preview)throw new Error('Preview no disponible');state.preview=preview;
    stopAudio();
    const audio=new Audio();state.audio=audio;audio.preload='auto';audio.src=preview.url;audio.playsInline=true;
    await new Promise((resolve,reject)=>{const ok=()=>{cleanup();resolve()};const bad=()=>{cleanup();reject(new Error('Audio no disponible'))};const cleanup=()=>{audio.removeEventListener('canplay',ok);audio.removeEventListener('error',bad)};audio.addEventListener('canplay',ok,{once:true});audio.addEventListener('error',bad,{once:true});audio.load()});
    const playable=Math.max(0,(Number.isFinite(audio.duration)?audio.duration:30)-10.2);audio.currentTime=playable>0?Math.random()*playable:0;audio.volume=.95;
    await audio.play();state.audioStarted=true;setAnswersEnabled(true);listen.textContent='↻ Repetir 10 segundos';listen.disabled=false;
    $('#providerStatus').textContent=`Preview oficial: ${preview.artist} — ${preview.title}`;$('#feedback').textContent='¡Escucha y responde!';
    $('.equalizer').classList.add('playing');startTimer();
    state.previewTimer=setTimeout(()=>{if(state.audio===audio){audio.pause();$('.equalizer')?.classList.remove('playing')}},10000);
  }catch(error){
    console.warn(error);state.preview=null;listen.disabled=false;listen.textContent='↻ Probar otra canción real';
    $('#feedback').textContent='⚠️ No se encontró una preview reproducible. Pulsa para cambiar de canción.';$('#providerStatus').textContent='Preview no disponible para este tema o región';
    state.usedTracks.push(state.current.artist);let pool=eligibleTracks().filter(t=>!state.usedTracks.includes(t.artist));if(!pool.length){state.usedTracks=[];pool=eligibleTracks()}state.current=pool[Math.floor(Math.random()*pool.length)];renderAnswers();setAnswersEnabled(false);
  }finally{state.loadingPreview=false}
}
function stopAudio(){
  if(state.previewTimer){clearTimeout(state.previewTimer);state.previewTimer=null}
  if(state.audio){try{state.audio.pause();state.audio.removeAttribute('src');state.audio.load()}catch{}state.audio=null}
  $('.equalizer')?.classList.remove('playing')
}
function beep(freq,dur,type){if(state.muted)return;const ctx=ensureAudio(),o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.08,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+dur);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+dur)}
function vibrate(pattern){if(profile.vibration&&navigator.vibrate)navigator.vibrate(pattern)}
function renderProfile(){const accuracy=profile.questions?Math.round(profile.correct/profile.questions*100):0;$('#profileRank').textContent=`${rankName(profile.level)} · Nivel ${profile.level}`;$('#profileXpBar').style.width=`${profile.xp/xpNeed(profile.level)*100}%`;$('#profileStats').innerHTML=`<article><strong>${profile.games}</strong><span>Partidas</span></article><article><strong>${accuracy}%</strong><span>Aciertos</span></article><article><strong>${profile.best}</strong><span>Récord</span></article><article><strong>${profile.correct}</strong><span>Canciones</span></article><article><strong>${profile.bestStreak}</strong><span>Mejor racha</span></article><article><strong>${rankName(profile.level)}</strong><span>Rango</span></article>`;$('#badges').innerHTML=achievements.map(a=>`<article class="badge ${profile.unlocked.includes(a.id)?'':'locked'}"><span>${a.icon}</span><b>${a.name}</b><small>${profile.unlocked.includes(a.id)?'Desbloqueada':'Bloqueada'}</small></article>`).join('')}
function renderEvents(){$('#eventList').innerHTML=[['🎸','Viernes de Rock','Gana 5000 puntos'],['💃','Eurodance Night','Responde 8 canciones'],['🇪🇸','Especial España','Próximamente'],['🌍','Campeonato mundial','Clasificación diaria']].map(x=>`<div class="list-item"><span>${x[0]}</span><div><b>${x[1]}</b><small>${x[2]}</small></div><button class="mini-button" data-mode="classic">Jugar</button></div>`).join('')}
function renderCollection(){const mastered=Math.min(tracks.length,Math.floor(profile.correct/4));$('#collectionGrid').innerHTML=tracks.map((t,i)=>{const unlocked=i<mastered,p=unlocked?Math.min(100,35+(profile.correct+i*7)%66):0;return `<article class="collection-card ${unlocked?'':'locked'}"><span class="cover">${t.icon}</span><b>${t.artist}</b><small>${t.genre} · Años ${t.decade}</small><div class="bar"><i style="width:${p}%"></i></div><small>${unlocked?p+'% dominio':'Sigue jugando para descubrir'}</small></article>`}).join('')}
function renderLeaderboard(){const players=[['LunaFM',18450],['RetroKing',17220],['CassetteGirl',15980],['Toni',profile.best],['NeonBeat',11740],['RockManía',10250],['VinylSoul',9750]].sort((a,b)=>b[1]-a[1]);$('#leaderboard').innerHTML=players.map((p,i)=>`<div class="rank-row ${p[0]==='Toni'?'me':''}"><b>${i+1}</b><div><strong>${p[0]}</strong><small>${p[0]==='Toni'?'Tú · '+rankName(profile.level):'Liga semanal'}</small></div><b>${p[1]}</b></div>`).join('')}
function renderCareer(){const stops=[['🎙️','Primer ensayo',1],['🍸','Pub musical',3],['🎸','Sala de conciertos',5],['🎧','Festival retro',8],['🏟️','Gran estadio',12],['🌍','Gira mundial',18]];$('#careerMap').innerHTML=stops.map(s=>`<article class="career-stop ${profile.level<s[2]?'locked':''}"><div class="career-icon">${s[0]}</div><div><b>${s[1]}</b><small>${profile.level>=s[2]?'Disponible':'Se desbloquea en nivel '+s[2]}</small></div>${profile.level>=s[2]?'<button class="mini-button" data-mode="classic">Jugar</button>':'🔒'}</article>`).join('')}
function renderShop(){$('#shopGrid').innerHTML=shopItems.map(x=>`<article class="shop-card"><span class="cover">${x.icon}</span><b>${x.name}</b><small>${profile.owned.includes(x.id)?'En tu colección':x.price+' monedas'}</small><button data-buy="${x.id}" ${profile.owned.includes(x.id)?'disabled':''}>${profile.owned.includes(x.id)?'Comprado':'Comprar'}</button></article>`).join('');$$('[data-buy]').forEach(b=>b.onclick=()=>{const item=shopItems.find(x=>x.id===b.dataset.buy);if(profile.coins<item.price)return toast('No tienes suficientes monedas');profile.coins-=item.price;profile.owned.push(item.id);save();renderShop();toast('Objeto comprado')})}
function fifty(){if(state.answered||state.power.fifty<=0)return;const wrong=$$('.answer-button').filter(b=>b.dataset.value!==answerField(state.current)&&!b.classList.contains('hidden-option'));shuffle(wrong).slice(0,2).forEach(b=>b.classList.add('hidden-option'));state.power.fifty--;$('#fiftyCount').textContent=state.power.fifty}
function replay(){if(state.answered||state.power.replay<=0||!state.preview)return;state.power.replay--;$('#replayCount').textContent=state.power.replay;playCurrent()}
function freeze(){if(state.answered||state.power.freeze<=0)return;state.duration+=3000;state.startedAt+=3000;state.power.freeze--;$('#freezeCount').textContent=state.power.freeze;toast('+3 segundos')}
renderModes();renderEvents();renderAll();
$$('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));document.addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(b)startGame(b.dataset.mode)});$('#playAgainButton').onclick=()=>startGame(state.mode);$('#quitGame').onclick=()=>{clearInterval(state.timerId);stopAudio();show('home')};$('#listenButton').onclick=playCurrent;$('#fiftyButton').onclick=fifty;$('#replayButton').onclick=replay;$('#freezeButton').onclick=freeze;$('#soundToggle').onclick=()=>{state.muted=!state.muted;profile.sound=!state.muted;if(state.muted)stopAudio();save()};$('#soundSetting').onchange=e=>{state.muted=!e.target.checked;profile.sound=e.target.checked;save()};$('#vibrationSetting').onchange=e=>{profile.vibration=e.target.checked;save()};$('#motionSetting').onchange=e=>{profile.motion=e.target.checked;save()};$('#contrastSetting').onchange=e=>{profile.contrast=e.target.checked;save()};$('#resetProgress').onclick=()=>{if(confirm('¿Seguro que quieres borrar todo el progreso local?')){profile={...defaultProfile};save();toast('Progreso restablecido')}};if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{})}
if('caches' in window){caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).catch(()=>{})}
console.info('DIME QUIEN CANTA REAL MUSIC BUILD 4.0 LOADED');
