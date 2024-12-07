document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const cursorModeToggle = document.getElementById('cursor-mode-toggle');
    const scoreDisplay = document.getElementById('score-display');
    const instructions = document.getElementById('instructions');
  
    let shipMode = true;
    let score = 0;
  
    menuToggle.addEventListener('click', () => mainNav.classList.toggle('hidden'));
  
    cursorModeToggle.addEventListener('click', () => {
      shipMode = !shipMode;
      cursorModeToggle.textContent = `Cursor: ${shipMode ? 'Ship' : 'Default'}`;
      document.body.style.cursor = shipMode?'none':'auto';
      if (!shipMode) {
        ufos = [];
        bullets = [];
        particles = [];
        score = 0;
        scoreDisplay.classList.add('hidden');
        instructions.classList.add('hidden');
        cursorImg.style.display='none';
      } else {
        scoreDisplay.textContent = `Score: ${score}`;
        scoreDisplay.classList.remove('hidden');
        instructions.classList.remove('hidden');
        cursorImg.style.display='block';
      }
    });
  
    const cursorImg = document.createElement('img');
    cursorImg.src='icons/ship.png';
    cursorImg.style.position='fixed';
    cursorImg.style.zIndex='9999';
    cursorImg.style.pointerEvents='none';
    cursorImg.classList.add('ship-cursor');
    document.body.appendChild(cursorImg);
  
    let lastMouseX=null, lastMouseY=null, shipAngle=0;
    let particles=[];
    let emittingParticles=false;
  
    function handlePointerMove(x,y){
      if(!shipMode)return;
      if(lastMouseX!==null && lastMouseY!==null){
        const dx=x-lastMouseX;
        const dy=y-lastMouseY;
        if(dx!==0||dy!==0){
          const angleRad=Math.atan2(dy,dx);
          let angleDeg=(angleRad*180/Math.PI)+90;
          angleDeg=(angleDeg+360)%360;
          shipAngle=angleDeg;
          emittingParticles=true;
        }
        cursorImg.style.top=`${y}px`;
        cursorImg.style.left=`${x}px`;
        cursorImg.style.transform=`translate(-50%,-50%) rotate(${shipAngle}deg)`;
      }
      lastMouseX=x; lastMouseY=y;
    }
  
    document.addEventListener('mousemove',(e)=>{
      if(shipMode) handlePointerMove(e.clientX,e.clientY);
    });
    document.addEventListener('touchmove',(e)=>{
      if(shipMode && e.touches.length>0){
        const t=e.touches[0];
        handlePointerMove(t.clientX,t.clientY);
      }
    },{passive:true});
  
    const canvas=document.getElementById('bg-canvas');
    const ctx=canvas.getContext('2d');
    function resizeCanvas(){canvas.width=window.innerWidth; canvas.height=window.innerHeight;}
    window.addEventListener('resize',resizeCanvas);
    resizeCanvas();
  
    let stars=[];
    const numStars=150;
    function createStars(){
      stars=[];
      for(let i=0;i<numStars;i++){
        stars.push({
          x:Math.random()*canvas.width,
          y:Math.random()*canvas.height,
          speed:0.5+Math.random()*1.5,
          size:Math.random()*2
        });
      }
    }
    createStars();
  
    const accentColors=['#66fcf1','#45a29e','#c5c6c7','#19f9d8','#50fa7b','#8be9fd','#bd93f9','#f1fa8c','#ff79c6','#ffb86c'];
    const randomAccent=accentColors[Math.floor(Math.random()*accentColors.length)];
    document.documentElement.style.setProperty('--accent-color',randomAccent);
  
    let bullets=[];
    document.addEventListener('click',()=>{
      if(!shipMode||lastMouseX===null||lastMouseY===null)return;
      bullets.push({x:lastMouseX,y:lastMouseY,angle:shipAngle,speed:10});
    });
  
    function addScore(points,x,y){
      score+=points;
      if(shipMode) scoreDisplay.textContent=`Score: ${score}`;
      const plus=document.createElement('div');
      plus.textContent=`+${points}`;
      plus.style.position='fixed';
      plus.style.left=`${x}px`;
      plus.style.top=`${y}px`;
      plus.style.transform='translate(-50%,-50%)';
      plus.style.color='var(--accent-color)';
      plus.style.fontWeight='bold';
      plus.style.zIndex='9999';
      plus.style.transition='opacity 0.5s, transform 0.5s';
      document.body.appendChild(plus);
      requestAnimationFrame(()=>{
        plus.style.opacity='0';
        plus.style.transform='translate(-50%,-100%)';
      });
      setTimeout(()=>plus.remove(),500);
    }
  
    let ufos=[];
    let nextUfoTime=performance.now()+2000;
    function spawnUfo(){
      if(ufos.length>=2||!shipMode)return;
      let spawnX,spawnY;
      const edge=Math.floor(Math.random()*4);
      if(edge===0){spawnX=Math.random()*canvas.width;spawnY=-50;}
      else if(edge===1){spawnX=canvas.width+50;spawnY=Math.random()*canvas.height;}
      else if(edge===2){spawnX=Math.random()*canvas.width;spawnY=canvas.height+50;}
      else {spawnX=-50;spawnY=Math.random()*canvas.height;}
  
      const targetX=canvas.width/2,targetY=canvas.height/2;
      const dx=targetX-spawnX, dy=targetY-spawnY;
      const dist=Math.sqrt(dx*dx+dy*dy);
      const vx=(dx/dist)*1.5, vy=(dy/dist)*1.5;
  
      const domeColor=accentColors[Math.floor(Math.random()*accentColors.length)];
      const baseColor=accentColors[Math.floor(Math.random()*accentColors.length)];
  
      ufos.push({x:spawnX,y:spawnY,vx,vy,domeColor,baseColor});
    }
  
    function createParticle(x,y,angle){
      const behindAngle=angle+180;
      const rad=behindAngle*Math.PI/180;
      const speed=(Math.random()*0.5)+0.5;
      particles.push({x:x,y:y,vx:Math.cos(rad)*speed,vy:Math.sin(rad)*speed,life:1.0});
    }
  
    if(document.title.includes('Community Board')){
      setupWhiteboardAndChat();
    }
  
    function setupWhiteboardAndChat(){
      const usernameInput=document.getElementById('username');
      const drawColorInput=document.getElementById('draw-color');
      const clearBoardBtn=document.getElementById('clear-board');
      const saveBoardBtn=document.getElementById('save-board');
      const chatMessagesDiv=document.getElementById('chat-messages');
      const chatInput=document.getElementById('chat-input');
      const chatSend=document.getElementById('chat-send');
      const whiteboard=document.getElementById('whiteboard');
      const chatFontSelect=document.getElementById('chat-font');
      const chatColorInput=document.getElementById('chat-color');
  
      let userName=localStorage.getItem('cb_username')||('Guest'+Math.floor(Math.random()*1000));
      usernameInput.value=userName;
      let chatLog=JSON.parse(localStorage.getItem('cb_chat')||'[]');
      let boardData=localStorage.getItem('cb_board');
  
      usernameInput.addEventListener('change',()=>{
        userName=usernameInput.value;
        localStorage.setItem('cb_username',userName);
      });
  
      const wbCtx=whiteboard.getContext('2d');
      wbCtx.fillStyle='#111';
      wbCtx.fillRect(0,0,whiteboard.width,whiteboard.height);
  
      if(boardData){
        const img=new Image();
        img.src=boardData;
        img.onload=()=>{wbCtx.drawImage(img,0,0);};
      }
  
      let drawing=false;
      whiteboard.addEventListener('mousedown',(e)=>{
        drawing=true; drawDot(e);
      });
      whiteboard.addEventListener('mouseup',()=>{drawing=false;});
      whiteboard.addEventListener('mousemove',(e)=>{
        if(drawing) drawDot(e);
      });
  
      whiteboard.addEventListener('touchstart',(e)=>{
        if(e.touches.length==1){
          drawing=true; drawDot(e.touches[0]);
        }
      },{passive:true});
      whiteboard.addEventListener('touchend',()=>{drawing=false;},{passive:true});
      whiteboard.addEventListener('touchmove',(e)=>{
        if(drawing) drawDot(e.touches[0]);
      },{passive:true});
  
      function drawDot(evt){
        const rect=whiteboard.getBoundingClientRect();
        const x=evt.clientX-rect.left;
        const y=evt.clientY-rect.top;
        wbCtx.fillStyle=drawColorInput.value;
        wbCtx.beginPath();
        wbCtx.arc(x,y,2,0,Math.PI*2);
        wbCtx.fill();
      }
  
      clearBoardBtn.addEventListener('click',()=>{
        wbCtx.fillStyle='#111';
        wbCtx.fillRect(0,0,whiteboard.width,whiteboard.height);
      });
  
      saveBoardBtn.addEventListener('click',()=>{
        const data=whiteboard.toDataURL();
        localStorage.setItem('cb_board',data);
        localStorage.setItem('cb_chat',JSON.stringify(chatLog));
        localStorage.setItem('cb_username',userName);
      });
  
      function renderChat(){
        chatMessagesDiv.innerHTML='';
        chatLog.forEach(msg=>{
          const div=document.createElement('div');
          div.classList.add('chat-msg');
          div.innerHTML=`<span>${msg.name}:</span> ${msg.text}`;
          div.style.fontFamily=msg.font;
          div.style.color=msg.color;
          chatMessagesDiv.appendChild(div);
        });
        chatMessagesDiv.scrollTop=chatMessagesDiv.scrollHeight;
      }
      renderChat();
  
      function sendChat(){
        const text=chatInput.value.trim();
        if(!text)return;
        const fontChoice=chatFontSelect.value;
        const textColor=chatColorInput.value;
        chatLog.push({name:userName,text, font:fontChoice, color:textColor});
        localStorage.setItem('cb_chat',JSON.stringify(chatLog));
        chatInput.value='';
        renderChat();
      }
  
      chatSend.addEventListener('click',sendChat);
      chatInput.addEventListener('keydown',(e)=>{if(e.key==='Enter')sendChat();});
    }
  
    function updateParticles(dt){
      if(shipMode && emittingParticles && lastMouseX!==null && lastMouseY!==null){
        for(let i=0;i<3;i++){
          createParticle(lastMouseX,lastMouseY,shipAngle);
        }
      } else {
        emittingParticles=false;
      }
  
      for(let i=particles.length-1;i>=0;i--){
        const p=particles[i];
        p.x+=p.vx; p.y+=p.vy;
        p.life-=dt*0.5;
        if(p.life<=0) particles.splice(i,1);
      }
    }
  
    function updateBullets(dt){
      for(let i=bullets.length-1;i>=0;i--){
        const b=bullets[i];
        const rad=(b.angle-90)*Math.PI/180;
        b.x+=Math.cos(rad)*b.speed;
        b.y+=Math.sin(rad)*b.speed;
        if(b.x<0||b.x>canvas.width||b.y<0||b.y>canvas.height) {
          bullets.splice(i,1);
        }
      }
    }
  
    function updateUfos(dt){
      if(shipMode && performance.now()>nextUfoTime){
        spawnUfo();
        nextUfoTime=performance.now()+3000;
      }
      for(let i=ufos.length-1;i>=0;i--){
        const u=ufos[i];
        u.x+=u.vx; u.y+=u.vy;
        for(let j=bullets.length-1;j>=0;j--){
          const b=bullets[j];
          const dx=u.x-b.x; const dy=u.y-b.y;
          const dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<20){
            ufos.splice(i,1);
            bullets.splice(j,1);
            addScore(50,u.x,u.y);
            break;
          }
        }
        if(u.x<-100||u.x>canvas.width+100||u.y<-100||u.y>canvas.height+100){
          ufos.splice(i,1);
        }
      }
    }
  
    let ufos=[];
    let lastTime=performance.now();
    function animate(){
      const now=performance.now();
      const dt=(now-lastTime)/1000;
      lastTime=now;
  
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='white';
      stars.forEach(star=>{
        star.y+=star.speed;
        if(star.y>canvas.height){star.y=0; star.x=Math.random()*canvas.width;}
        ctx.fillRect(star.x,star.y,star.size,star.size);
      });
  
      if(shipMode){
        updateParticles(dt);
        updateBullets(dt);
        updateUfos(dt);
  
        for(const p of particles){
          ctx.fillStyle=`rgba(102,252,241,${p.life})`;
          ctx.fillRect(p.x,p.y,2,2);
        }
  
        ctx.fillStyle='white';
        for(const b of bullets){
          ctx.save();
          ctx.translate(b.x,b.y);
          ctx.rotate((b.angle)*Math.PI/180);
          ctx.fillRect(-2,-2,4,4);
          ctx.restore();
        }
  
        for(const u of ufos){
          ctx.save();
          ctx.translate(u.x,u.y);
          ctx.fillStyle=u.baseColor;
          ctx.beginPath();
          ctx.ellipse(0,0,20,10,0,0,Math.PI*2);
          ctx.fill();
          ctx.fillStyle=u.domeColor;
          ctx.beginPath();
          ctx.ellipse(0,-5,10,8,0,0,Math.PI*2);
          ctx.fill();
          ctx.restore();
        }
  
        instructions.classList.remove('hidden');
        scoreDisplay.classList.remove('hidden');
      } else {
        instructions.classList.add('hidden');
        scoreDisplay.classList.add('hidden');
      }
  
      requestAnimationFrame(animate);
    }
  
    animate();
  });
  