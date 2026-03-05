'use strict';

/* ── TERMINAL TYPEWRITER ── */
(()=>{
  const lines=[
    {h:'<span class="tp">simon@techtools</span><span class="tdim">:~/portfolio$</span> <span class="tc">whoami</span>'},
    {h:'<span class="tok">Simon Novak — FullStack Dev & Tech Lead @ TechTools</span>',d:350},
    {h:''},
    {h:'<span class="tp">simon@techtools</span><span class="tdim">:~/portfolio$</span> <span class="tc">cat stack.json</span>'},
    {h:'<span class="tk">{</span>',d:280},
    {h:'  <span class="ts">"frontend"</span>: [<span class="ts">"Vue.js"</span>, <span class="ts">"React"</span>, <span class="ts">"HTML/CSS"</span>],',d:90},
    {h:'  <span class="ts">"db"</span>: [<span class="ts">"MSSQL"</span>, <span class="ts">"MySQL"</span>],',d:90},
    {h:'  <span class="ts">"years"</span>: <span class="tn">7</span>,',d:90},
    {h:'  <span class="ts">"open_to_collaboration"</span>: <span class="tok">true</span>',d:90},
    {h:'<span class="tk">}</span>',d:90},
    {h:''},
    {h:'<span class="tp">simon@techtools</span><span class="tdim">:~/portfolio$</span> <span class="tc">./run portfolio.sh</span>'},
    {h:'<span class="tok">✓ Loading modules...</span>',d:480},
    {h:'<span class="tok">✓ Animations initialized</span>',d:180},
    {h:'<span class="tok">✓ Portfolio is live — enjoy!</span>',d:180},
    {h:''},
  ];
  const body=document.getElementById('tbody');
  const tout=document.getElementById('toutput');
  if(!body||!tout)return;
  let acc=500;
  lines.forEach(line=>{
    acc+=(line.d||150);
    setTimeout(()=>{
      const p=document.createElement('p');p.className='tline';p.innerHTML=line.h;
      tout.appendChild(p);body.scrollTop=body.scrollHeight;
    },acc);
  });
})();

/* ── TERMINAL SHELL — FULL APP ── */
(()=>{
  const input   = document.getElementById('tinput');
  const output  = document.getElementById('toutput');
  const prompt  = document.getElementById('tprompt');
  const cwrap   = document.getElementById('tcanvas-wrap');
  const canvas  = document.getElementById('tcanvas');
  const chint   = document.getElementById('tcanvas-hint');
  const tbody   = document.getElementById('tbody');
  if(!input||!output)return;

  /* ── state ── */
  let cmdHistory=[],histIdx=-1,activeGame=null,gameLoop=null;
  const g=s=>`<span style="color:#22c55e">${s}</span>`;
  const b=s=>`<span style="color:#82aaff">${s}</span>`;
  const y=s=>`<span style="color:#eab308">${s}</span>`;
  const r=s=>`<span style="color:#ef4444">${s}</span>`;
  const c=s=>`<span style="color:#06b6d4">${s}</span>`;
  const p=s=>`<span style="color:#c792ea">${s}</span>`;
  const dim=s=>`<span style="color:#5a6a8a">${s}</span>`;

  function addLine(html,delay=0){
    return new Promise(res=>setTimeout(()=>{
      const el=document.createElement('p');
      el.innerHTML=html;output.appendChild(el);
      tbody.scrollTop=tbody.scrollHeight;
      res();
    },delay));
  }
  function clearOut(){output.innerHTML='';hideCanvas()}
  function showCanvas(){cwrap.style.display='block'}
  function hideCanvas(){cwrap.style.display='none';if(gameLoop){clearInterval(gameLoop);gameLoop=null}if(activeGame){activeGame=null}}
  function setPrompt(txt){prompt.textContent=txt||'simon@techtools:~$'}
  function stopGame(){if(activeGame){activeGame.stop&&activeGame.stop();activeGame=null}if(gameLoop){clearInterval(gameLoop);gameLoop=null}hideCanvas();setPrompt()}

  /* ── ascii art ── */
  const SIMON_ASCII=`
 ██████╗ ██╗███╗   ███╗ ██████╗ ███╗   ██╗
 ██╔════╝ ██║████╗ ████║██╔═══██╗████╗  ██║
 ███████╗ ██║██╔████╔██║██║   ██║██╔██╗ ██║
 ╚════██║ ██║██║╚██╔╝██║██║   ██║██║╚██╗██║
 ███████║ ██║██║ ╚═╝ ██║╚██████╔╝██║ ╚████║
 ╚══════╝ ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝`;

  /* ── COMMANDS MAP ── */
  const CMDS={

    /* basics */
    'help':{desc:'Show available commands',async fn(){
      const cats={
        '📂 System':['whoami','id','hostname','uname -a','uptime','date','time','pwd','env','ps','top','df','free','history','echo [text]','clear'],
        '📁 Files':['ls','ls -la','ls -lh','cat skills.txt','cat readme.md','cat .secrets','cat projects.json','cat package.json','file index.html','wc skills.txt'],
        '🌐 Network':['ping snovak.cz','curl snovak.cz','ifconfig','netstat','traceroute 8.8.8.8','wget https://example.com','nmap localhost'],
        '🧮 Tools':['calc [expr]','base64 [text]','rot13 [text]','hash [text]','sort skills','uniq','grep [pattern]','wc [text]','sed','awk'],
        '👨‍💻 Dev':['git log','git status','git branch','git diff','npm start','npm install','docker ps','docker images','make','./run portfolio.sh','./deploy.sh','python3','node'],
        '🎮 Games':['snake','tetris','pong','2048','guess','quiz','rps [rock/scissors/paper]','lottery','hack','mine [x] [y]'],
        '🎨 Fun':['matrix','ascii','cowsay [text]','figlet [text]','fortune','joke','quote','weather','sl','yes [text]','lolcat','neofetch','motd'],
        '🔐 Easter eggs':['sudo rm -rf /',':(){ :|:& };:','exit','reboot','shutdown now','cat /dev/urandom','./run portfolio.sh','konami'],
      };
      addLine(g('┌─ AVAILABLE COMMANDS ───────────────────────────┐'));
      for(const[cat,cmds] of Object.entries(cats)){
        await addLine(`${y(cat)}`);
        addLine(dim('  ')+cmds.map(c=>`<span style="color:#82aaff">${c}</span>`).join(dim(' · ')));
      }
      addLine(g('└────────────────────────────────────────────────┘'));
      addLine(dim('Tip: up/down arrows = command history | Tab = autocomplete'));
    }},

    'whoami':{desc:'Identity',fn(){addLine(g('simon novak')+dim(' — ')+c('fullstack dev')+dim(' · ')+p('tech lead @ techtools')+dim(' · ')+y('builder'))}},

    'id':{fn(){addLine(`uid=1000${dim('(')}${g('simon')}${dim(')')} gid=1000${dim('(')}${g('developers')}${dim(')')} groups=1000,27${dim('(')}${g('sudo')}${dim(')')},1001${dim('(')}${p('tech-lead')}${dim(')')}`)}},

    'hostname':{fn(){addLine(b('techtools-workstation.snovak.cz'))}},

    'uname -a':{fn(){addLine(b('Linux techtools 6.9.0-simon #1 SMP PREEMPT Developer x86_64 GNU/Linux'))}},

    'uptime':{fn(){
      const days=Math.floor((Date.now()-new Date('2016-06-01'))/864e5);
      addLine(g(` ${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}:${String(new Date().getSeconds()).padStart(2,'0')}`)+
        dim(' up ')+y(days+' days')+dim(', load avg: ')+g('0.42 0.38 0.31'));
    }},

    'date':{fn(){addLine(c(new Date().toLocaleString('cs-CZ',{weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'})))}},

    'time':{fn(){addLine(g('real\t0m0.001s\nuser\t0m0.000s\nsys \t0m0.001s'))}},

    'pwd':{fn(){addLine(b('/home/simon/portfolio'))}},

    'env':{fn(){
      ['USER=simon','HOME=/home/simon','SHELL=/bin/zsh','LANG=cs_CZ.UTF-8','EDITOR=code',
       'NODE_ENV=production','DOTNET_ROOT=/usr/share/dotnet','JAVA_HOME=/usr/lib/jvm/java-21',
       'PATH=/usr/local/sbin:/usr/local/bin:/usr/bin','PS1=simon@techtools:~$'].forEach(l=>addLine(dim(l.split('=')[0]+'=')+g(l.split('=').slice(1).join('='))));
    }},

    'ps':{fn(){
      addLine(y('  PID TTY          TIME CMD'));
      [['1337','pts/0','00:00:00','bash'],['1338','pts/0','00:00:01','node server.js'],
       ['1339','pts/0','00:00:03','dotnet Portfolio.dll'],['1340','pts/0','00:00:00','python3 ai.py'],
       ['1341','pts/0','00:00:00','ps']].forEach(([pid,tty,t,cmd])=>
        addLine(`${b(pid.padStart(5))} ${dim(tty.padEnd(12))} ${dim(t)} ${g(cmd)}`));
    }},

    'top':{async fn(){
      addLine(y('Tasks: 4 running, 42 sleeping, 0 stopped'));
      addLine(y('%Cpu(s):')+g(' 12.4')+dim(' us,')+g(' 3.2')+dim(' sy,')+g(' 0.0')+dim(' ni,')+g(' 83.1')+dim(' id'));
      addLine(y('MiB Mem:')+g(' 32768.0 total,')+g(' 18234.2 free,')+g(' 8192.0 used'));
      addLine('');
      addLine(dim('  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND'));
      [['1338','simon','20','0','512m','128m','64m','R','12.4','0.4','1:23.45','node'],
       ['1339','simon','20','0','1.2g','256m','32m','S','8.1','0.8','5:12.01','dotnet'],
       ['1340','simon','20','0','384m','96m','48m','S','2.3','0.3','0:45.12','python3']].forEach(row=>
        addLine(`${b(row[0].padStart(5))} ${g(row[1].padEnd(9))} ${dim(row.slice(2,10).join('  '))} ${c(row[10])} ${y(row[11])}`));
    }},

    'df':{fn(){
      addLine(y('Filesystem      Size  Used Avail Use% Mounted on'));
      [['/dev/nvme0n1p2','1.8T','234G','1.5T','14%','/'],
       ['tmpfs','16G','2.1M','16G','1%','/tmp'],
       ['/dev/sdb1','2.0T','890G','1.1T','45%','/data']].forEach(([fs,s,u,a,p,m])=>
        addLine(`${b(fs.padEnd(16))}${dim(s.padEnd(6))}${dim(u.padEnd(6))}${g(a.padEnd(6))}${y(p.padEnd(5))}${c(m)}`));
    }},

    'free':{fn(){
      addLine(y('              total        used        free      shared  buff/cache   available'));
      addLine('Mem:    '+['32768','8192','18234','512','6342','23844'].map(n=>g(n.padStart(10))).join(''));
      addLine('Swap:   '+['8192','0','8192'].map(n=>g(n.padStart(10))).join(''));
    }},

    'history':{fn(){
      ['whoami','ls -la','cat skills.txt','git log','npm start','./run portfolio.sh',
       'docker ps','python3 train.py','vim config.yml','sudo apt upgrade','git push origin main',
       'ssh deploy@snovak.cz','htop','neofetch','matrix'].forEach((cmd,i)=>
        addLine(`${dim((i+1+'').padStart(4))}  ${g(cmd)}`));
    }},

    'echo':{fn(args){addLine(g(args||''))}},

    'ls':{fn(){addLine(b('hero/')+dim('  ')+b('about/')+dim('  ')+b('experience/')+dim('  ')+b('projects/')+dim('  ')+b('contact/')+dim('  ')+g('cv.pdf')+dim('  ')+g('index.html')+dim('  ')+g('send_email.php'))}},

    'ls -la':{fn(){
      addLine(dim('total 128'));
      [['drwxr-xr-x','simon','simon','4096','hero/'],
       ['drwxr-xr-x','simon','simon','4096','about/'],
       ['drwxr-xr-x','simon','simon','4096','projects/'],
       ['-rw-r--r--','simon','simon','245120','cv.pdf'],
       ['-rw-r--r--','simon','simon','98342','index.html'],
       ['-rw-r--r--','simon','simon','4096','send_email.php'],
       ['-rw-------','root','root','512','.secrets'],
      ].forEach(([perm,u,g2,sz,name])=>
        addLine(`${dim(perm)} ${g(u.padEnd(7))} ${g(g2.padEnd(7))} ${y(sz.padStart(7))} ${name.startsWith('.')? r(name):name.endsWith('/')? b(name):g(name)}`));
    }},

    'ls -lh':{fn(){CMDS['ls -la'].fn()}},

    'cat skills.txt':{fn(){
      addLine(y('# Backend & Languages'));
      addLine(g('C#/.NET  JavaScript  Java  Python  Visual Basic'));
      addLine(y('# Frontend & Databases'));
      addLine(g('Vue.js  React  HTML5  CSS3  MySQL  MSSQL'));
      addLine(y('# DevOps & Tools'));
      addLine(g('Git  Docker  Linux  VS Code  Visual Studio'));
      addLine(y('# Networking'));
      addLine(g('TCP/IP  L2/L3  Routing  Optical Networks  CPE Config'));
    }},

    'cat readme.md':{fn(){
      addLine(p('# Šimon Novák — Portfolio'));
      addLine(dim(''));
      addLine(y('## Quick Facts'));
      addLine(g('- 7+ years coding experience'));
      addLine(g('- FullStack Developer @ Bata Group'));
      addLine(g('- Tech Lead @ TechTools s.r.o.'));
      addLine(g('- Based in Czech Republic'));
    }},

    'cat .secrets':{fn(){
      addLine(r('Permission denied: .secrets'));
      setTimeout(()=>addLine(y('[sudo] heslo pro simon: ')),400);
      setTimeout(()=>addLine(r('sudo: too many attempts')),1200);
      setTimeout(()=>addLine(dim('...nice try ;)')),1600);
    }},

    'cat projects.json':{fn(){
      ['{','  "projects": [',
       '    { "name": "VoidSharp",       "tech": "C#/.NET", "status": "open-source" },',
       '    { "name": "MagicOrbwalker",  "tech": "C#",      "status": "open-source" },',
       '    { "name": "TechTools Platform", "tech": ".NET+React", "status": "production" },',
       '    { "name": "Bata Storefront",    "tech": "SFCC+React", "status": "enterprise" }',
       '  ]','}'].forEach((l,i)=>setTimeout(()=>addLine(
        l.startsWith('{')||l.startsWith('}')? p(l):
        l.includes('"name"')? c(l):dim(l)),i*60));
    }},

    'cat package.json':{fn(){
      ['{\n  "name": "portfolio",','  "version": "3.1.4",','  "author": "Šimon Novák <sn@snovak.cz>",',
       '  "scripts": { "start": "serve .", "build": "webpack --mode prod" },',
       '  "stack": ["C#", ".NET", "Vue.js", "React", "JS", "Docker"],',
       '  "license": "MIT"','}'].forEach((l,i)=>setTimeout(()=>addLine(dim(l)),i*60));
    }},

    'file index.html':{fn(){addLine(b('index.html')+dim(': HTML document, Unicode text, UTF-8 text, with very long lines (23k)'))}},

    'wc skills.txt':{fn(){addLine(y('  42')+dim(' lines  ')+y('89')+dim(' words  ')+y('512')+dim(' characters  ')+b('skills.txt'))}},

    /* ── NETWORKING ── */
    'ping snovak.cz':{async fn(){
      addLine(c('PING snovak.cz (185.168.0.1): 56 data bytes'));
      for(let i=0;i<4;i++){
        await addLine(g(`64 bytes from 185.168.0.1: icmp_seq=${i} ttl=64 time=${(Math.random()*5+2).toFixed(2)} ms`),400*i+400);
      }
      setTimeout(()=>addLine(y('--- snovak.cz ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss')),1800);
    }},

    'curl snovak.cz':{fn(){
      ['HTTP/2 200','content-type: text/html; charset=UTF-8','server: nginx','x-powered-by: TechTools/3.0',
       '','<!DOCTYPE html>','<html lang="cs">','  <!-- Šimon Novák Portfolio -->','</html>'].forEach((l,i)=>
        setTimeout(()=>addLine(l.startsWith('H')? g(l):l.startsWith('<')? c(l):dim(l)),i*80));
    }},

    'ifconfig':{fn(){
      addLine(b('eth0: ') + dim('flags=4163<UP,BROADCAST,RUNNING,MULTICAST>'));
      addLine(dim('      inet ')+g('192.168.1.42')  +dim('  netmask 255.255.255.0  broadcast 192.168.1.255'));
      addLine(dim('      inet6 fe80::1  prefixlen 64'));
      addLine(b('lo:   ') + dim('flags=73<UP,LOOPBACK,RUNNING>'));
      addLine(dim('      inet ')+g('127.0.0.1')    +dim('  netmask 255.0.0.0'));
    }},

    'netstat':{fn(){
      addLine(y('Proto  Local Address          Foreign Address        State'));
      [['tcp','0.0.0.0:80','*:*','LISTEN'],['tcp','0.0.0.0:443','*:*','LISTEN'],
       ['tcp','192.168.1.42:52341','185.168.0.1:443','ESTABLISHED'],
       ['tcp','192.168.1.42:52342','8.8.8.8:53','TIME_WAIT']].forEach(row=>
        addLine(`${b(row[0].padEnd(7))}${g(row[1].padEnd(23))}${dim(row[2].padEnd(23))}${y(row[3])}`));
    }},

    'traceroute 8.8.8.8':{async fn(){
      addLine(c('traceroute to 8.8.8.8, 30 hops max'));
      const hops=['192.168.1.1','10.0.0.1','72.14.194.1','8.8.8.8'];
      for(let i=0;i<hops.length;i++){
        await addLine(` ${dim((i+1+'').padStart(2))}  ${g(hops[i].padEnd(18))} ${y((Math.random()*8+1).toFixed(2)+' ms')}`,500*i+400);
      }
    }},

    'wget https://example.com':{async fn(){
      addLine(c('--2025-02-25 12:00:00-- https://example.com'));
      await addLine(dim('Connecting to example.com... connected.'),300);
      await addLine(dim('HTTP request sent, awaiting response... '),600);
      await addLine(g('200 OK'),900);
      await addLine(dim('Length: 1256 [text/html]'),1100);
      await addLine(g("'index.html' saved [1256/1256]"),1400);
    }},

    'nmap localhost':{async fn(){
      addLine(c('Starting Nmap 7.94 ( https://nmap.org )'));
      await addLine(dim('Nmap scan report for localhost (127.0.0.1)'),400);
      await addLine(dim('Host is up (0.000077s latency).'),600);
      await addLine(y('PORT     STATE SERVICE'),900);
      for(const[port,svc] of [['80/tcp','http'],['443/tcp','https'],['3000/tcp','node'],['5000/tcp','dotnet'],['8080/tcp','java']]){
        await addLine(g(port.padEnd(9))+dim('open  ')+c(svc),1000+Math.random()*400);
      }
    }},

    /* ── TOOLS ── */
    'calc':{fn(args){
      if(!args){addLine(dim('Usage: calc 2+2'));return}
      try{
        const safe=args.replace(/[^0-9+\-*/.() ]/g,'');
        // eslint-disable-next-line no-new-func
        const res=Function('"use strict";return ('+safe+')')();
        addLine(`${dim(args+'  =')}  ${g(res)}`);
      }catch{addLine(r('Invalid expression'))}
    }},

    'base64':{fn(args){
      if(!args){addLine(dim('Usage: base64 hello world'));return}
      addLine(g(btoa(unescape(encodeURIComponent(args)))));
    }},

    'rot13':{fn(args){
      if(!args){addLine(dim('Usage: rot13 hello'));return}
      addLine(g(args.replace(/[a-zA-Z]/g,c=>{const b=c<='Z'?65:97;return String.fromCharCode((c.charCodeAt(0)-b+13)%26+b)})));
    }},

    'hash':{fn(args){
      if(!args){addLine(dim('Usage: hash mytext'));return}
      let h=5381;for(let i=0;i<args.length;i++)h=((h<<5)+h)+args.charCodeAt(i);
      const hex=(h>>>0).toString(16).padStart(8,'0');
      addLine(y('djb2:  ')+g(hex));
      addLine(y('len:   ')+g(args.length));
      addLine(y('bytes: ')+g(new TextEncoder().encode(args).length));
    }},

    'sort skills':{fn(){
      const s=['C#','Java','Python','JavaScript','HTML','CSS','MySQL','Docker','Git','Linux'];
      addLine(g([...s].sort().join('  ')));
    }},

    'grep':{fn(args){
      if(!args){addLine(dim('Usage: grep dotnet'));return}
      const db=['C#/.NET — main language','Java Spring Boot','Python ML scripts','JavaScript frontend',
                'Docker containers','dotnet CLI','MSSQL database','Git version control'];
      const hits=db.filter(l=>l.toLowerCase().includes(args.toLowerCase()));
      if(hits.length) hits.forEach(h=>addLine(h.replace(new RegExp(args,'gi'),m=>`<span style="color:#ef4444;font-weight:700">${m}</span>`)));
      else addLine(dim(`Nothing found for "${args}"`));
    }},

    /* ── GIT ── */
    'git log':{fn(){
      const commits=[
        ['a1b2c3d','feat: add terminal easter egg system','2025-02-25'],
        ['e4f5a6b','fix: mobile drawer visible on desktop','2025-02-20'],
        ['c7d8e9f','feat: redesign header with gradient logo','2025-02-18'],
        ['f1a2b3c','feat: add social icons with inline SVG','2025-02-15'],
        ['d4e5f6a','refactor: horizontal slide → vertical SPA','2025-02-10'],
        ['b7c8d9e','feat: initial portfolio SPA','2025-02-01'],
        ['a0b1c2d','init: project structure','2024-12-01'],
      ];
      commits.forEach(([hash,msg,date])=>
        addLine(`${y('commit ')+g(hash)}\n${dim('Date:   '+date)}\n\n    ${c(msg)}\n`));
    }},

    'git status':{fn(){
      addLine(b('On branch main'));
      addLine(g('Your branch is up to date with ')+c("'origin/main'"));
      addLine('');
      addLine(y('Changes not staged for commit:'));
      addLine(r('  modified:   index.html'));
      addLine(r('  modified:   send_email.php'));
      addLine('');
      addLine(dim('no changes added to commit (use "git add" and/or "git commit -a")'));
    }},

    'git branch':{fn(){
      ['* main','  develop','  feature/terminal-upgrade','  hotfix/mobile-menu'].forEach(b2=>
        addLine(b2.startsWith('*')? g(b2):dim(b2)));
    }},

    'git diff':{fn(){
      addLine(y('diff --git a/index.html b/index.html'));
      addLine(dim('index a1b2c3d..e4f5a6b 100644'));
      addLine(dim('--- a/index.html'));
      addLine(dim('+++ b/index.html'));
      addLine(dim('@@ -1140,8 +1140,80 @@'));
      addLine(g('+  // massive terminal upgrade'));
      addLine(g('+  // 50+ commands, minigames, easter eggs'));
      addLine(r('-  // old basic terminal'));
    }},

    'npm start':{async fn(){
      addLine(g('> portfolio@3.1.4 start'));
      addLine(g('> serve .'));
      await addLine(dim('INFO: Accepting connections at http://localhost:3000'),500);
      addLine(g('✓ Server running!'),800);
    }},

    'npm install':{async fn(){
      addLine(dim('npm warn deprecated ...'));
      await addLine(dim('added 1337 packages in 2.042s'),800);
      addLine(g('✓ 1337 packages installed.'));
    }},

    'docker ps':{fn(){
      addLine(y('CONTAINER ID   IMAGE              COMMAND           STATUS          PORTS'));
      [['a1b2c3d4e5','portfolio:latest','serve .',        'Up 2 days','80->3000/tcp'],
       ['f6a7b8c9d0','nginx:alpine',   'nginx -g ...',   'Up 3 days','443->443/tcp'],
       ['1e2f3a4b5c','mysql:8.0',      'mysqld',         'Up 3 days','3306/tcp'],
      ].forEach(([id,img,cmd,status,ports])=>
        addLine(`${g(id)}   ${b(img.padEnd(19))}${dim(cmd.padEnd(17))}${g(status.padEnd(16))}${c(ports)}`));
    }},

    'docker images':{fn(){
      addLine(y('REPOSITORY         TAG      IMAGE ID       CREATED       SIZE'));
      [['portfolio','latest','a1b2c3d','2 days ago','128MB'],
       ['nginx','alpine','f1a2b3c','1 week ago','41MB'],
       ['mysql','8.0','c3d4e5f','2 weeks ago','594MB']].forEach(([r2,t,id,c2,s])=>
        addLine(`${b(r2.padEnd(19))}${dim(t.padEnd(9))}${g(id.padEnd(15))}${dim(c2.padEnd(14))}${y(s)}`));
    }},

    'make':{async fn(){
      for(const step of ['Compiling source files...','Linking objects...','Optimizing output...','Build complete.']){
        await addLine(step===step.match(/[A-Z].*\./)? g('✓ '+step):dim(step),300);
      }
    }},

    './deploy.sh':{async fn(){
      addLine(c('[deploy.sh] Starting deployment...'));
      const steps=[
        ['Building Docker image...','✓ Image built'],
        ['Running tests...','✓ 47/47 tests passed'],
        ['Pushing to registry...','✓ Image pushed'],
        ['Deploying to production...','✓ Deployed'],
        ['Running health check...','✓ snovak.cz is live!'],
      ];
      let delay=200;
      for(const[s,ok] of steps){
        await addLine(dim(s),delay);
        await addLine(g(ok),delay+350);
        delay+=650;
      }
    }},

    './run portfolio.sh':{async fn(){
      addLine(g('$ ./run portfolio.sh'));
      const steps=[
        [480,'[INFO] Initializing .NET runtime...'],
        [180,'[INFO] Loading modules: hero, about, experience, projects, contact'],
        [160,'[INFO] Starting particle engine: 55 nodes'],
        [160,'[INFO] Binding scroll observers...'],
        [120,'[OK]   Compiled in 0.042s'],
        [120,'[OK]   Animations: particle engine, reveal, carousels, terminal'],
        [200,'[DONE] Portfolio is live at snovak.cz ✓'],
      ];
      let d=0;
      for(const[delay,msg] of steps){
        d+=delay;
        await addLine(msg.startsWith('[DONE]')? g(msg):msg.startsWith('[OK]')? b(msg):y(msg),d);
      }
    }},

    'python3':{fn(){
      addLine(c('Python 3.12.0 (main, Feb 2025)'));
      addLine(dim('>>> ') + g('print("Hello from Simon!")'));
      addLine(g('Hello from Simon!'));
      addLine(dim('>>> ') + g('2 ** 10'));
      addLine(g('1024'));
      addLine(dim('>>> exit()'));
    }},

    'node':{fn(){
      addLine(c('Welcome to Node.js v22.0.0.'));
      addLine(dim('> ') + g("console.log('TechTools Node server')"));
      addLine(g('TechTools Node server'));
      addLine(dim('> ') + g('[1,2,3].map(x => x * x)'));
      addLine(g('[ 1, 4, 9 ]'));
      addLine(dim('> .exit'));
    }},

    /* ── FUN / EASTER EGG ── */
    'neofetch':{fn(){
      addLine(`<span class="ascii-art">${[
        '     /\\     ',
        '    /  \\    ',
        '   / /\\ \\   ',
        '  / ____ \\  ',
        ' /_/    \\_\\ ',
      ].join('\n')}</span>`);
      addLine(g('simon@techtools'));
      addLine(dim('-'.repeat(30)));
      addLine(y('OS:     ')+g('Arch Linux x86_64'));
      addLine(y('Host:   ')+g('TechTools Workstation'));
      addLine(y('Kernel: ')+g('6.9.0-simon'));
      addLine(y('Shell:  ')+g('zsh 5.9'));
      addLine(y('Editor: ')+g('VS Code 1.88'));
      addLine(y('CPU:    ')+g('AMD Ryzen 9 7950X (32) @ 5.7GHz'));
      addLine(y('GPU:    ')+g('NVIDIA GeForce RTX 4090'));
      addLine(y('Memory: ')+g('32768 MiB / 32768 MiB'));
      addLine(y('Uptime: ')+g(`${Math.floor((Date.now()-new Date('2016-06-01'))/864e5)} days`));
    }},

    'motd':{fn(){
      addLine(p('╔══════════════════════════════════════════╗'));
      addLine(p('║  ')+g('Welcome to TechTools Terminal v3.0   ')+p('  ║'));
      addLine(p('║  ')+c('Built with ❤ by Simon Novak           ')+p('  ║'));
      addLine(p('║  ')+y('Type "help" for available commands    ')+p('  ║'));
      addLine(p('╚══════════════════════════════════════════╝'));
    }},

    'ascii':{fn(){
      addLine(`<span class="ascii-art" style="color:#c792ea">${SIMON_ASCII}</span>`);
    }},

    'cowsay':{fn(args){
      const text=args||'Moo! I am Simon!';
      const w=text.length+2;
      const top=' '+'-'.repeat(w)+' ';
      addLine(dim(top)+'\n< '+g(text)+' >\n'+dim(' '+'-'.repeat(w)));
      addLine(dim("        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||"));
    }},

    'figlet':{fn(args){
      const text=args||'SIMON';
      addLine(p(`[FIGLET] ${text}`));
      addLine(`<span class="ascii-art" style="font-size:.55rem;color:#82aaff">${SIMON_ASCII}</span>`);
    }},

    'fortune':{fn(){
      const quotes=[
        '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — M. Fowler',
        '"First, solve the problem. Then, write the code." — John Johnson',
        '"Code is like humor. When you have to explain it, it\'s bad." — Cory House',
        '"Simplicity is the soul of efficiency." — Austin Freeman',
        '"The best error message is the one that never shows up." — Thomas Fuchs',
        '"Programs must be written for people to read, and only incidentally for machines to execute." — Abelson',
        '"Make it work, make it right, make it fast." — Kent Beck',
        '"Talk is cheap. Show me the code." — Linus Torvalds',
      ];
      addLine(y(quotes[Math.floor(Math.random()*quotes.length)]));
    }},

    'joke':{fn(){
      const jokes=[
        'Why do programmers wear glasses? Because they can\'t C#.',
        'Boss: Send me an email of where you are. Programmer: on the server.',
        'Q: How does a programmer fix a shower? A: if(wet) return;',
        'There are 10 types of people: those who understand binary and those who don\'t.',
        'Debugger: "Ready?" Code: "Sure." Stack trace: "Hold my beer."',
        'What do you call a Java programmer\'s son? A JavaBaby.',
        'Why are programmers bad swimmers? Because it\'s undefined behavior.',
        'Rekurze: viz Rekurze.',
      ];
      addLine(y(jokes[Math.floor(Math.random()*jokes.length)]));
    }},

    'quote':{fn(){CMDS.fortune.fn()}},

    'weather':{fn(){
      addLine(c('Weather for: Czech Republic, Zlin'));
      addLine(y('☁  Overcast'));
      addLine(g('Temperature: 8°C  (feels like: 5°C)'));
      addLine(dim('Humidity: 72%  Wind: 15 km/h  Rain: 0%'));
      addLine(dim('Tomorrow: ⛅ 10°C  |  Mon: ☀ 14°C'));
    }},

    'sl':{async fn(){
      const train=[
        '      ====        ________                ___________',
        ' _D _|  |_______/        \\__I_I_____===__|___________|',
        '  |(_)---  |    H\\________/ |   |        =|___ ___|  ',
        '  /     |  |   H  |  |     |   |         ||_| |_||  ',
        ' |      |  |   H  |__--------------------| [___] |  ',
        ' | ________|___H__/__|_____/[][]~\\_______|       |  ',
        ' |/ |   |-----------I_____I [][] []  D   |=======|__',
        '__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ________]_|__|__|_',
        ' |/-=|___|=    ||    ||    ||    |_D__D__D_|  |_|| |',
        '  \\_/      \\__/  \\__/  \\__/  \\__/       |_D__D__D_| ',
        '             Running TechTools Express to production...',
      ];
      for(const line of train){
        await addLine(y(line),120);
      }
    }},

    'yes':{fn(args){
      const txt=args||'y';
      let out='';
      for(let i=0;i<20;i++) out+=g(txt)+'  ';
      addLine(out);addLine(dim('(^C to stop)'));
    }},

    'lolcat':{fn(args){
      const text=args||'TechTools Terminal is awesome!';
      const colors=['#ff0000','#ff7700','#ffff00','#00ff00','#0088ff','#8800ff','#ff00ff'];
      let html='';
      for(let i=0;i<text.length;i++){
        html+=`<span style="color:${colors[i%colors.length]}">${text[i]}</span>`;
      }
      addLine(html);
    }},

    'konami':{fn(){
      addLine(p('↑ ↑ ↓ ↓ ← → ← → B A'));
      setTimeout(()=>addLine(g('🎮 CHEAT CODE ACTIVATED!')),500);
      setTimeout(()=>addLine(y('► Unlocked: 999 lives, infinite skills, god mode')),900);
      setTimeout(()=>addLine(c('► Easter egg #7 found! You know your classics.')),1300);
    }},

    'matrix':{fn(){
      const mc=document.getElementById('matrixCanvas');
      mc.style.display='block';
      const ctx2=mc.getContext('2d');
      mc.width=innerWidth;mc.height=innerHeight;
      const cols=Math.floor(mc.width/14);
      const drops=Array(cols).fill(1);
      const chars='アイウエオカキクケコ0123456789ABCDEF<>(){}[]';
      function drawMatrix(){
        ctx2.fillStyle='rgba(0,0,0,.05)';ctx2.fillRect(0,0,mc.width,mc.height);
        ctx2.fillStyle='#0f0';ctx2.font='13px monospace';
        drops.forEach((y2,i)=>{
          ctx2.fillText(chars[Math.floor(Math.random()*chars.length)],i*14,y2*14);
          if(y2*14>mc.height&&Math.random()>.975) drops[i]=0;
          drops[i]++;
        });
      }
      const mloop=setInterval(drawMatrix,50);
      addLine(g('[MATRIX] Entering the matrix... Press any key to exit.'));
      const exitMatrix=()=>{clearInterval(mloop);mc.style.display='none';document.removeEventListener('keydown',exitMatrix)};
      document.addEventListener('keydown',exitMatrix);
    }},

    /* ── SECURITY / EASTER EGGS ── */
    'sudo rm -rf /':{async fn(){
      addLine(r('[sudo] password for simon:'));
      await addLine(r('Deleting /bin...'),800);
      await addLine(r('Deleting /etc...'),400);
      await addLine(r('Deleting /home...'),300);
      await addLine(r('Deleting /usr...'),300);
      await addLine(y('Just kidding lol :)'),700);
      await addLine(dim('(This is a portfolio terminal, not a real shell)'),400);
    }},

    ':(){ :|:& };:':{async fn(){
      addLine(r('Fork bomb detected!'));
      for(let i=0;i<8;i++) await addLine(r(`spawning process ${1000+i*137}...`),150*i);
      await addLine(y('OOM killer activated.'),1300);
      addLine(g('System protected. Nice try!'),1600);
    }},

    'exit':{fn(){
      addLine(y('Goodbye! Redirecting you to reality...'));
      setTimeout(()=>addLine(dim('(Just kidding, you can\'t escape this terminal 😈)')),700);
    }},

    'reboot':{async fn(){
      addLine(y('Rebooting TechTools Terminal...'));
      await addLine(dim('Stopping services...'),400);
      await addLine(dim('Syncing filesystems...'),700);
      await addLine(dim('Unmounting filesystems...'),1000);
      setTimeout(()=>{clearOut();CMDS.motd.fn()},1600);
    }},

    'shutdown now':{async fn(){
      addLine(r('Broadcast message: The system is going down for power-off NOW'));
      await addLine(dim('Stopping portfolio.service...'),500);
      await addLine(dim('Stopping particles.service...'),800);
      await addLine(dim('Reached target shutdown.'),1200);
      setTimeout(()=>addLine(p('[  OK  ] Powered down. Thanks for visiting! ✨')),1800);
    }},

    'cat /dev/urandom':{fn(){
      let data='';
      for(let i=0;i<300;i++) data+=String.fromCharCode(33+Math.floor(Math.random()*90));
      addLine(dim(data));
      addLine(y('^C'));
    }},

    /* ── MINIGAMES ── */
    'guess':{fn(){
      const secret=Math.floor(Math.random()*100)+1;
      let attempts=0;
      addLine(g('🎲 Guess a number from 1 to 100!'));
      addLine(dim('Enter a number and press Enter...'));
      setPrompt('guess> ');
      activeGame={
        type:'guess',secret,attempts,
        handle(cmd){
          const n=parseInt(cmd);
          if(isNaN(n)){addLine(r('Enter a number!'));return}
          attempts++;
          if(n===secret){
            addLine(g(`🎉 Correct! The number was ${secret}. You got it in ${attempts} attempts!`));
            stopGame();
          } else if(n<secret) addLine(y(`↑ Higher! (attempt ${attempts})`));
          else addLine(y(`↓ Lower! (attempt ${attempts})`));
          activeGame.attempts=attempts;
        },
        stop(){addLine(dim(`Game ended. The number was ${secret}.`))}
      };
    }},

    'rps':{fn(args){
      const choices=['rock','scissors','paper'];
      const beats={rock:'scissors',scissors:'paper',paper:'rock'};
      const player=(args||'').toLowerCase().trim();
      if(!choices.includes(player)){addLine(r('Usage: rps rock | scissors | paper'));return}
      const cpu=choices[Math.floor(Math.random()*3)];
      addLine(`Ty: ${y(player)}  vs  CPU: ${c(cpu)}`);
      if(player===cpu) addLine(y('🤝 Draw!'));
      else if(beats[player]===cpu) addLine(g('🎉 You win!'));
      else addLine(r('💀 You lose!'));
    }},

    'lottery':{fn(){
      const nums=[];
      while(nums.length<6){const n=Math.floor(Math.random()*49)+1;if(!nums.includes(n))nums.push(n)}
      nums.sort((a,b)=>a-b);
      addLine(g('🎰 Lucky numbers: ')+nums.map(n=>`<span style="background:rgba(124,58,237,.3);padding:1px 6px;border-radius:4px;color:#e9d5ff">${n}</span>`).join(' '));
      addLine(dim('(Play responsibly. Results are not a guarantee of winning.)'));
    }},

    'quiz':{fn(){
      const questions=[
        {q:'What is the default access modifier in Java?',a:'package-private',opts:['public','private','protected','package-private']},
        {q:'Which git command creates a new branch and switches to it?',a:'git checkout -b',opts:['git branch','git checkout -b','git switch','git fork']},
        {q:'What does SOLID stand for in programming?',a:'OOP principles',opts:['data format','OOP principles','HTTP status','CSS framework']},
        {q:'Which port does HTTPS use?',a:'443',opts:['80','8080','443','3000']},
        {q:'What is Docker?',a:'containerization',opts:['database','containerization','IDE','framework']},
      ];
      const q=questions[Math.floor(Math.random()*questions.length)];
      addLine(y('❓ '+q.q));
      q.opts.forEach((o,i)=>addLine(`  ${b(i+1+'.')} ${o}`));
      addLine(dim('Answer with a number (1-4)'));
      setPrompt('quiz> ');
      activeGame={
        type:'quiz',q,
        handle(cmd){
          const idx=parseInt(cmd)-1;
          const chosen=q.opts[idx];
          if(!chosen){addLine(r('Enter 1-4'));return}
          if(chosen===q.a) addLine(g(`✓ Correct! "${q.a}"`));
          else addLine(r(`✗ Wrong. Correct answer: "${q.a}"`));
          stopGame();
        },
        stop(){stopGame()}
      };
    }},

    'hack':{async fn(){
      addLine(g('>>> INITIATING HACK SEQUENCE <<<'));
      const targets=['mainframe.gov','pentagon.mil','matrix.io','firewall.corp'];
      const t=targets[Math.floor(Math.random()*targets.length)];
      addLine(c(`Target: ${t}`));
      const steps=[
        'Scanning ports...',
        'Found open port 22 (SSH)...',
        'Brute-forcing credentials...',
        'Access granted! Injecting payload...',
        'Bypassing firewall...',
        'Exfiltrating data...',
      ];
      let delay=400;
      for(const s of steps){
        const pct=Math.floor(Math.random()*30+70);
        await addLine(y('['+'█'.repeat(Math.floor(pct/10))+'░'.repeat(10-Math.floor(pct/10))+`] ${pct}% `)+dim(s),delay);
        delay+=400+Math.random()*300;
      }
      await addLine(g('>>> HACK COMPLETE! <<<'),delay);
      await addLine(dim('Just kidding. Educational purposes only 😄'),delay+400);
    }},

    'mine':{fn(args){
      /* mini minesweeper reveal */
      const [xStr,yStr]=args? args.split(' '):[null,null];
      const size=5;
      if(!activeGame||activeGame.type!=='mine'){
        const board=Array.from({length:size},()=>Array(size).fill(0));
        const mines=[];
        while(mines.length<5){
          const mx=Math.floor(Math.random()*size),my=Math.floor(Math.random()*size);
          if(!mines.find(m=>m[0]===mx&&m[1]===my)){mines.push([mx,my]);board[my][mx]=-1}
        }
        for(let y2=0;y2<size;y2++)for(let x2=0;x2<size;x2++){
          if(board[y2][x2]===-1)continue;
          let cnt=0;
          for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
            const nx=x2+dx,ny=y2+dy;
            if(nx>=0&&nx<size&&ny>=0&&ny<size&&board[ny][nx]===-1)cnt++;
          }
          board[y2][x2]=cnt;
        }
        const revealed=Array.from({length:size},()=>Array(size).fill(false));
        activeGame={type:'mine',board,mines,revealed,size};
        setPrompt('mine> ');
        addLine(g('💣 Minesweeper 5x5'));
        addLine(dim('Usage: mine [col 0-4] [row 0-4]'));
        addLine(dim('Example: mine 2 3'));
      }
      if(xStr!==null&&yStr!==null){
        const x2=parseInt(xStr),y2=parseInt(yStr);
        if(isNaN(x2)||isNaN(y2)||x2<0||x2>=size||y2<0||y2>=size){addLine(r('Invalid coordinates'));return}
        const {board,revealed,mines}=activeGame;
        if(revealed[y2][x2]){addLine(dim('This cell is already revealed'));return}
        revealed[y2][x2]=true;
        if(board[y2][x2]===-1){
          addLine(r('💥 BOOM! You stepped on a mine!'));
          stopGame();return;
        }
      }
      /* render board */
      if(activeGame&&activeGame.type==='mine'){
        const {board,revealed,size:s}=activeGame;
        let header=dim('    ');
        for(let x2=0;x2<s;x2++) header+=b(x2+'  ');
        addLine(header);
        for(let row=0;row<s;row++){
          let line=b(row+' ')+dim('[ ');
          for(let col=0;col<s;col++){
            if(!revealed[row][col]) line+=dim('? ');
            else if(board[row][col]===-1) line+=r('* ');
            else if(board[row][col]===0) line+=dim('. ');
            else line+=y(board[row][col]+' ');
          }
          addLine(line+dim(']'));
        }
        const totalRevealed=activeGame.revealed.flat().filter(Boolean).length;
        const safe=size*size-activeGame.mines.length;
        if(totalRevealed>=safe){addLine(g('🎉 You win! All safe cells revealed!'));stopGame()}
      }
    }},

    'snake':{fn(){
      showCanvas();
      canvas.width=320;canvas.height=160;
      chint.textContent='← → ↑ ↓ move  |  ESC quit  |  SPACE restart';
      const ctx2=canvas.getContext('2d');
      const SZ=16,COLS=20,ROWS=10;
      let snake=[{x:10,y:5},{x:9,y:5},{x:8,y:5}];
      let dir={x:1,y:0},nextDir={x:1,y:0};
      let food={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)};
      let score=0,alive=true;
      setPrompt('snake> ');
      activeGame={type:'snake',handle(cmd){},stop(){stopGame()}};

      function spawnFood(){food={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)}}
      function drawSnake(){
        ctx2.fillStyle='#09090b';ctx2.fillRect(0,0,320,160);
        ctx2.fillStyle='#7c3aed';
        snake.forEach(s=>ctx2.fillRect(s.x*SZ+1,s.y*SZ+1,SZ-2,SZ-2));
        ctx2.fillStyle='#ef4444';
        ctx2.beginPath();ctx2.arc(food.x*SZ+SZ/2,food.y*SZ+SZ/2,SZ/2-2,0,Math.PI*2);ctx2.fill();
        ctx2.fillStyle='#22c55e';ctx2.font='10px monospace';
        ctx2.fillText('Score: '+score,4,10);
        if(!alive){
          ctx2.fillStyle='rgba(0,0,0,.7)';ctx2.fillRect(80,55,160,50);
          ctx2.fillStyle='#ef4444';ctx2.font='bold 14px monospace';ctx2.fillText('GAME OVER',118,75);
          ctx2.fillStyle='#eab308';ctx2.font='11px monospace';ctx2.fillText('Score: '+score,133,93);
        }
      }
      function stepSnake(){
        if(!alive)return;
        dir=nextDir;
        const head={x:(snake[0].x+dir.x+COLS)%COLS,y:(snake[0].y+dir.y+ROWS)%ROWS};
        if(snake.some(s=>s.x===head.x&&s.y===head.y)){alive=false;return}
        snake.unshift(head);
        if(head.x===food.x&&head.y===food.y){score++;spawnFood()}
        else snake.pop();
      }
      const keyFn=e=>{
        const map={ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1}};
        if(map[e.key]){e.preventDefault();const d=map[e.key];if(d.x!==-dir.x||d.y!==-dir.y)nextDir=d}
        if(e.key==='Escape'){stopGame();addLine(dim('Snake ended. Score: '+score));document.removeEventListener('keydown',keyFn)}
        if(!alive&&e.key===' '){
          snake=[{x:10,y:5},{x:9,y:5},{x:8,y:5}];dir={x:1,y:0};nextDir={x:1,y:0};
          food={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)};score=0;alive=true;
        }
      };
      document.addEventListener('keydown',keyFn);
      gameLoop=setInterval(()=>{stepSnake();drawSnake()},140);
      addLine(g('🐍 Snake! Controls: arrow keys. ESC = quit, SPACE = restart'));
    }},

    'pong':{fn(){
      showCanvas();
      canvas.width=320;canvas.height=160;
      chint.textContent='W/S left player  |  ↑/↓ right player  |  ESC quit';
      const ctx2=canvas.getContext('2d');
      let p1={y:60,score:0},p2={y:60,score:0};
      const PH=40,PW=8,BW=8,SPEED=3.5;
      let ball={x:160,y:80,vx:SPEED,vy:SPEED*(Math.random()>.5?1:-1)};
      const keys={};
      setPrompt('pong> ');
      activeGame={type:'pong',handle(){},stop(){stopGame()}};
      const keyFn=e=>{
        keys[e.key]=e.type==='keydown';
        if(['ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();
        if(e.key==='Escape'){clearInterval(gameLoop);hideCanvas();setPrompt();document.removeEventListener('keydown',keyFn);document.removeEventListener('keyup',keyFn);addLine(dim('Pong ended.'))}
      };
      document.addEventListener('keydown',keyFn);document.addEventListener('keyup',keyFn);
      gameLoop=setInterval(()=>{
        if(keys['w']||keys['W'])p1.y=Math.max(0,p1.y-4);
        if(keys['s']||keys['S'])p1.y=Math.min(160-PH,p1.y+4);
        if(keys['ArrowUp'])p2.y=Math.max(0,p2.y-4);
        if(keys['ArrowDown'])p2.y=Math.min(160-PH,p2.y+4);
        ball.x+=ball.vx;ball.y+=ball.vy;
        if(ball.y<=0||ball.y>=160-BW)ball.vy*=-1;
        if(ball.x<=PW+BW&&ball.y+BW>p1.y&&ball.y<p1.y+PH){ball.vx=Math.abs(ball.vx);ball.vy+=(ball.y-p1.y-PH/2)*.12}
        if(ball.x>=320-PW-BW*2&&ball.y+BW>p2.y&&ball.y<p2.y+PH){ball.vx=-Math.abs(ball.vx);ball.vy+=(ball.y-p2.y-PH/2)*.12}
        if(ball.x<0){p2.score++;ball={x:160,y:80,vx:SPEED,vy:SPEED*(Math.random()>.5?1:-1)}}
        if(ball.x>320){p1.score++;ball={x:160,y:80,vx:-SPEED,vy:SPEED*(Math.random()>.5?1:-1)}}
        ctx2.fillStyle='#09090b';ctx2.fillRect(0,0,320,160);
        ctx2.fillStyle='rgba(255,255,255,.08)';
        for(let y2=0;y2<160;y2+=10)ctx2.fillRect(159,y2,2,5);
        ctx2.fillStyle='#7c3aed';ctx2.fillRect(0,p1.y,PW,PH);
        ctx2.fillStyle='#06b6d4';ctx2.fillRect(320-PW,p2.y,PW,PH);
        ctx2.fillStyle='#fff';ctx2.fillRect(ball.x,ball.y,BW,BW);
        ctx2.font='bold 16px monospace';ctx2.fillStyle='#7c3aed';ctx2.fillText(p1.score,80,20);
        ctx2.fillStyle='#06b6d4';ctx2.fillText(p2.score,220,20);
      },16);
      addLine(g('🏓 Pong! W/S vs ↑/↓. ESC = quit'));
    }},

    'tetris':{fn(){
      showCanvas();
      canvas.width=160;canvas.height=320;
      chint.textContent='← → move  |  ↑ rotate  |  ↓ speed up  |  ESC quit';
      const ctx2=canvas.getContext('2d');
      const COLS=10,ROWS=20,SZ=16;
      const PIECES=[
        [[1,1,1,1]],
        [[1,1],[1,1]],
        [[0,1,1],[1,1,0]],
        [[1,1,0],[0,1,1]],
        [[1,0,0],[1,1,1]],
        [[0,0,1],[1,1,1]],
        [[0,1,0],[1,1,1]],
      ];
      const COLORS=['#06b6d4','#eab308','#22c55e','#ef4444','#f97316','#8b5cf6','#ec4899'];
      let board=Array.from({length:ROWS},()=>Array(COLS).fill(0));
      let score=0,alive=true;
      let curPiece=null,curX=0,curY=0,curColor='',curIdx=0;

      function spawn(){
        curIdx=Math.floor(Math.random()*PIECES.length);
        curPiece=[...PIECES[curIdx].map(r=>[...r])];
        curColor=COLORS[curIdx];curX=Math.floor((COLS-curPiece[0].length)/2);curY=0;
        if(!valid(curPiece,curX,curY)){alive=false}
      }
      function valid(p,x,y){
        return p.every((row,r)=>row.every((c,col)=>!c||
          (x+col>=0&&x+col<COLS&&y+r<ROWS&&!board[y+r]?.[x+col])));
      }
      function place(){
        curPiece.forEach((row,r)=>row.forEach((c,col)=>{if(c)board[curY+r][curX+col]=curColor}));
        let cleared=0;
        for(let r=ROWS-1;r>=0;r--){if(board[r].every(c=>c)){board.splice(r,1);board.unshift(Array(COLS).fill(0));cleared++;r++}}
        score+=cleared*100;
        spawn();
      }
      function rotate(p){return p[0].map((_,i)=>p.map(r=>r[i]).reverse())}
      function drawT(){
        ctx2.fillStyle='#09090b';ctx2.fillRect(0,0,160,320);
        board.forEach((row,r)=>row.forEach((c,col)=>{if(c){ctx2.fillStyle=c;ctx2.fillRect(col*SZ+1,r*SZ+1,SZ-2,SZ-2)}}));
        if(curPiece)curPiece.forEach((row,r)=>row.forEach((c,col)=>{if(c){ctx2.fillStyle=curColor;ctx2.fillRect((curX+col)*SZ+1,(curY+r)*SZ+1,SZ-2,SZ-2)}}));
        ctx2.fillStyle='#22c55e';ctx2.font='10px monospace';ctx2.fillText('Score: '+score,2,12);
        if(!alive){ctx2.fillStyle='rgba(0,0,0,.8)';ctx2.fillRect(15,120,130,60);ctx2.fillStyle='#ef4444';ctx2.font='bold 13px monospace';ctx2.fillText('GAME OVER',35,148);ctx2.fillStyle='#eab308';ctx2.font='11px monospace';ctx2.fillText('Score: '+score,50,168)}
      }
      const keys2={};
      const keyFn=e=>{
        keys2[e.key]=e.type==='keydown';
        if(['ArrowLeft','ArrowRight','ArrowDown','ArrowUp'].includes(e.key))e.preventDefault();
        if(e.key==='Escape'){clearInterval(gameLoop);hideCanvas();setPrompt();document.removeEventListener('keydown',keyFn);document.removeEventListener('keyup',keyFn);addLine(dim('Tetris ended. Score: '+score))}
        if(e.type==='keydown'){
          if(!alive)return;
          if(e.key==='ArrowLeft'&&valid(curPiece,curX-1,curY))curX--;
          if(e.key==='ArrowRight'&&valid(curPiece,curX+1,curY))curX++;
          if(e.key==='ArrowUp'){const r=rotate(curPiece);if(valid(r,curX,curY))curPiece=r}
        }
      };
      document.addEventListener('keydown',keyFn);document.addEventListener('keyup',keyFn);
      spawn();
      setPrompt('tetris> ');
      activeGame={type:'tetris',handle(){},stop(){clearInterval(gameLoop);hideCanvas();setPrompt();document.removeEventListener('keydown',keyFn);document.removeEventListener('keyup',keyFn)}};
      let ticker=0;
      gameLoop=setInterval(()=>{
        if(!alive){drawT();return}
        ticker++;
        const speed=Math.max(5,30-Math.floor(score/200));
        if(keys2['ArrowDown']||ticker%speed===0){
          if(valid(curPiece,curX,curY+1))curY++;
          else place();
        }
        drawT();
      },33);
      addLine(g('🧩 Tetris! ← → move, ↑ rotate, ↓ speed up, ESC quit'));
    }},

    '2048':{fn(){
      showCanvas();
      canvas.width=320;canvas.height=320;
      chint.textContent='← → ↑ ↓ move  |  ESC quit  |  SPACE restart';
      const ctx2=canvas.getContext('2d');
      const SZ=76,PAD=4;
      let grid=Array.from({length:4},()=>Array(4).fill(0));
      let score=0,alive=true;

      function addRandom(){
        const empty=[];
        for(let r=0;r<4;r++)for(let c=0;c<4;c++)if(!grid[r][c])empty.push([r,c]);
        if(!empty.length)return;
        const[r,c]=empty[Math.floor(Math.random()*empty.length)];
        grid[r][c]=Math.random()<.9?2:4;
      }
      addRandom();addRandom();

      const TILE_COLORS={0:'#1a1a2e',2:'#7c3aed',4:'#6d28d9',8:'#5b21b6',16:'#4c1d95',
        32:'#2563eb',64:'#1d4ed8',128:'#0891b2',256:'#0e7490',512:'#047857',
        1024:'#065f46',2048:'#b45309'};

      function slideRow(row){
        const filtered=row.filter(x=>x);
        for(let i=0;i<filtered.length-1;i++){if(filtered[i]===filtered[i+1]){score+=filtered[i]*2;filtered[i]*=2;filtered.splice(i+1,1)}}
        while(filtered.length<4)filtered.push(0);
        return filtered;
      }
      function move(dir){
        let moved=false;
        const orig=grid.map(r=>[...r]);
        if(dir==='left'){grid=grid.map(r=>{const n=slideRow(r);if(n.join()!==r.join())moved=true;return n})}
        if(dir==='right'){grid=grid.map(r=>{const n=slideRow([...r].reverse()).reverse();if(n.join()!==r.join())moved=true;return n})}
        if(dir==='up'){
          for(let c=0;c<4;c++){let col=grid.map(r=>r[c]);const n=slideRow(col);if(n.join()!==col.join())moved=true;n.forEach((v,r)=>grid[r][c]=v)}
        }
        if(dir==='down'){
          for(let c=0;c<4;c++){let col=grid.map(r=>r[c]).reverse();const n=slideRow(col).reverse();if(n.join()!==col.join())moved=true;n.forEach((v,r)=>grid[r][c]=v)}
        }
        if(moved)addRandom();
        if(grid.flat().includes(2048))alive=false;
        if(!grid.flat().some(v=>!v)&&!moved)alive=false;
      }
      function drawG(){
        ctx2.fillStyle='#09090b';ctx2.fillRect(0,0,320,320);
        ctx2.fillStyle='#22c55e';ctx2.font='bold 12px monospace';ctx2.fillText('Score: '+score,4,14);
        for(let r=0;r<4;r++)for(let c=0;c<4;c++){
          const v=grid[r][c];
          const x=PAD+c*(SZ+PAD),y=20+PAD+r*(SZ+PAD);
          ctx2.fillStyle=TILE_COLORS[v]||'#991b1b';
          ctx2.beginPath();ctx2.roundRect(x,y,SZ,SZ,6);ctx2.fill();
          if(v){ctx2.fillStyle='#fff';ctx2.font=`bold ${v>99?14:16}px monospace`;
            ctx2.textAlign='center';ctx2.fillText(v,x+SZ/2,y+SZ/2+6);ctx2.textAlign='left'}
        }
        if(!alive){ctx2.fillStyle='rgba(0,0,0,.7)';ctx2.fillRect(60,120,200,80);
          ctx2.fillStyle=grid.flat().includes(2048)?'#22c55e':'#ef4444';
          ctx2.font='bold 16px monospace';ctx2.textAlign='center';
          ctx2.fillText(grid.flat().includes(2048)?'YOU WIN!':'GAME OVER',160,155);
          ctx2.fillStyle='#eab308';ctx2.font='12px monospace';ctx2.fillText('Score: '+score,160,175);ctx2.textAlign='left'}
      }
      const keyFn=e=>{
        if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();
        if(!alive)return;
        if(e.key==='ArrowLeft')move('left');if(e.key==='ArrowRight')move('right');
        if(e.key==='ArrowUp')move('up');if(e.key==='ArrowDown')move('down');
        if(e.key==='Escape'){clearInterval(gameLoop);hideCanvas();setPrompt();document.removeEventListener('keydown',keyFn);addLine(dim('2048 ended. Score: '+score))}
        drawG();
      };
      document.addEventListener('keydown',keyFn);
      setPrompt('2048> ');
      activeGame={type:'2048',handle(){},stop(){clearInterval(gameLoop);hideCanvas();setPrompt();document.removeEventListener('keydown',keyFn)}};
      drawG();
      addLine(g('🎯 2048! Arrow keys to move. ESC to quit'));
    }},

    /* ── CLEAR ── */
    'clear':{fn(){clearOut()}},
  };

  /* ── command dispatch ── */
  function dispatch(raw){
    const parts=raw.trim().split(/\s+/);
    const base=parts[0].toLowerCase();
    const args=parts.slice(1).join(' ');

    /* game passthrough */
    if(activeGame&&activeGame.type!=='mine'){activeGame.handle&&activeGame.handle(raw);return}
    if(activeGame&&activeGame.type==='mine'){CMDS.mine.fn(args);return}

    /* full match */
    const fullKey=raw.trim().toLowerCase();
    if(CMDS[fullKey]){CMDS[fullKey].fn('');return}

    /* base command + args */
    if(CMDS[base]){CMDS[base].fn(args);return}

    /* partial match or unknown */
    const matches=Object.keys(CMDS).filter(k=>k.startsWith(base));
    if(matches.length===1){CMDS[matches[0]].fn(args);return}
    if(matches.length>1){addLine(y('Possible commands: ')+matches.map(m=>b(m)).join(dim(', ')));return}

    addLine(r(`bash: ${raw.trim()}: command not found`)+dim(' — type ')+c('help'));
  }

  /* ── key handling ── */
  input.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      const raw=input.value;
      input.value='';
      histIdx=-1;
      if(!raw.trim())return;
      cmdHistory.unshift(raw);
      if(cmdHistory.length>50)cmdHistory.pop();
      dispatch(raw);
    }
    if(e.key==='ArrowUp'){
      e.preventDefault();
      if(histIdx<cmdHistory.length-1){histIdx++;input.value=cmdHistory[histIdx]}
    }
    if(e.key==='ArrowDown'){
      e.preventDefault();
      if(histIdx>0){histIdx--;input.value=cmdHistory[histIdx]}
      else{histIdx=-1;input.value=''}
    }
    if(e.key==='Tab'){
      e.preventDefault();
      const cur=input.value.toLowerCase();
      if(!cur)return;
      const matches=Object.keys(CMDS).filter(k=>k.startsWith(cur));
      if(matches.length===1){input.value=matches[0]}
      else if(matches.length>1){addLine(dim(matches.join('  ')))}
    }
    if(e.key==='c'&&e.ctrlKey){e.preventDefault();stopGame();addLine(r('^C'));setPrompt()}
    if(e.key==='l'&&e.ctrlKey){e.preventDefault();clearOut()}
  });

  /* focus input when clicking anywhere in the terminal shell area,
     but NOT when the user is selecting text in the output */
  const termEl=document.querySelector('.terminal');
  if(termEl){
    termEl.addEventListener('mousedown',e=>{
      // if click is inside .tbody (output area), let browser handle text selection
      const bodyEl=document.getElementById('tbody');
      if(bodyEl&&bodyEl.contains(e.target)) return;
      // otherwise focus input
      e.preventDefault();
      input.focus();
    });
    // also focus on click in the shell wrap area
    document.querySelector('.term-shell-wrap')?.addEventListener('click',()=>{
      input.focus();
    });
  }
})();
