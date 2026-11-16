
const VIEW_HTML = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<title>私人云相册 - 浏览</title>
<style>
*{box-sizing:border-box}
html,body{
 margin:0;min-height:100%;
 background:radial-gradient(ellipse at 50% -20%,#263b5d 0,#101a2b 45%,#080e18 100%);
 color:#edf3ff;font:15px system-ui,"Microsoft YaHei",sans-serif
}
body{overscroll-behavior:none}
main{max-width:1120px;margin:0 auto;padding:30px 20px 60px}
header{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px}
.brand{display:flex;align-items:center;gap:12px;font-size:20px;font-weight:700;letter-spacing:1px}
.logo{width:40px;height:40px;border-radius:13px;background:linear-gradient(135deg,#8db7ff,#416ee5);display:grid;place-items:center;color:#09152b;font-size:21px}
.sub{color:#8fa4c5;font-size:12px;letter-spacing:2px}
.panel{background:linear-gradient(145deg,#17253aee,#111d30ee);border:1px solid #ffffff16;border-radius:20px;padding:24px;box-shadow:0 18px 55px #0003}
#login{max-width:420px;margin:90px auto;text-align:center;padding:35px 28px}
.login-icon{font-size:38px;margin-bottom:10px}
h2{margin:0 0 8px;font-size:23px}
.login-desc{color:#91a3bd;font-size:13px;margin-bottom:25px}
input{width:100%;font:inherit;padding:14px 15px;border-radius:11px;border:1px solid #344762;background:#0c1728;color:white;outline:none}
input:focus{border-color:#78a5ff;box-shadow:0 0 0 3px #5c8df52b}
button,select{font:inherit;border:0;border-radius:11px;padding:12px 18px;background:#6595ff;color:#08152b;font-weight:700;cursor:pointer}
button:active{transform:scale(.98)}
button:disabled{opacity:.35;cursor:not-allowed;transform:none}
#loginBtn{width:100%;margin-top:13px}
#albums{display:flex;gap:9px;flex-wrap:wrap;margin-top:17px}
.album{background:#23334b;color:#c6d6f0;border:1px solid #ffffff12;padding:10px 17px;border-radius:30px;font-size:14px}
.album.active{background:#7ca8ff;color:#09162b;border-color:#a6c4ff;box-shadow:0 5px 20px #5787ed45}
.section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.section-head h3{margin:0;font-size:17px}
#count{color:#8fa4c5;font-size:13px}
#photos{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:15px;margin-top:20px}
.photo-wrap{position:relative;overflow:hidden;border-radius:14px;background:#0b1422;aspect-ratio:1/1;border:1px solid #ffffff12;cursor:pointer}
.photo{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s}
.photo-wrap:hover .photo{transform:scale(1.055)}
.empty{grid-column:1/-1;text-align:center;color:#8fa4c5;padding:55px 10px}
.empty-icon{font-size:34px;margin-bottom:10px}
.hidden{display:none!important}
#msg{color:#ffcf83;text-align:center;margin:12px 0;min-height:22px;font-size:13px}

/* 前台分页 */
#pagination{
 display:flex;
 align-items:center;
 justify-content:center;
 flex-wrap:wrap;
 gap:10px;
 margin-top:22px;
}
#pagination button{
 padding:10px 16px;
 background:#263b59;
 color:#dce8ff;
 border:1px solid #ffffff18;
}
#pagination button:disabled{opacity:.35}
#pageInfo{color:#a9bbd7;font-size:13px;min-width:90px;text-align:center}
#pageSize{
 background:#263b59;
 color:#dce8ff;
 border:1px solid #ffffff18;
 padding:9px 12px;
 border-radius:10px;
}
#pagination label{color:#91a3bd;font-size:13px}

/* 照片查看器：全屏，无按钮，无网页内容 */
#viewer{
 position:fixed;
 inset:0;
 width:100vw;
 height:100vh;
 height:100dvh;
 background:#000;
 display:none;
 align-items:center;
 justify-content:center;
 z-index:2147483647;
 overflow:hidden;
 padding:0;
 margin:0;
 touch-action:none;
 overscroll-behavior:none;
}
#viewer:fullscreen,
#viewer:-webkit-full-screen{
 width:100vw;
 height:100vh;
 height:100dvh;
 background:#000;
}
#big{
 display:block;
 width:100%;
 height:100%;
 max-width:100%;
 max-height:100%;
 object-fit:contain;
 object-position:center;
 box-shadow:none;
 user-select:none;
 -webkit-user-select:none;
 -webkit-user-drag:none;
 pointer-events:none;
}
@media(max-width:600px){
 main{padding:20px 13px 40px}
 header{margin-bottom:20px}
 .panel{padding:17px;border-radius:16px}
 #login{margin:65px auto;padding:30px 22px}
 #photos{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
 .photo-wrap{border-radius:11px}
 #pagination{gap:7px}
 #pagination button{padding:9px 12px;font-size:13px}
 #pageInfo{min-width:75px;font-size:12px}
 #pageSize{padding:8px;font-size:13px}
}
</style>
</head>
<body>
<main>
<header>
 <div class="brand">
  <div class="logo">✦</div>
  <div>私人云相册<div class="sub">PRIVATE PHOTO GALLERY</div></div>
 </div>
</header>

<section id="login" class="panel">
 <div class="login-icon">◈</div>
 <h2>欢迎回来</h2>
 <div class="login-desc">输入浏览密码，开启私人照片之旅</div>
 <input id="password" type="password" placeholder="请输入浏览密码">
 <button id="loginBtn">进入相册</button>
</section>

<div id="app" class="hidden">
 <section class="panel">
  <div class="section-head"><h3>我的相册</h3><span id="albumCount"></span></div>
  <div id="albums"></div>
 </section>
 <section class="panel">
  <div class="section-head"><h3 id="albumTitle">照片</h3><span id="count"></span></div>
  <div id="photos"></div>
  <div id="pagination" class="hidden">
   <button id="prevPage" type="button">上一页</button>
   <span id="pageInfo">第1页 / 共1页</span>
   <button id="nextPage" type="button">下一页</button>
   <label for="pageSize">每页</label>
   <select id="pageSize">
    <option value="10">10张</option>
    <option value="20" selected>20张</option>
   </select>
  </div>
 </section>
</div>
<div id="msg"></div>
</main>

<div id="viewer"><img id="big" draggable="false"></div>

<script>
let token="",albums=[],photos=[],current=0,urls=[];
let viewerHistory=false;
let viewerOpen=false;
let touchStartX=0,touchStartY=0;
let currentPage=1;
let pageSize=20;

const $=id=>document.getElementById(id);

function say(s){$("msg").textContent=s}

async function api(path){
 const r=await fetch(path,{headers:{Authorization:"Bearer "+token}});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(data.error||"请求失败，请重新登录");
 return data;
}

function clearUrls(){
 urls.forEach(u=>URL.revokeObjectURL(u));
 urls=[];
}

async function loadAlbums(){
 albums=await api("/api/albums");
 $("albums").innerHTML="";
 $("albumCount").textContent=albums.length+" 个相册";

 if(!albums.length){
  $("albumTitle").textContent="还没有相册";
  $("photos").innerHTML='<div class="empty"><div class="empty-icon">▧</div>还没有创建相册</div>';
  $("count").textContent="";
  $("pagination").classList.add("hidden");
  return;
 }

 albums.forEach(a=>{
  const b=document.createElement("button");
  b.className="album";
  b.textContent=a.name;
  b.onclick=()=>loadPhotos(a.id);
  $("albums").append(b);
 });

 await loadPhotos(albums[0].id);
}

async function loadPhotos(id){
 try{
  clearUrls();
  currentPage=1;
  $("photos").innerHTML="";
  $("pagination").classList.add("hidden");
  photos=await api("/api/photos?album_id="+id);

  const album=albums.find(a=>a.id===id);
  $("albumTitle").textContent=album?album.name:"照片";

  [...$("albums").children].forEach((b,i)=>{
   b.classList.toggle("active",albums[i].id===id);
  });

  $("count").textContent=photos.length+" 张照片";

  if(!photos.length){
   $("photos").innerHTML='<div class="empty"><div class="empty-icon">▧</div>这个相册还没有照片</div>';
   return;
  }

  // 获取照片数据，保留原来的照片查看功能
  for(let i=0;i<photos.length;i++){
   const p=photos[i];

   const r=await fetch("/api/photo-file?id="+p.id,{
    headers:{Authorization:"Bearer "+token}
   });

   if(!r.ok)throw Error("照片读取失败");

   const blob=await r.blob();
   urls[i]=URL.createObjectURL(blob);
  }

  renderPhotoPage();
 }catch(e){
  say(e.message);
 }
}

/* 渲染当前页照片 */
function renderPhotoPage(){
 const totalPages=Math.max(1,Math.ceil(photos.length/pageSize));

 if(currentPage>totalPages)currentPage=totalPages;
 if(currentPage<1)currentPage=1;

 $("photos").innerHTML="";

 const start=(currentPage-1)*pageSize;
 const end=Math.min(start+pageSize,photos.length);

 for(let i=start;i<end;i++){
  const p=photos[i];
  const wrap=document.createElement("div");
  wrap.className="photo-wrap";

  const img=document.createElement("img");
  img.className="photo";
  img.alt=p.filename||"照片";
  img.loading="lazy";
  img.src=urls[i];
  img.onclick=()=>openPhoto(i);

  wrap.append(img);
  $("photos").append(wrap);
 }

 $("pagination").classList.remove("hidden");
 $("pageInfo").textContent="第 "+currentPage+" 页 / 共 "+totalPages+" 页";
 $("prevPage").disabled=currentPage<=1;
 $("nextPage").disabled=currentPage>=totalPages;
}

/* 分页按钮 */
$("prevPage").onclick=()=>{
 if(currentPage>1){
  currentPage--;
  renderPhotoPage();
  window.scrollTo({top:0,behavior:"smooth"});
 }
};

$("nextPage").onclick=()=>{
 const totalPages=Math.ceil(photos.length/pageSize);
 if(currentPage<totalPages){
  currentPage++;
  renderPhotoPage();
  window.scrollTo({top:0,behavior:"smooth"});
 }
};

$("pageSize").onchange=()=>{
 pageSize=Number($("pageSize").value)||20;
 currentPage=1;
 renderPhotoPage();
};

/* 打开照片：优先请求浏览器原生全屏 */
function openPhoto(i){
 if(!photos.length)return;

 current=i;
 viewerOpen=true;

 const viewer=$("viewer");
 viewer.style.display="flex";
 document.body.style.overflow="hidden";

 showPhoto();

 if(!viewerHistory){
  history.pushState(
   {photoViewer:true},
   "",
   location.pathname+location.search+"#photo"
  );
  viewerHistory=true;
 }

 const request=
  viewer.requestFullscreen||
  viewer.webkitRequestFullscreen||
  viewer.mozRequestFullScreen||
  viewer.msRequestFullscreen;

 if(request){
  try{
   const result=request.call(viewer,{navigationUI:"hide"});
   if(result&&typeof result.catch==="function"){
    result.catch(()=>{});
   }
  }catch(e){
   try{
    const fallback=request.call(viewer);
    if(fallback&&typeof fallback.catch==="function")fallback.catch(()=>{});
   }catch(err){}
  }
 }
}

function showPhoto(){
 if(!photos.length)return;
 $("big").src=urls[current]||"";
}

function closePhoto(fromPop=false){
 if(!viewerOpen)return;

 viewerOpen=false;

 $("viewer").style.display="none";
 $("big").src="";
 document.body.style.overflow="";

 const exit=
  document.exitFullscreen||
  document.webkitExitFullscreen||
  document.mozCancelFullScreen||
  document.msExitFullscreen;

 const isFull=
  document.fullscreenElement||
  document.webkitFullscreenElement||
  document.mozFullScreenElement||
  document.msFullscreenElement;

 if(isFull&&exit){
  try{
   const result=exit.call(document);
   if(result&&typeof result.catch==="function")result.catch(()=>{});
  }catch(e){}
 }

 if(viewerHistory){
  viewerHistory=false;
  if(!fromPop)history.back();
 }
}

function movePhoto(n){
 if(!viewerOpen||!photos.length)return;
 current=(current+n+photos.length)%photos.length;
 showPhoto();
}

/* 登录 */
$("loginBtn").onclick=async()=>{
 try{
  const r=await fetch("/api/view-login",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({password:$("password").value})
  });

  const d=await r.json();
  if(!r.ok)throw Error(d.error||"浏览密码错误");

  token=d.token;
  $("login").classList.add("hidden");
  $("app").classList.remove("hidden");

  await loadAlbums();
  say("登录成功");
 }catch(e){
  say(e.message);
 }
};

$("password").addEventListener("keydown",e=>{
 if(e.key==="Enter")$("loginBtn").click();
});

/* 手机：左右滑动切换 */
$("viewer").addEventListener("touchstart",e=>{
 if(!viewerOpen||e.touches.length!==1)return;
 touchStartX=e.touches[0].clientX;
 touchStartY=e.touches[0].clientY;
},{passive:true});

$("viewer").addEventListener("touchend",e=>{
 if(!viewerOpen||!e.changedTouches.length)return;

 const dx=e.changedTouches[0].clientX-touchStartX;
 const dy=e.changedTouches[0].clientY-touchStartY;

 if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2){
  movePhoto(dx<0?1:-1);
 }

 touchStartX=0;
 touchStartY=0;
},{passive:true});

/* 电脑：左半边上一张，右半边下一张 */
$("viewer").addEventListener("click",e=>{
 if(!viewerOpen)return;

 if(window.matchMedia("(hover: hover) and (pointer: fine)").matches){
  movePhoto(e.clientX<window.innerWidth/2?-1:1);
 }
});

/* 键盘方向键切换，Esc退出 */
document.addEventListener("keydown",e=>{
 if(!viewerOpen)return;

 if(e.key==="Escape"){
  closePhoto();
 }else if(e.key==="ArrowLeft"){
  movePhoto(-1);
 }else if(e.key==="ArrowRight"){
  movePhoto(1);
 }
});

/* 手机返回键退出照片 */
window.addEventListener("popstate",()=>{
 if(viewerOpen){
  closePhoto(true);
 }else{
  viewerHistory=false;
 }
});

/* 监听浏览器退出全屏 */
function onFullscreenChange(){
 const isFull=
  document.fullscreenElement||
  document.webkitFullscreenElement||
  document.mozFullScreenElement||
  document.msFullscreenElement;

 if(viewerOpen&&!isFull){
  closePhoto();
 }
}

document.addEventListener("fullscreenchange",onFullscreenChange);
document.addEventListener("webkitfullscreenchange",onFullscreenChange);
document.addEventListener("mozfullscreenchange",onFullscreenChange);
document.addEventListener("MSFullscreenChange",onFullscreenChange);
</script>
</body>
</html>`;
