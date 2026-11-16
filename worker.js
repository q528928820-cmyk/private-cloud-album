
const HTML = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>私人相册</title><style>
*{box-sizing:border-box}
body{margin:0;background:#f4f6fa;color:#182230;font:16px system-ui,"Microsoft YaHei",sans-serif}
main{max-width:980px;margin:28px auto;padding:0 16px}
.panel{background:white;border-radius:14px;padding:20px;margin:14px 0;box-shadow:0 2px 12px #1522380c}
h1{font-size:25px;margin:0 0 16px}
input,button{font:inherit;padding:11px;border:1px solid #ccd3dd;border-radius:9px}
button{background:#2459d3;color:white;border:0;cursor:pointer}
button.secondary{background:#e9eef8;color:#18366f}
button.danger{background:#b42318}
.row{display:flex;gap:9px;flex-wrap:wrap;align-items:center}
.row input{flex:1;min-width:180px}
#albums{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.album-wrap{display:flex;gap:4px;align-items:center}
.album{background:#e9eef8;color:#18366f}
.album.active{background:#2459d3;color:white}
.album-action{font-size:13px;padding:8px}
#photos{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:12px}
.photo{border:1px solid #e3e7ee;border-radius:10px;overflow:hidden;background:#fff}
.photo img{width:100%;height:170px;object-fit:cover;display:block;background:#eee}
.photo div{padding:8px}
.photo small{display:block;overflow-wrap:anywhere;color:#667085}
.hidden{display:none!important}
.muted{color:#667085;font-size:14px}
#msg{white-space:pre-wrap;color:#2459d3;margin-top:10px}

/* 后台登录：手机和电脑全屏居中 */
.login-screen{
  position:fixed;
  inset:0;
  z-index:100;
  display:flex;
  justify-content:center;
  align-items:center;
  width:100%;
  min-height:100vh;
  min-height:100dvh;
  padding:20px;
  margin:0;
  background:#f4f6fa;
}
.login-card{
  width:100%;
  max-width:400px;
  margin:0;
  padding:30px 24px;
  border-radius:16px;
  background:#fff;
  box-shadow:0 8px 35px #15223812;
}
.login-card h3{
  margin:0 0 22px;
  text-align:center;
  font-size:22px;
}
.login-card .row{
  display:flex;
  flex-direction:column;
  width:100%;
  gap:12px;
}
.login-card input{
  width:100%;
  min-width:0;
  padding:13px 14px;
}
.login-card button{
  width:100%;
  padding:13px;
}
@media(max-width:480px){
  .login-card{padding:26px 20px}
}
</style></head><body><main><h1>私人云相册</h1>
<section id="login" class="login-screen">
  <div class="panel login-card">
    <h3>后台管理登录</h3>
    <div class="row">
      <input id="password" type="password" placeholder="输入管理密码">
      <button id="loginBtn">登录</button>
    </div>
  </div>
</section>
<div id="app" class="hidden">
<section class="panel"><div class="row"><h3 style="margin:0">我的相册</h3><input id="newAlbum" placeholder="新相册名称"><button id="addAlbum">创建相册</button></div><div id="albums"></div></section>
<section class="panel"><h3>照片管理</h3><div class="row"><input id="files" type="file" accept="image/*" multiple><button id="upload">上传照片</button></div>
<p class="muted">支持常见图片格式。请等待上传完成后再关闭页面。</p><div id="photos"></div></section>
<section class="panel"><h3>备份与恢复</h3><div class="row"><button id="backup" class="secondary">下载完整 ZIP 备份</button><input id="restoreFile" type="file" accept=".zip,application/zip"><button id="restore" class="secondary">从 ZIP 恢复</button></div>
<p class="muted">备份包含照片原始文件和相册归属。恢复会重新上传照片到 Cloudinary。</p></section>
</div><div id="msg"></div></main>
<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script><script>
let token="",albums=[],current=null,imageUrls=[];const $=id=>document.getElementById(id);
function say(s){$("msg").textContent=s}
async function api(path,opts={}){opts.headers={...(opts.headers||{}),...(token?{Authorization:"Bearer "+token}:{})};let r=await fetch(path,opts);let data=await r.json().catch(()=>({error:"服务器返回异常"}));if(!r.ok)throw Error(data.error||("请求失败 "+r.status));return data}
function clearImageUrls(){imageUrls.forEach(u=>URL.revokeObjectURL(u));imageUrls=[]}
async function loadAlbums(){albums=await api("/api/albums");if(current&&!albums.some(a=>a.id===current))current=null;if(!current&&albums.length)current=albums[0].id;$("albums").innerHTML="";
albums.forEach(a=>{let wrap=document.createElement("div");wrap.className="album-wrap";let b=document.createElement("button");b.textContent=a.name;b.className="album"+(a.id===current?" active":"");b.onclick=async()=>{current=a.id;renderAlbums();await loadPhotos()};
let rename=document.createElement("button");rename.textContent="改名";rename.className="secondary album-action";rename.onclick=async()=>{let name=prompt("请输入新的相册名称",a.name);if(name===null)return;name=name.trim();if(!name)return say("相册名称不能为空");try{await api("/api/albums/"+a.id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({name})});await loadAlbums();say("相册名称已修改")}catch(e){say(e.message)}};
let del=document.createElement("button");del.textContent="删除";del.className="danger album-action";del.onclick=async()=>{if(!confirm("确定删除空相册「"+a.name+"」吗？有照片的相册不能直接删除。"))return;try{await api("/api/albums/"+a.id,{method:"DELETE"});if(current===a.id)current=null;await loadAlbums();say("相册已删除")}catch(e){say(e.message)}};wrap.append(b,rename,del);$("albums").append(wrap)});
renderAlbums();await loadPhotos()}
function renderAlbums(){[...$("albums").querySelectorAll(".album")].forEach((b,i)=>b.classList.toggle("active",albums[i].id===current))}
async function loadPhotos(){clearImageUrls();$("photos").innerHTML="";if(!current){$("photos").textContent="请先创建一个相册";return}
try{let ps=await api("/api/photos?album_id="+current);if(!ps.length){$("photos").textContent="这个相册还没有照片";return}
for(let p of ps){let card=document.createElement("div");card.className="photo";let img=document.createElement("img");img.alt=p.filename;img.loading="lazy";
try{let response=await fetch("/api/photo-file?id="+p.id,{headers:{Authorization:"Bearer "+token}});if(!response.ok)throw Error("图片读取失败");let blob=await response.blob();let objectUrl=URL.createObjectURL(blob);imageUrls.push(objectUrl);img.src=objectUrl}catch(e){img.alt="图片加载失败"}
let box=document.createElement("div");let name=document.createElement("small");name.textContent=p.filename;let del=document.createElement("button");del.textContent="删除";del.className="danger";del.style.marginTop="8px";del.onclick=async()=>{if(!confirm("确定删除这张照片？"))return;try{await api("/api/photos/"+p.id,{method:"DELETE"});await loadPhotos();say("照片已删除")}catch(e){say(e.message)}};box.append(name,del);card.append(img,box);$("photos").append(card)}}catch(e){say("加载照片失败："+e.message)}}
$("loginBtn").onclick=async()=>{try{let x=await api("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:$("password").value})});token=x.token;$("login").classList.add("hidden");$("app").classList.remove("hidden");await loadAlbums();say("登录成功")}catch(e){say(e.message)}};
$("password").addEventListener("keydown",e=>{if(e.key==="Enter")$("loginBtn").click()});
$("addAlbum").onclick=async()=>{let name=$("newAlbum").value.trim();if(!name)return say("请输入相册名称");try{let a=await api("/api/albums",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name})});$("newAlbum").value="";current=a.id;await loadAlbums();say("相册已创建")}catch(e){say(e.message)}};
$("upload").onclick=async()=>{if(!current)return say("请先创建或选择相册");let fs=[...$("files").files];if(!fs.length)return say("请先选择照片");for(let i=0;i<fs.length;i++){say("正在上传 "+(i+1)+"/"+fs.length+"："+fs[i].name);let f=new FormData();f.append("file",fs[i]);f.append("album_id",current);try{await api("/api/upload",{method:"POST",body:f})}catch(e){say("上传中断："+e.message);return}}$("files").value="";await loadPhotos();say("全部上传完成")};
$("backup").onclick=async()=>{try{if(!window.JSZip)throw Error("备份组件加载失败，请检查网络");say("正在读取相册和照片…");let data=await api("/api/backup-manifest");let zip=new JSZip();zip.file("album-backup.json",JSON.stringify({version:2,albums:data.albums},null,2));let folder=zip.folder("photos");for(let i=0;i<data.photos.length;i++){let p=data.photos[i];say("正在备份照片 "+(i+1)+"/"+data.photos.length);let r=await fetch("/api/photo-file?id="+p.id,{headers:{Authorization:"Bearer "+token}});if(!r.ok)throw Error("读取照片失败："+p.filename);folder.file(p.album_id+"/"+p.id+"_"+p.filename,await r.blob())}let blob=await zip.generateAsync({type:"blob",compression:"STORE"});let a=document.createElement("a");let objectUrl=URL.createObjectURL(blob);a.href=objectUrl;a.download="私人云相册备份_"+new Date().toISOString().slice(0,10)+".zip";a.click();setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);say("完整 ZIP 备份已生成")}catch(e){say("备份失败："+e.message)}};
$("restore").onclick=async()=>{try{let f=$("restoreFile").files[0];if(!f)throw Error("请选择 ZIP 文件");if(!window.JSZip)throw Error("恢复组件加载失败，请检查网络");if(!confirm("恢复会新增相册和照片，不会覆盖或删除现有内容。继续吗？"))return;say("正在读取 ZIP…");let zip=await JSZip.loadAsync(f);let metaFile=zip.file("album-backup.json");if(!metaFile)throw Error("找不到备份信息文件");let meta=JSON.parse(await metaFile.async("string"));if(!Array.isArray(meta.albums))throw Error("备份文件格式不正确");let mapping={};for(let a of meta.albums){let made=await api("/api/albums",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:a.name+"（恢复）"})});mapping[a.id]=made.id}
let entries=Object.values(zip.files).filter(x=>!x.dir&&x.name.startsWith("photos/"));for(let i=0;i<entries.length;i++){let entry=entries[i];let parts=entry.name.split("/");let blob=await entry.async("blob");let base=parts[parts.length-1];let filename=base.replace(/^\\d+_/,"");let oldAlbumId=parts.length>=3?Number(parts[1]):(meta.albums[0]&&meta.albums[0].id);let newAlbumId=mapping[oldAlbumId];if(!newAlbumId)continue;let form=new FormData();form.append("file",blob,filename);form.append("album_id",newAlbumId);say("正在恢复照片 "+(i+1)+"/"+entries.length);await api("/api/upload",{method:"POST",body:form})}current=null;await loadAlbums();say("恢复完成。照片已按原相册归类并上传到 Cloudinary。")}catch(e){say("恢复失败："+e.message)}};
</script></body></html>`;

const VIEW_HTML = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>私人云相册 - 浏览</title><style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;background:radial-gradient(ellipse at 50% -20%,#263b5d 0,#101a2b 45%,#080e18 100%);color:#edf3ff;font:15px system-ui,"Microsoft YaHei",sans-serif}
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
button{font:inherit;border:0;border-radius:11px;padding:12px 18px;background:#6595ff;color:#08152b;font-weight:700;cursor:pointer}
button:active{transform:scale(.98)}
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
#viewer{position:fixed;inset:0;background:#030711f5;display:none;align-items:center;justify-content:center;z-index:10;padding:55px 65px}
#viewer img{max-width:100%;max-height:100%;object-fit:contain;box-shadow:0 15px 70px #0009}
#viewer button{position:absolute;background:#ffffff18;color:white;border:1px solid #ffffff24;backdrop-filter:blur(8px)}
#close{right:20px;top:20px}#prev{left:18px;top:50%;transform:translateY(-50%)}#next{right:18px;top:50%;transform:translateY(-50%)}
#counter{position:absolute;bottom:20px;color:#cbd8ee;font-size:13px}
@media(max-width:600px){main{padding:20px 13px 40px}header{margin-bottom:20px}.panel{padding:17px;border-radius:16px}#login{margin:65px auto;padding:30px 22px}#photos{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.photo-wrap{border-radius:11px}#viewer{padding:55px 12px}#prev{left:7px}#next{right:7px}}
</style></head><body><main>
<header><div class="brand"><div class="logo">✦</div><div>私人云相册<div class="sub">PRIVATE PHOTO GALLERY</div></div></div></header>
<section id="login" class="panel"><div class="login-icon">◈</div><h2>欢迎回来</h2><div class="login-desc">输入浏览密码，开启私人照片之旅</div><input id="password" type="password" placeholder="请输入浏览密码"><button id="loginBtn">进入相册</button></section>
<div id="app" class="hidden">
<section class="panel"><div class="section-head"><h3>我的相册</h3><span id="albumCount"></span></div><div id="albums"></div></section>
<section class="panel"><div class="section-head"><h3 id="albumTitle">照片</h3><span id="count"></span></div><div id="photos"></div></section>
</div><div id="msg"></div></main>
<div id="viewer"><button id="close">✕ 关闭</button><button id="prev">‹ 上一张</button><img id="big"><button id="next">下一张 ›</button><div id="counter"></div></div>
<script>
let token="",albums=[],photos=[],current=0,urls=[];const $=id=>document.getElementById(id);
function say(s){$("msg").textContent=s}
async function api(path){const r=await fetch(path,{headers:{Authorization:"Bearer "+token}});const data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data.error||"请求失败，请重新登录");return data}
function clearUrls(){urls.forEach(u=>URL.revokeObjectURL(u));urls=[]}
async function loadAlbums(){albums=await api("/api/albums");$("albums").innerHTML="";$("albumCount").textContent=albums.length+" 个相册";if(!albums.length){$("albumTitle").textContent="还没有相册";$("photos").innerHTML='<div class="empty"><div class="empty-icon">▧</div>还没有创建相册</div>';$("count").textContent="";return}
albums.forEach((a)=>{const b=document.createElement("button");b.className="album";b.textContent=a.name;b.onclick=()=>loadPhotos(a.id);$("albums").append(b)});await loadPhotos(albums[0].id)}
async function loadPhotos(id){try{clearUrls();$("photos").innerHTML="";photos=await api("/api/photos?album_id="+id);const album=albums.find(a=>a.id===id);$("albumTitle").textContent=album?album.name:"照片";
[...$("albums").children].forEach((b,i)=>b.classList.toggle("active",albums[i].id===id));$("count").textContent=photos.length+" 张照片";if(!photos.length){$("photos").innerHTML='<div class="empty"><div class="empty-icon">▧</div>这个相册还没有照片</div>';return}
for(let i=0;i<photos.length;i++){const p=photos[i];const wrap=document.createElement("div");wrap.className="photo-wrap";const img=document.createElement("img");img.className="photo";img.alt=p.filename;img.loading="lazy";const r=await fetch("/api/photo-file?id="+p.id,{headers:{Authorization:"Bearer "+token}});if(!r.ok)throw Error("照片读取失败");const blob=await r.blob();const u=URL.createObjectURL(blob);urls.push(u);img.src=u;img.onclick=()=>openPhoto(i);wrap.append(img);$("photos").append(wrap)}}catch(e){say(e.message)}}
function openPhoto(i){current=i;$("viewer").style.display="flex";showPhoto()}
function showPhoto(){if(!photos.length)return;$("big").src=urls[current];$("counter").textContent=(current+1)+" / "+photos.length}
function closePhoto(){$("viewer").style.display="none";$("big").src=""}
function movePhoto(n){if(!photos.length)return;current=(current+n+photos.length)%photos.length;showPhoto()}
$("loginBtn").onclick=async()=>{try{const r=await fetch("/api/view-login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:$("password").value})});const d=await r.json();if(!r.ok)throw Error(d.error||"浏览密码错误");token=d.token;$("login").classList.add("hidden");$("app").classList.remove("hidden");await loadAlbums();say("登录成功")}catch(e){say(e.message)}};
$("password").addEventListener("keydown",e=>{if(e.key==="Enter")$("loginBtn").click()});
$("close").onclick=closePhoto;$("prev").onclick=()=>movePhoto(-1);$("next").onclick=()=>movePhoto(1);
document.addEventListener("keydown",e=>{if($("viewer").style.display==="flex"){if(e.key==="Escape")closePhoto();if(e.key==="ArrowLeft")movePhoto(-1);if(e.key==="ArrowRight")movePhoto(1)}});
</script></body></html>`;

const enc = new TextEncoder();
const hex = b => [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
async function digest(algorithm,value){return hex(await crypto.subtle.digest(algorithm,enc.encode(value)))}
function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8",...headers}})}
function b64url(bytes){let s="";for(const b of new Uint8Array(bytes))s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
async function signToken(secret,payload){const key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return b64url(await crypto.subtle.sign("HMAC",key,enc.encode(payload)))}

async function valid(request,env,allowedRoles=["admin"]){
  const h=request.headers.get("Authorization")||"";
  const token=h.startsWith("Bearer ")?h.slice(7):"";
  const [payload,sig]=token.split(".");
  if(!payload||!sig||!env.ALBUM_SESSION_SECRET)return false;
  const expected=await signToken(env.ALBUM_SESSION_SECRET,payload);
  if(sig!==expected)return false;
  try{
    const p=JSON.parse(atob(payload.replace(/-/g,"+").replace(/_/g,"/")));
    const role=p.role||"admin";
    return p.exp>Date.now()&&allowedRoles.includes(role);
  }catch{return false}
}
async function cloudSign(params,secret){const str=Object.keys(params).sort().filter(k=>params[k]!==undefined&&params[k]!==null&&params[k]!=="").map(k=>k+"="+params[k]).join("&")+secret;return digest("SHA-1",str)}

export default {
async fetch(request,env){
  const url=new URL(request.url),path=url.pathname;

  if(path==="/"||path==="/index.html")return new Response(HTML,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}});
  if(path==="/view")return new Response(VIEW_HTML,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}});

  if(path==="/api/login"&&request.method==="POST"){
    if(!env.ALBUM_PASSWORD||!env.ALBUM_SESSION_SECRET)return json({error:"请先在 Worker 变量和机密中设置 ALBUM_PASSWORD 与 ALBUM_SESSION_SECRET"},503);
    const body=await request.json().catch(()=>({}));
    if(typeof body.password!=="string"||body.password!==env.ALBUM_PASSWORD)return json({error:"密码错误"},401);
    const payload=b64url(enc.encode(JSON.stringify({exp:Date.now()+86400000,role:"admin"})));
    return json({token:payload+"."+await signToken(env.ALBUM_SESSION_SECRET,payload)});
  }

  if(path==="/api/view-login"&&request.method==="POST"){
    if(!env.VIEW_PASSWORD||!env.ALBUM_SESSION_SECRET)return json({error:"请先在 Worker 变量和机密中设置 VIEW_PASSWORD 与 ALBUM_SESSION_SECRET"},503);
    const body=await request.json().catch(()=>({}));
    if(typeof body.password!=="string"||body.password!==env.VIEW_PASSWORD)return json({error:"浏览密码错误"},401);
    const payload=b64url(enc.encode(JSON.stringify({exp:Date.now()+86400000,role:"viewer"})));
    return json({token:payload+"."+await signToken(env.ALBUM_SESSION_SECRET,payload)});
  }

  const viewerReadOnly=request.method==="GET"&&(
    path==="/api/albums"||
    path==="/api/photos"||
    path==="/api/photo-file"
  );
  const allowedRoles=viewerReadOnly?["admin","viewer"]:["admin"];
  if(!await valid(request,env,allowedRoles))return json({error:"登录已失效或权限不足，请重新登录"},401);

  if(path==="/api/albums"&&request.method==="GET"){
    const {results}=await env.DB.prepare("SELECT id,name,created_at FROM albums ORDER BY id DESC").all();return json(results);
  }
  if(path==="/api/albums"&&request.method==="POST"){
    const b=await request.json(),name=String(b.name||"").trim();if(!name||name.length>100)return json({error:"相册名称不能为空且不能超过100字"},400);
    const r=await env.DB.prepare("INSERT INTO albums(name) VALUES(?)").bind(name).run();return json({id:r.meta.last_row_id,name});
  }
  if(path.startsWith("/api/albums/")&&request.method==="PATCH"){
    const id=Number(path.split("/").pop()),b=await request.json(),name=String(b.name||"").trim();if(!id||!name||name.length>100)return json({error:"相册编号或名称不正确"},400);
    const album=await env.DB.prepare("SELECT id FROM albums WHERE id=?").bind(id).first();if(!album)return json({error:"相册不存在"},404);
    await env.DB.prepare("UPDATE albums SET name=? WHERE id=?").bind(name,id).run();return json({success:true,id,name});
  }
  if(path.startsWith("/api/albums/")&&request.method==="DELETE"){
    const id=Number(path.split("/").pop());if(!id)return json({error:"相册编号不正确"},400);
    const album=await env.DB.prepare("SELECT id FROM albums WHERE id=?").bind(id).first();if(!album)return json({error:"相册不存在"},404);
    const count=await env.DB.prepare("SELECT COUNT(*) AS total FROM photos WHERE album_id=?").bind(id).first();
    if(count.total>0)return json({error:"这个相册里还有照片，请先移动或删除照片，再删除相册。"},400);
    await env.DB.prepare("DELETE FROM albums WHERE id=?").bind(id).run();return json({success:true});
  }
  if(path==="/api/photos"&&request.method==="GET"){
    const id=Number(url.searchParams.get("album_id"));
    const {results}=await env.DB.prepare("SELECT id,album_id,filename,cloudinary_url,public_id,created_at FROM photos WHERE album_id=? ORDER BY id DESC").bind(id).all();return json(results);
  }
  if(path==="/api/upload"&&request.method==="POST"){
    if(!env.CLOUDINARY_CLOUD_NAME||!env.CLOUDINARY_API_KEY||!env.CLOUDINARY_API_SECRET)return json({error:"Cloudinary 三项配置不完整"},503);
    const form=await request.formData(),file=form.get("file"),albumId=Number(form.get("album_id"));
    if(!(file instanceof File)||!albumId)return json({error:"照片或相册编号缺失"},400);
    const album=await env.DB.prepare("SELECT id FROM albums WHERE id=?").bind(albumId).first();if(!album)return json({error:"相册不存在"},404);
    const timestamp=Math.floor(Date.now()/1000),sig=await cloudSign({timestamp},env.CLOUDINARY_API_SECRET);
    const upload=new FormData();upload.append("file",file);upload.append("api_key",env.CLOUDINARY_API_KEY);upload.append("timestamp",String(timestamp));upload.append("signature",sig);
    const cr=await fetch("https://api.cloudinary.com/v1_1/"+encodeURIComponent(env.CLOUDINARY_CLOUD_NAME)+"/image/upload",{method:"POST",body:upload});
    const result=await cr.json().catch(()=>({}));if(!cr.ok)return json({error:result.error?.message||"Cloudinary 上传失败"},502);
    await env.DB.prepare("INSERT INTO photos(album_id,filename,cloudinary_url,public_id) VALUES(?,?,?,?)").bind(albumId,file.name,result.secure_url,result.public_id).run();return json({success:true});
  }
  if(path==="/api/backup-manifest"&&request.method==="GET"){
    const [a,p]=await Promise.all([env.DB.prepare("SELECT id,name,created_at FROM albums ORDER BY id").all(),env.DB.prepare("SELECT id,album_id,filename,cloudinary_url,public_id,created_at FROM photos ORDER BY id").all()]);
    return json({albums:a.results,photos:p.results});
  }
  if(path==="/api/photo-file"&&request.method==="GET"){
    const id=Number(url.searchParams.get("id")),p=await env.DB.prepare("SELECT filename,cloudinary_url FROM photos WHERE id=?").bind(id).first();
    if(!p)return json({error:"照片不存在"},404);
    const r=await fetch(p.cloudinary_url);if(!r.ok)return json({error:"无法从 Cloudinary 读取原图"},502);
    const headers=new Headers();headers.set("Content-Type",r.headers.get("Content-Type")||"application/octet-stream");headers.set("Content-Disposition","inline; filename*=UTF-8''"+encodeURIComponent(p.filename));headers.set("Cache-Control","private, no-store");
    return new Response(r.body,{headers});
  }
  if(path.startsWith("/api/photos/")&&request.method==="DELETE"){
    const id=Number(path.split("/").pop()),p=await env.DB.prepare("SELECT public_id FROM photos WHERE id=?").bind(id).first();if(!p)return json({error:"照片不存在"},404);
    const timestamp=Math.floor(Date.now()/1000),sig=await cloudSign({public_id:p.public_id,timestamp},env.CLOUDINARY_API_SECRET);
    const f=new FormData();f.append("public_id",p.public_id);f.append("api_key",env.CLOUDINARY_API_KEY);f.append("timestamp",String(timestamp));f.append("signature",sig);
    const cr=await fetch("https://api.cloudinary.com/v1_1/"+encodeURIComponent(env.CLOUDINARY_CLOUD_NAME)+"/image/destroy",{method:"POST",body:f});
    const result=await cr.json().catch(()=>({}));if(!cr.ok||(result.result!=="ok"&&result.result!=="not found"))return json({error:"Cloudinary 删除失败"},502);
    await env.DB.prepare("DELETE FROM photos WHERE id=?").bind(id).run();return json({success:true});
  }
  return json({error:"接口不存在"},404);
}
};
