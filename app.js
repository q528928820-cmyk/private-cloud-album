
const $ = s => document.querySelector(s);

let albums = [];
let photos = [];
let currentAlbum = '';
let currentPage = 1;
let pageSize = 20;

async function api(path, options = {}) {
  const r = await fetch('/api/' + path, {
    credentials: 'same-origin',
    ...options
  });

  let data = {};
  try {
    data = await r.json();
  } catch {}

  if (!r.ok) {
    throw new Error(data.error || `请求失败 (${r.status})`);
  }

  return data;
}

function status(s) {
  $('#status').textContent = s || '';
}

function showApp(on) {
  $('#loginPanel').classList.toggle('hidden', on);
  $('#appPanel').classList.toggle('hidden', !on);
  $('#logoutBtn').classList.toggle('hidden', !on);
}

function createPagination() {
  let bar = $('#pagination');

  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'pagination';
    bar.className = 'pagination';
    $('#photoGrid').after(bar);
  }

  return bar;
}

function renderPagination(totalPages) {
  const bar = createPagination();
  bar.innerHTML = '';

  if (photos.length === 0) {
    bar.classList.add('hidden');
    return;
  }

  bar.classList.remove('hidden');

  const info = document.createElement('span');
  info.className = 'page-info';
  info.textContent = `共 ${photos.length} 张照片 · 第 ${currentPage}/${totalPages} 页`;

  const sizeLabel = document.createElement('label');
  sizeLabel.className = 'page-size-label';
  sizeLabel.textContent = '每页';

  const sizeSelect = document.createElement('select');
  sizeSelect.className = 'page-size';

  [10, 20].forEach(size => {
    const option = document.createElement('option');
    option.value = size;
    option.textContent = `${size} 张`;
    option.selected = pageSize === size;
    sizeSelect.append(option);
  });

  sizeSelect.onchange = () => {
    pageSize = Number(sizeSelect.value);
    currentPage = 1;
    renderPhotos();
  };

  sizeLabel.append(sizeSelect);

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'page-button';
  prev.textContent = '上一页';
  prev.disabled = currentPage <= 1;
  prev.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderPhotos();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'page-button';
  next.textContent = '下一页';
  next.disabled = currentPage >= totalPages;
  next.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPhotos();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  bar.append(info, sizeLabel, prev, next);
}

function renderPhotos() {
  const grid = $('#photoGrid');
  grid.innerHTML = '';

  const totalPages = Math.max(1, Math.ceil(photos.length / pageSize));

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const start = (currentPage - 1) * pageSize;
  const pagePhotos = photos.slice(start, start + pageSize);

  $('#emptyState').classList.toggle('hidden', photos.length > 0);

  pagePhotos.forEach(p => {
    const card = document.createElement('article');
    card.className = 'photo';

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = '/api/photo/' + encodeURIComponent(p.id) + '/thumbnail';
    img.alt = p.filename;

    const meta = document.createElement('div');
    meta.className = 'meta';

    const name = document.createElement('span');
    name.textContent = p.filename;
    name.title = p.filename;

    const del = document.createElement('button');
    del.className = 'delete';
    del.textContent = '删除';

    del.onclick = async () => {
      if (!confirm('确定删除这张照片？')) return;

      del.disabled = true;

      try {
        await api('photos/' + encodeURIComponent(p.id), {
          method: 'DELETE'
        });

        await loadPhotos();
      } catch (e) {
        alert(e.message);
        del.disabled = false;
      }
    };

    meta.append(name, del);
    card.append(img, meta);
    grid.append(card);
  });

  renderPagination(totalPages);
}

async function boot() {
  try {
    await api('me');
    showApp(true);
    await loadAlbums();
  } catch {
    showApp(false);
  }
}

$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  $('#loginError').textContent = '';

  try {
    await api('login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: $('#password').value
      })
    });

    $('#password').value = '';
    currentPage = 1;
    showApp(true);
    await loadAlbums();
  } catch (err) {
    $('#loginError').textContent = err.message;
  }
});

$('#logoutBtn').onclick = async () => {
  await api('logout', { method: 'POST' });
  showApp(false);
};

async function loadAlbums() {
  const d = await api('albums');
  albums = d.albums;

  if (!albums.length) {
    const a = await api('albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '默认相册' })
    });

    albums = [a.album];
  }

  const sel = $('#albumSelect');
  sel.innerHTML = '';

  albums.forEach(a => {
    const o = document.createElement('option');
    o.value = a.id;
    o.textContent = a.name;
    sel.append(o);
  });

  if (!albums.some(a => a.id === currentAlbum)) {
    currentAlbum = albums[0].id;
    currentPage = 1;
  }

  sel.value = currentAlbum;
  await loadPhotos();
}

$('#albumSelect').onchange = async e => {
  currentAlbum = e.target.value;
  currentPage = 1;
  await loadPhotos();
};

async function loadPhotos() {
  const d = await api(
    'photos?album_id=' + encodeURIComponent(currentAlbum)
  );

  photos = d.photos;
  renderPhotos();
}

$('#newAlbumBtn').onclick = () => {
  $('#albumName').value = '';
  $('#albumDialog').showModal();
};

$('#albumForm').onsubmit = async e => {
  e.preventDefault();

  try {
    const d = await api('albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: $('#albumName').value.trim()
      })
    });

    currentAlbum = d.album.id;
    currentPage = 1;
    $('#albumDialog').close();
    await loadAlbums();
  } catch (err) {
    alert(err.message);
  }
};

$('#photoInput').onchange = async e => {
  const files = [...e.target.files];
  e.target.value = '';

  if (!files.length) return;

  currentPage = 1;

  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    status(`正在上传 ${i + 1}/${files.length}：${files[i].name}`);

    const fd = new FormData();
    fd.append('file', files[i]);
    fd.append('album_id', currentAlbum);

    try {
      await api('photos', {
        method: 'POST',
        body: fd
      });
    } catch (err) {
      failed++;
      alert(`${files[i].name} 上传失败：${err.message}`);
    }
  }

  status(failed ? `上传完成，${failed} 张失败` : '上传完成');
  await loadPhotos();
};

$('#backupBtn').onclick = async () => {
  if (!window.JSZip) {
    alert('ZIP 组件加载失败，请检查网络后刷新页面');
    return;
  }

  try {
    status('正在准备备份…');

    const zip = new JSZip();
    const meta = await api('backup');

    zip.file(
      'album-backup.json',
      JSON.stringify({
        version: 1,
        created_at: new Date().toISOString(),
        albums: meta.albums,
        photos: meta.photos
      }, null, 2)
    );

    const folder = zip.folder('photos');

    for (let i = 0; i < meta.photos.length; i++) {
      const p = meta.photos[i];

      status(`正在备份照片 ${i + 1}/${meta.photos.length}`);

      const r = await fetch(
        '/api/photo/' + encodeURIComponent(p.id) + '/download',
        { credentials: 'same-origin' }
      );

      if (!r.ok) {
        throw new Error('下载照片失败：' + p.filename);
      }

      folder.file(
        p.id + '__' + p.filename,
        await r.blob()
      );
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = '私人云相册备份-' +
      new Date().toISOString().slice(0, 10) + '.zip';

    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    status('备份 ZIP 已生成，请妥善保存。');
  } catch (e) {
    alert('备份失败：' + e.message);
    status('备份未完成');
  }
};

$('#restoreInput').onchange = async e => {
  const file = e.target.files[0];
  e.target.value = '';

  if (!file) return;

  if (!confirm(
    '恢复会把 ZIP 中的相册和照片追加到当前云相册，不会自动删除现有照片。继续吗？'
  )) return;

  try {
    if (!window.JSZip) {
      throw new Error('ZIP 组件加载失败');
    }

    status('正在读取备份…');

    const zip = await JSZip.loadAsync(file);
    const mf = zip.file('album-backup.json');

    if (!mf) {
      throw new Error('找不到 album-backup.json，这不是本相册备份文件');
    }

    const meta = JSON.parse(await mf.async('text'));

    if (
      meta.version !== 1 ||
      !Array.isArray(meta.albums) ||
      !Array.isArray(meta.photos)
    ) {
      throw new Error('备份格式不正确');
    }

    const map = {};

    for (const a of meta.albums) {
      const d = await api('albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: a.name + '（恢复）'
        })
      });

      map[a.id] = d.album.id;
    }

    for (let i = 0; i < meta.photos.length; i++) {
      const p = meta.photos[i];
      const entry = zip.file('photos/' + p.id + '__' + p.filename);

      if (!entry) {
        throw new Error('备份缺少照片：' + p.filename);
      }

      status(`正在恢复照片 ${i + 1}/${meta.photos.length}`);

      const blob = await entry.async('blob');
      const fd = new FormData();

      fd.append('file', blob, p.filename);
      fd.append('album_id', map[p.album_id] || currentAlbum);

      await api('photos', {
        method: 'POST',
        body: fd
      });
    }

    currentPage = 1;
    status('恢复完成');
    await loadAlbums();
  } catch (err) {
    alert('恢复未完成：' + err.message);
    status('恢复未完成，请检查备份文件');
  }
};

boot();
