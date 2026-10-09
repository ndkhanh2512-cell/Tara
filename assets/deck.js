(function () {
  var isPrint = /print-pdf/i.test(window.location.search);
  var HUB = { x: 560, y: 200 };
  var SVGNS = 'http://www.w3.org/2000/svg';

  function buildLinks(stage) {
    var svg = stage.querySelector('svg.links');
    var tiles = [].slice.call(stage.querySelectorAll('.tile'));

    /* today's point-to-point reality (illustrative): coded links and Excel/manual gaps */
    var LINKS = [
      [0, 3, 'tồn kho, đơn online', 'code', 0, -10],
      [0, 1, 'đơn đại lý, công nợ', 'code', -6, -6],
      [3, 2, 'sản phẩm, giá', 'code', 0, -8],
      [3, 4, 'khách hàng', 'code', 18, 0],
      [5, 4, 'số seri', 'code', -10, -14],
      [6, 0, 'phê duyệt chi', 'code', 46, -6],
      [1, 3, 'Excel: đối chiếu tồn kho', 'xl', 10, -10],
      [7, 0, 'Nhập tay: giá sàn, đối thủ', 'xl', 0, 0],
      [5, 0, 'Excel: đổi trả, linh kiện', 'xl', -8, 22]
    ];
    var mesh = document.createElementNS(SVGNS, 'g');
    mesh.setAttribute('class', 'mesh');
    function pt(t) { var st = t.style; return [parseFloat(st.getPropertyValue('--sx')), parseFloat(st.getPropertyValue('--sy'))]; }
    LINKS.forEach(function (L, k) {
      var a = pt(tiles[L[0]]), b = pt(tiles[L[1]]);
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      var p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('class', 'wire ' + L[3]);
      p.setAttribute('d', 'M ' + a[0] + ' ' + a[1] + ' Q ' + (mx + L[4]) + ' ' + (my + L[5]) + ' ' + b[0] + ' ' + b[1]);
      p.style.setProperty('--i', k);
      mesh.appendChild(p);
      var lx = (a[0] + 2 * (mx + L[4]) + b[0]) / 4, ly = (a[1] + 2 * (my + L[5]) + b[1]) / 4;
      var t = document.createElementNS(SVGNS, 'text');
      t.setAttribute('class', 'wl ' + L[3]);
      t.setAttribute('x', lx); t.setAttribute('y', ly + 4);
      t.setAttribute('text-anchor', 'middle');
      t.style.setProperty('--i', k);
      t.textContent = L[2];
      mesh.appendChild(t);
    });
    svg.appendChild(mesh);

    tiles.forEach(function (tile) {
      var cs = tile.style;
      var i = cs.getPropertyValue('--i').trim();
      var hx = parseFloat(cs.getPropertyValue('--hx'));
      var hy = parseFloat(cs.getPropertyValue('--hy'));

      var line = document.createElementNS(SVGNS, 'line');
      line.setAttribute('class', 'link');
      line.setAttribute('x1', hx); line.setAttribute('y1', hy);
      line.setAttribute('x2', HUB.x); line.setAttribute('y2', HUB.y);
      line.style.setProperty('--i', i);
      svg.appendChild(line);

      var dot = document.createElementNS(SVGNS, 'circle');
      dot.setAttribute('class', 'pulse');
      dot.setAttribute('r', 5);
      dot.style.setProperty('--i', i);
      dot.style.offsetPath = "path('M " + hx + " " + hy + " L " + HUB.x + " " + HUB.y + "')";
      svg.appendChild(dot);
    });
  }


  function syncStage() {
    var slide = Reveal.getCurrentSlide();
    document.querySelectorAll('.stage, .stepper').forEach(function (stage) {
      if (isPrint) {
        var sec = stage.closest('section');
        var n = sec ? sec.querySelectorAll('.fragment').length : 2;
        stage.dataset.step = stage.dataset.final || String(stage.classList.contains('stage') ? 2 : n);
        return;
      }
      if (!slide || !slide.contains(stage)) return;
      var f = Reveal.getIndices().f;
      stage.dataset.step = String((typeof f === 'number' ? f : -1) + 1);
    });
    heroActive = !!(slide && slide.querySelector('#hero3d'));
    flowActive = !!(slide && slide.querySelector('#flow3d'));
  }

  /* ---------- 3D hero: eight systems orbiting one data core ---------- */
  var heroActive = true;
  function initHero() {
    var host = document.getElementById('hero3d');
    if (!host || typeof THREE === 'undefined') return;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); }
    catch (e) { host.style.display = 'none'; return; }
    var W = 560, H = 560;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    host.appendChild(renderer.domElement);
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    cam.position.set(0, 3.6, 11.2); cam.lookAt(0, -0.1, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    var dl = new THREE.DirectionalLight(0xffffff, 0.7); dl.position.set(3, 6, 5); scene.add(dl);

    var BLUE = 0x0057A9, SKY = 0x277CBE, RED = 0xD53F59, GREY = 0x6D6E71;
    var group = new THREE.Group(); scene.add(group);

    var core = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.55, 5),
      new THREE.MeshStandardMaterial({ color: BLUE, metalness: 0.2, roughness: 0.45 }));
    group.add(core);
    var coreEdge = new THREE.LineSegments(new THREE.EdgesGeometry(core.geometry), new THREE.LineBasicMaterial({ color: 0xffffff }));
    core.add(coreEdge);

    var ringPts = []; for (var a = 0; a <= 64; a++) { var t = a / 64 * Math.PI * 2; ringPts.push(new THREE.Vector3(Math.cos(t) * 3.4, 0, Math.sin(t) * 3.4)); }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPts), new THREE.LineBasicMaterial({ color: 0xB8D3EC })));

    var cols = [SKY, RED, GREY, SKY, BLUE, RED, SKY, GREY];
    var nodes = [], links = [];
    for (var i = 0; i < 8; i++) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), new THREE.MeshStandardMaterial({ color: cols[i], roughness: 0.5 }));
      var ang = i / 8 * Math.PI * 2;
      m.userData = { ang: ang, start: new THREE.Vector3((Math.random() - 0.5) * 9, (Math.random() - 0.3) * 5, (Math.random() - 0.5) * 6) };
      m.position.copy(m.userData.start);
      group.add(m); nodes.push(m);
      var g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      var l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: SKY, transparent: true, opacity: 0 }));
      group.add(l); links.push(l);
    }
    var NAMES = ['NetSuite', 'DMS', 'eCommerce', 'Haravan', 'Base', 'Bảo hành, CSKH', 'CRM', 'Dữ liệu bên ngoài'];
    var tags = NAMES.map(function (nm, i) {
      var d = document.createElement('p'); d.className = 'h3tag' + (i === 7 ? ' ext' : ''); d.textContent = nm;
      host.appendChild(d); return d;
    });
    var coreTag = document.createElement('p'); coreTag.className = 'h3tag h3core'; coreTag.textContent = 'Data Lake';
    host.appendChild(coreTag);
    var wv = new THREE.Vector3();
    function placeTag(el, v, op) {
      v.project(cam);
      el.style.left = ((v.x + 1) / 2 * 100) + '%';
      el.style.top = ((1 - v.y) / 2 * 100) + '%';
      el.style.opacity = op;
    }
    var t0 = performance.now();
    function frame(now) {
      requestAnimationFrame(frame);
      if (!heroActive && !isPrint) return;
      var t = (now - t0) / 1000;
      var k = isPrint ? 1 : Math.min(1, t / 3.2); var e = 1 - Math.pow(1 - k, 3);
      group.rotation.y = isPrint ? 0.4 : t * 0.18;
      core.rotation.y = -t * 0.3;
      nodes.forEach(function (n, i) {
        var target = new THREE.Vector3(Math.cos(n.userData.ang) * 3.4, Math.sin(t * 1.2 + i) * 0.12, Math.sin(n.userData.ang) * 3.4);
        n.position.lerpVectors(n.userData.start, target, e);
        n.rotation.x = t * 0.6 + i; n.rotation.y = t * 0.4;
        var p = links[i].geometry.attributes.position;
        p.setXYZ(0, n.position.x, n.position.y, n.position.z); p.setXYZ(1, 0, 0, 0); p.needsUpdate = true;
        links[i].material.opacity = Math.max(0, (e - 0.6) / 0.4) * 0.8;
        n.getWorldPosition(wv); wv.y += 0.28;
        placeTag(tags[i], wv, Math.max(0, (e - 0.7) / 0.3));
      });
      wv.set(0, 0.45, 0); placeTag(coreTag, wv, Math.max(0, (e - 0.7) / 0.3));
      renderer.render(scene, cam);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Inventory simulator ---------- */
  function initSim() {
    var root = document.getElementById('inv-sim'); if (!root) return;
    root.addEventListener('keydown', function (e) { e.stopPropagation(); });
    var S = { onhand: 10, soft: 0, hard: 0 }, SAFE = 2;
    var log = document.getElementById('inv-log'), meta = document.getElementById('inv-meta');
    function avail() { return S.onhand - S.soft - S.hard; }
    function render(flash) {
      var a = avail();
      var v = { web: a, mkt: Math.max(0, a - SAFE), dl: a };
      root.querySelectorAll('.ch').forEach(function (c) {
        c.querySelector('b').textContent = v[c.dataset.ch];
        if (flash) { c.classList.add('flash'); setTimeout(function () { c.classList.remove('flash'); }, 600); }
      });
      meta.textContent = 'Đang giữ tạm: ' + S.soft + ' · Đã chốt cho khách: ' + S.hard + ' · Tồn thực tế: ' + S.onhand;
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var act = b.dataset.act, a = avail();
      if (act === 'hold') {
        if (a > 0) { S.soft++; log.textContent = 'Khách bấm đặt: 1 chiếc được giữ tạm 15 phút. Số tồn trên mọi kênh giảm ngay.'; }
        else { log.textContent = 'Hết hàng khả dụng: website hiện "tạm hết", không bán vượt tồn.'; }
      } else if (act === 'pay') {
        if (S.soft > 0) { S.soft--; S.hard++; log.textContent = 'Thanh toán xong: hàng chuyển sang giữ chắc đến khi xuất kho.'; }
        else { log.textContent = 'Chưa có lượt giữ tạm nào để thanh toán.'; }
      } else if (act === 'expire') {
        if (S.soft > 0) { S.soft--; log.textContent = 'Khách bỏ giỏ, hết 15 phút: hàng tự trả lại, mọi kênh bán tiếp được.'; }
        else { log.textContent = 'Không có lượt giữ tạm nào đang chờ.'; }
      } else if (act === 'mkt') {
        if (a - SAFE > 0) { S.hard++; log.textContent = 'Đơn Shopee đổ về: giữ hàng ngay, số trên website và đại lý cũng giảm theo.'; }
        else { log.textContent = 'Sàn đã ngừng nhận đơn để giữ 2 chiếc an toàn: không bán vượt tồn do độ trễ của sàn.'; }
      } else if (act === 'reset') {
        S = { onhand: 10, soft: 0, hard: 0 }; log.textContent = 'Đã làm lại: còn 10 chiếc trong kho.';
      }
      render(act !== 'reset');
    });
    render(false);
  }

  /* ---------- Flip cards ---------- */
  function initFlips() {
    document.querySelectorAll('.flip').forEach(function (f) {
      function toggle() { f.classList.toggle('on'); }
      f.addEventListener('click', toggle);
      f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggle(); } });
    });
  }

  /* ---------- Cash calculator ---------- */
  function initCalc() {
    var root = document.getElementById('cash-calc');
    if (!root) return;
    var $ = function (id) { return document.getElementById(id); };
    var fmt = function (n, d) { return n.toLocaleString('vi-VN', { maximumFractionDigits: d || 0, minimumFractionDigits: d || 0 }); };
    root.addEventListener('keydown', function (e) { e.stopPropagation(); });
    function num(id) { var v = parseFloat($(id).value); return isFinite(v) && v > 0 ? v : 0; }
    function update() {
      var cogs = num('cogs'), rev = num('rev');
      var dioNow = +$('dio-now').value, dioGoal = +$('dio-goal').value;
      var dsoNow = +$('dso-now').value, dsoGoal = +$('dso-goal').value;
      $('dio-now-o').textContent = dioNow + ' ngày';
      $('dio-goal-o').textContent = dioGoal + ' ngày';
      $('dso-now-o').textContent = dsoNow + ' ngày';
      $('dso-goal-o').textContent = dsoGoal + ' ngày';
      $('dio-err').textContent = dioGoal > dioNow ? 'Mục tiêu đang cao hơn hiện tại, phần này tính bằng 0' : '';
      $('dso-err').textContent = dsoGoal > dsoNow ? 'Mục tiêu đang cao hơn hiện tại, phần này tính bằng 0' : '';
      var perInv = cogs / 365, perAr = rev / 365;
      var inv = Math.round(Math.max(0, dioNow - dioGoal) * perInv);
      var ar = Math.round(Math.max(0, dsoNow - dsoGoal) * perAr);
      var total = inv + ar;
      $('total').textContent = fmt(total);
      $('v-inv').textContent = fmt(inv) + ' tỷ';
      $('v-ar').textContent = fmt(ar) + ' tỷ';
      var max = Math.max(inv, ar, 1);
      $('bar-inv').style.width = (inv / max * 100) + '%';
      $('bar-ar').style.width = (ar / max * 100) + '%';
      $('per').textContent = 'Mỗi ngày tồn kho giảm được ≈ ' + fmt(perInv, 1) + ' tỷ. Mỗi ngày thu tiền nhanh hơn ≈ ' + fmt(perAr, 1) + ' tỷ.';
    }
    root.querySelectorAll('input').forEach(function (el) { el.addEventListener('input', update); });
    update();
  }


  /* ---------- 14B: 3D data-flow simulation (three modes) ---------- */
  var flowActive = false;
  function initFlow3d() {
    var host = document.getElementById('flow3d');
    if (!host || typeof THREE === 'undefined') return;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); }
    catch (e) { host.classList.add('nogl'); return; }
    var W = 1136, H = 350;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    var stage = host.querySelector('.f3-stage');
    stage.insertBefore(renderer.domElement, stage.firstChild);

    var BLUE = 0x0057A9, SKY = 0x277CBE, RED = 0xD53F59, GREY = 0x6D6E71;
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(31, W / H, 0.1, 200);
    var LOOK = new THREE.Vector3(0.0, -1.1, -0.9);
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    var dl = new THREE.DirectionalLight(0xffffff, 0.65); dl.position.set(-5, 10, 8); scene.add(dl);
    var grid = new THREE.GridHelper(44, 44, 0xC6D5E4, 0xDCE5EE); grid.position.y = -1.9; scene.add(grid);

    function grow(obj) { obj.userData.s = 0; obj.userData.want = 0; obj.scale.setScalar(0.001); obj.visible = false; return obj; }

    /* --- ERP: ledger tower --- */
    var P = { erp: new THREE.Vector3(-10.2, 0, 0.2), hub: new THREE.Vector3(-5.4, 0.1, 1.4), cache: new THREE.Vector3(-0.8, 0.1, 4.2),
              lake: new THREE.Vector3(0.6, -1.55, -4.2), rep: new THREE.Vector3(6.6, -1.0, -7.2) };
    var erpMat = new THREE.MeshStandardMaterial({ color: GREY, roughness: 0.6, metalness: 0.08 });
    var erp = new THREE.Group(); erp.position.copy(P.erp); scene.add(erp);
    erp.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.2, 2.2), erpMat));
    for (var s = 0; s < 4; s++) {
      var sh = new THREE.Mesh(new THREE.BoxGeometry(2.34, 0.08, 2.34), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      sh.position.y = -1.1 + s * 0.72; erp.add(sh);
    }
    var halo = new THREE.Mesh(new THREE.SphereGeometry(2.5, 24, 18), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0 }));
    erp.add(halo);

    /* --- Layer 1: the other source systems, grouped behind NetSuite --- */
    var srcPos = [new THREE.Vector3(-10.9, -1.35, 3.3), new THREE.Vector3(-9.3, -1.35, 3.3),
                  new THREE.Vector3(-10.9, -1.35, 4.6), new THREE.Vector3(-9.3, -1.35, 4.6)];
    var srcBoxes = srcPos.map(function (p, i) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.6, 0.9),
        new THREE.MeshStandardMaterial({ color: [0x8E99A6, 0x7B8794, 0x9AA6B3, 0x86919D][i], roughness: 0.6 }));
      m.position.copy(p); scene.add(m);
      var top = new THREE.Mesh(new THREE.BoxGeometry(1.17, 0.05, 0.92), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      top.position.set(p.x, p.y + 0.12, p.z); scene.add(top);
      return m;
    });

    /* --- Layer 2: the connector hub (always present) --- */
    var hub = new THREE.Group(); hub.position.copy(P.hub); scene.add(hub);
    var hubCore = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 2.0, 6),
      new THREE.MeshStandardMaterial({ color: SKY, roughness: 0.35, metalness: 0.2, transparent: true, opacity: 0.9 }));
    hub.add(hubCore);
    hub.add(new THREE.LineSegments(new THREE.EdgesGeometry(hubCore.geometry), new THREE.LineBasicMaterial({ color: 0xD6E8F7 })));
    var hubRings = [];
    for (var hr = 0; hr < 2; hr++) {
      var hrg = new THREE.Mesh(new THREE.TorusGeometry(1.15 + hr * 0.3, 0.025, 6, 40),
        new THREE.MeshBasicMaterial({ color: SKY, transparent: true, opacity: 0.45 - hr * 0.15 }));
      hrg.rotation.x = Math.PI / 2; hrg.position.y = -0.6 + hr * 1.2; hub.add(hrg); hubRings.push(hrg);
    }

    /* --- Data lake: layered pool (raw / clean / serve) --- */
    var lake = grow(new THREE.Group()); lake.position.copy(P.lake); scene.add(lake);
    var lakeMat = new THREE.MeshStandardMaterial({ color: SKY, transparent: true, opacity: 0.32, roughness: 0.2, metalness: 0.1 });
    var lakeBody = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.5, 56), lakeMat); lake.add(lakeBody);
    var layers = [];
    for (var L = 0; L < 3; L++) {
      var d = new THREE.Mesh(new THREE.CylinderGeometry(3.2 - L * 0.65, 3.2 - L * 0.65, 0.06, 48),
        new THREE.MeshStandardMaterial({ color: [0x9EC3E4, 0x5FA0D6, BLUE][L], transparent: true, opacity: 0.75 }));
      d.position.y = 0.3 + L * 0.2; lake.add(d); layers.push(d);
    }
    var ripples = [];
    for (var r = 0; r < 3; r++) {
      var rg = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 6, 56), new THREE.MeshBasicMaterial({ color: SKY, transparent: true, opacity: 0 }));
      rg.rotation.x = Math.PI / 2; rg.position.y = 0.32; lake.add(rg); ripples.push({ m: rg, t: 1 });
    }

    /* --- Fast read layer --- */
    var cache = grow(new THREE.Group()); cache.position.copy(P.cache); scene.add(cache);
    var slab = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.9, 3.6),
      new THREE.MeshStandardMaterial({ color: BLUE, roughness: 0.28, metalness: 0.3 }));
    cache.add(slab);
    cache.add(new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry), new THREE.LineBasicMaterial({ color: 0xBBD8F2 })));
    var spinners = [];
    for (var c = 0; c < 3; c++) {
      var ring = new THREE.Mesh(new THREE.TorusGeometry(1.35 + c * 0.38, 0.03, 8, 48),
        new THREE.MeshBasicMaterial({ color: SKY, transparent: true, opacity: 0.55 - c * 0.15 }));
      ring.rotation.y = Math.PI / 2; ring.userData.sp = 0.6 + c * 0.3; cache.add(ring); spinners.push(ring);
    }

    /* --- Reports / AI consumer (behind the lake) --- */
    var rep = grow(new THREE.Group()); rep.position.copy(P.rep); scene.add(rep);
    rep.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 1.4), new THREE.MeshStandardMaterial({ color: 0xffffff })));
    [0.5, 0.9, 1.3].forEach(function (hgt, i) {
      var bar = new THREE.Mesh(new THREE.BoxGeometry(0.32, hgt, 0.32), new THREE.MeshStandardMaterial({ color: [SKY, BLUE, RED][i] }));
      bar.position.set(-0.5 + i * 0.5, 0.12 + hgt / 2, 0); rep.add(bar);
    });

    /* --- Sales channels (front right) --- */
    var satPos = [new THREE.Vector3(8.0, 1.2, 0.8), new THREE.Vector3(8.9, 0.2, 2.9),
                  new THREE.Vector3(7.6, -0.7, 2.2), new THREE.Vector3(8.5, -1.0, 4.8)];
    var satCols = [SKY, BLUE, GREY, RED];
    var sats = satPos.map(function (p, i) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 1.4),
        new THREE.MeshStandardMaterial({ color: satCols[i], roughness: 0.5, emissive: 0x000000 }));
      m.position.copy(p); scene.add(m); m.userData.flash = 0; m.userData.base = satCols[i]; return m;
    });
    var satCentre = new THREE.Vector3(7.65, 0.05, 2.0);

    /* --- Curved routes, drawn faintly so the path is visible --- */
    function curve(a, b, lift) {
      var mid = a.clone().lerp(b, 0.5); mid.y += lift;
      return new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone());
    }
    var routes = { direct: [], lake: [], cache: [] };
    function route(mode, a, b, lift, color, dashed) {
      var cv = curve(a, b, lift);
      var geo = new THREE.BufferGeometry().setFromPoints(cv.getPoints(40));
      var mat = dashed ? new THREE.LineDashedMaterial({ color: color, dashSize: 0.35, gapSize: 0.25, transparent: true, opacity: 0 })
                       : new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0 });
      var line = new THREE.Line(geo, mat); if (dashed) line.computeLineDistances();
      scene.add(line); routes[mode].push(line); return cv;
    }
    var erpIn = P.erp.clone().add(new THREE.Vector3(1.0, 0, 0));
    var hubIn = P.hub.clone();
    var lakeTop = P.lake.clone().add(new THREE.Vector3(0, 0.6, 0));
    var cacheIn = P.cache.clone();
    var repIn = P.rep.clone().add(new THREE.Vector3(0, 0.6, 0));
    var C = { direct: [], lakeQ: [], cacheQ: [] };
    satPos.forEach(function (sp) {
      C.direct.push(route('direct', sp, hubIn, 2.4, RED, false));
      C.lakeQ.push(route('lake', sp, hubIn, 2.0, RED, false));
      C.cacheQ.push(route('cache', sp, cacheIn, 0.9, SKY, false));
    });
    var cHubErp = route('direct', hubIn, erpIn, 1.4, RED, false);
    var cSrcLake = srcPos.map(function (sp) { return route('lake', sp, hubIn, 1.6, GREY, true); });
    var cSrcCache = srcPos.map(function (sp) { return route('cache', sp, hubIn, 1.6, SKY, false); });
    var cErpHub = route('lake', erpIn, hubIn, 1.2, GREY, true);
    var cErpHub2 = route('cache', erpIn, hubIn, 1.2, BLUE, false);
    var cBatchLake = route('lake', hubIn, lakeTop, 1.5, GREY, true);
    var cBatchCache = route('cache', hubIn, lakeTop, 1.5, GREY, true);
    var cEvents = route('cache', hubIn, cacheIn, 1.0, BLUE, false);
    var cRepLake = route('lake', lakeTop, repIn, 1.0, SKY, false);
    var cRepCache = route('cache', lakeTop, repIn, 1.0, SKY, false);

    /* --- Particles --- */
    var pgeo = new THREE.SphereGeometry(0.12, 10, 8);
    var MAT = {
      red: new THREE.MeshBasicMaterial({ color: RED }), grey: new THREE.MeshBasicMaterial({ color: 0x8A8C90 }),
      blue: new THREE.MeshBasicMaterial({ color: BLUE }), sky: new THREE.MeshBasicMaterial({ color: SKY }),
      batch: new THREE.MeshBasicMaterial({ color: 0x9EC3E4 })
    };
    var pool = [];
    for (var i = 0; i < 420; i++) { var pm = new THREE.Mesh(pgeo, MAT.sky); pm.visible = false; scene.add(pm); pool.push({ m: pm, live: false }); }
    function fire(cv, dur, mat, size, delay, onEnd) {
      for (var i = 0; i < pool.length; i++) {
        var p = pool[i]; if (p.live) continue;
        p.live = true; p.cv = cv; p.t = -(delay || 0) / dur; p.dur = dur; p.end = onEnd || null;
        p.m.material = mat; p.m.scale.setScalar(size || 1); p.m.visible = false; return;
      }
    }

    /* --- Labels that follow 3D objects --- */
    var tags = {};
    host.querySelectorAll('.f3-tag').forEach(function (t) { tags[t.dataset.k] = t; });
    var anchors = {
      erp: P.erp.clone().add(new THREE.Vector3(0, 2.4, 0)), src2: new THREE.Vector3(-6.6, -1.2, 5.2), hub: P.hub.clone().add(new THREE.Vector3(0, 1.9, 0)),
      lake: P.lake.clone().add(new THREE.Vector3(2.6, -1.1, 2.0)),
      cache: P.cache.clone().add(new THREE.Vector3(0, -1.5, 2.4)), sats: new THREE.Vector3(10.4, 2.6, 0.8),
      rep: P.rep.clone().add(new THREE.Vector3(-0.6, 1.1, 2.2)), stale: new THREE.Vector3(6.2, -1.9, 5.6)
    };
    var VIS = {
      direct: { erp: 1, src2: 1, sats: 1, hub: 1 }, lake: { erp: 1, src2: 1, sats: 1, hub: 1, lake: 1, rep: 1, stale: 1 },
      cache: { erp: 1, src2: 1, sats: 1, hub: 1, lake: 1, rep: 1, cache: 1 }
    };
    function placeTags() {
      Object.keys(tags).forEach(function (k) {
        var v = anchors[k].clone().project(cam);
        tags[k].style.left = ((v.x + 1) / 2 * W) + 'px';
        tags[k].style.top = ((1 - v.y) / 2 * H) + 'px';
        tags[k].style.opacity = VIS[MODE][k] ? '1' : '0';
      });
    }

    /* --- HUD + modes --- */
    var MODE = 'direct';
    var noteEl = document.getElementById('f3-note');
    var M = {
      direct: { load: 94, rt: 420, rtTxt: function (v) { return Math.round(v) + ' ms'; }, fresh: 'Tức thì', freshP: 4, hold: 'Có, ERP gánh', holdP: 60,
        tone: ['hot', 'hot', 'okk', 'mid'], cls: 'bad',
        note: '<b>Hôm nay, hỏi thẳng ERP:</b> số liệu mới, nhưng mỗi cú bấm của khách đi qua lớp kết nối rồi vào thẳng NetSuite. Mùa sale hàng nghìn lượt mỗi giây dồn vào hệ thống ghi sổ: chậm, chạm giới hạn gọi API, và sớm phải nâng bậc dịch vụ.' },
      lake: { load: 12, rt: 2400, rtTxt: function (v) { return (v / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' giây'; }, fresh: 'Vài phút – vài giờ', freshP: 92, hold: 'Không', holdP: 96,
        tone: ['okk', 'hot', 'hot', 'hot'], cls: 'mid',
        note: '<b>Chỉ có Data Lake:</b> ERP được giải tỏa, nhưng NetSuite và các nguồn khác chỉ đổ dữ liệu vào hồ theo từng đợt. Giữa hai đợt, lớp 4 đọc số đã cũ: mỗi truy vấn mất vài giây: không có cơ chế giữ hàng. Mùa sale sẽ bán vượt tồn.' },
      cache: { load: 7, rt: 8, rtTxt: function (v) { return Math.max(1, Math.round(v)) + ' ms'; }, fresh: 'Dưới 60 giây', freshP: 6, hold: 'Có, ngay khi đặt', holdP: 4,
        tone: ['okk', 'okk', 'okk', 'okk'], cls: '',
        note: '<b>Data Lake cộng lớp dữ liệu thời gian thực:</b> Data Lake vẫn nhận theo lô và nuôi báo cáo, AI ở phía sau. NetSuite và các nguồn khác đẩy từng thay đổi qua lớp kết nối vào lớp 3A: lớp 4 hỏi lớp 3A. Cùng ERP, cùng Data Lake, chỉ thêm một làn.' }
    };
    var hud = { load: document.getElementById('f3-load'), rt: document.getElementById('f3-rt'),
                fresh: document.getElementById('f3-fresh'), hold: document.getElementById('f3-hold') };
    var shown = { load: 94, rt: 420 };
    function tone(el, t) { el.classList.remove('hot', 'mid', 'okk'); if (t) el.classList.add(t); }
    function setMode(m) {
      MODE = m;
      host.querySelectorAll('.f3-ctl button').forEach(function (b) { b.classList.toggle('on', b.dataset.mode === m); });
      noteEl.innerHTML = M[m].note; noteEl.className = 'f3-note ' + M[m].cls;
      lake.userData.want = (m === 'lake' || m === 'cache') ? 1 : 0;
      rep.userData.want = lake.userData.want;
      cache.userData.want = m === 'cache' ? 1 : 0;
      hud.fresh.querySelector('b').textContent = M[m].fresh; hud.fresh.querySelector('.bar i').style.width = M[m].freshP + '%';
      hud.hold.querySelector('b').textContent = M[m].hold; hud.hold.querySelector('.bar i').style.width = M[m].holdP + '%';
      [hud.load, hud.rt, hud.fresh, hud.hold].forEach(function (el, i) { tone(el, M[m].tone[i]); });
      batchT = 0.4;
    }
    host.querySelectorAll('.f3-ctl button').forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.dataset.mode); });
      b.addEventListener('keydown', function (e) { e.stopPropagation(); });
    });

    var acc = 0, evAcc = 0, repAcc = 0, srcAcc = 0, batchT = 0, staleT = 0, heat = 1, last = performance.now(), t0 = last;
    var tmp = new THREE.Vector3();
    setMode('direct');

    function animate(now) {
      requestAnimationFrame(animate);
      if (!flowActive && !isPrint) { last = now; return; }
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      var T = (now - t0) / 1000;

      /* gentle camera sway for depth */
      cam.position.set(0.3 + Math.sin(T * 0.16) * 1.1, 9.4 + Math.sin(T * 0.11) * 0.25, 16.8);
      cam.lookAt(LOOK);

      /* grow / shrink optional objects */
      [lake, cache, rep].forEach(function (o) {
        o.userData.s += (o.userData.want - o.userData.s) * Math.min(1, dt * 4.5);
        o.visible = o.userData.s > 0.02; o.scale.setScalar(Math.max(0.001, o.userData.s));
      });
      Object.keys(routes).forEach(function (k) {
        routes[k].forEach(function (l) {
          var want = k === MODE ? (l.material.isLineDashedMaterial ? 0.55 : 0.22) : 0;
          l.material.opacity += (want - l.material.opacity) * Math.min(1, dt * 4);
        });
      });
      spinners.forEach(function (r) { r.rotation.x += dt * r.userData.sp; });
      hubRings.forEach(function (r, i) { r.rotation.z += dt * (0.8 + i * 0.4); });
      hubCore.rotation.y += dt * 0.5;
      layers.forEach(function (d, i) { d.rotation.y += dt * (0.1 + i * 0.05); });

      /* traffic */
      acc += dt;
      var every = MODE === 'cache' ? 0.03 : 0.07;
      while (acc > every) {
        acc -= every;
        var k = (Math.random() * satPos.length) | 0;
        if (MODE === 'direct') fire(C.direct[k], 1.1, MAT.red, 1.25, 0, function () { fire(cHubErp, 0.9, MAT.red, 1.25); });
        else if (MODE === 'lake') fire(C.lakeQ[k], 1.3, MAT.grey, 1.05, 0, function () { fire(cBatchLake, 1.2, MAT.grey, 1.05); });
        else fire(C.cacheQ[k], 0.55, MAT.sky, 0.95);
      }
      /* batch loads into the lake: bursts every few seconds */
      if (MODE !== 'direct') {
        batchT -= dt;
        if (batchT <= 0) {
          batchT = MODE === 'lake' ? 4.2 : 3.6;
          var cv2 = MODE === 'lake' ? cBatchLake : cBatchCache;
          for (var b = 0; b < 20; b++) fire(cErpHub, 0.9, MAT.batch, 1.15, b * 0.03,
            (function (last) { return function () { fire(cv2, 1.1, MAT.batch, 1.15, 0, last ? splash : null); }; })(b === 19));
        }
        repAcc += dt;
        while (repAcc > 0.45) { repAcc -= 0.45; fire(MODE === 'lake' ? cRepLake : cRepCache, 1.2, MAT.sky, 0.85); }
      }
      if (MODE !== 'direct') {
        srcAcc += dt;
        while (srcAcc > 0.35) {
          srcAcc -= 0.35;
          var si = (Math.random() * srcPos.length) | 0;
          if (MODE === 'lake') fire(cSrcLake[si], 1.0, MAT.batch, 1.0, 0, function () { fire(cBatchLake, 1.1, MAT.batch, 1.0); });
          else fire(cSrcCache[si], 0.8, MAT.sky, 1.0, 0, function () { if (Math.random() < 0.5) fire(cEvents, 0.5, MAT.blue, 1.0); else fire(cBatchCache, 1.0, MAT.batch, 1.0); });
        }
      }
      if (MODE === 'cache') {
        evAcc += dt;
        while (evAcc > 0.16) { evAcc -= 0.16; fire(cErpHub2, 0.65, MAT.blue, 1.15, 0, function () { fire(cEvents, 0.5, MAT.blue, 1.15); }); }
      }
      /* stale reads cause oversell flashes */
      if (MODE === 'lake') {
        staleT -= dt;
        if (staleT <= 0) { staleT = 0.7 + Math.random() * 0.9; sats[(Math.random() * sats.length) | 0].userData.flash = 1; }
      }
      sats.forEach(function (sm) {
        sm.userData.flash = Math.max(0, sm.userData.flash - dt * 1.8);
        sm.material.emissive.setRGB(sm.userData.flash * 0.85, 0, sm.userData.flash * 0.1);
        sm.position.y = satPos[sats.indexOf(sm)].y + Math.sin(T * 1.4 + sats.indexOf(sm)) * 0.05;
      });

      /* move particles along their curves */
      pool.forEach(function (p) {
        if (!p.live) return;
        p.t += dt / p.dur;
        if (p.t < 0) return;
        if (p.t >= 1) { p.live = false; p.m.visible = false; if (p.end) p.end(); return; }
        p.cv.getPoint(p.t, tmp); p.m.position.copy(tmp); p.m.visible = true;
      });

      /* ripples on the lake surface after each batch */
      ripples.forEach(function (rp) {
        rp.t = Math.min(1, rp.t + dt * 0.7);
        rp.m.scale.setScalar(0.4 + rp.t * 2.6); rp.m.material.opacity = (1 - rp.t) * 0.7;
      });

      /* ERP heat */
      var hTarget = MODE === 'direct' ? 1 : (MODE === 'lake' ? 0.14 : 0.08);
      heat += (hTarget - heat) * Math.min(1, dt * 1.3);
      erpMat.color.setHex(GREY).lerp(new THREE.Color(RED), heat * 0.9);
      halo.material.opacity = heat * 0.12;
      halo.scale.setScalar(1 + Math.sin(now / 220) * 0.035 * heat);

      /* HUD easing */
      shown.load += (M[MODE].load - shown.load) * Math.min(1, dt * 1.8);
      shown.rt += (M[MODE].rt - shown.rt) * Math.min(1, dt * 1.8);
      hud.load.querySelector('b').textContent = Math.round(shown.load) + '%';
      hud.load.querySelector('.bar i').style.width = Math.max(3, shown.load) + '%';
      hud.rt.querySelector('b').textContent = M[MODE].rtTxt(shown.rt);
      hud.rt.querySelector('.bar i').style.width = Math.max(3, Math.min(100, Math.log10(Math.max(1, shown.rt)) / Math.log10(2400) * 100)) + '%';

      placeTags();
      renderer.render(scene, cam);
    }
    function splash() { var i = ripples.findIndex(function (r) { return r.t >= 1; }); if (i < 0) i = 0; ripples[i].t = 0; }
    requestAnimationFrame(animate);
  }


  /* ---------- Slide 5: inline cash calculator ---------- */
  function initCalc5() {
    var root = document.getElementById('calc5'); if (!root) return;
    var $ = function (id) { return document.getElementById(id); };
    var D = { 'c5-rev': 1200, 'c5-cogs': 920, 'c5-dio': 110, 'c5-dio-t': 80, 'c5-dso': 55, 'c5-dso-t': 40, 'c5-rate': 9 };
    var fmt = function (n, d) { return n.toLocaleString('vi-VN', { maximumFractionDigits: d || 0, minimumFractionDigits: d || 0 }); };
    var num = function (id) { var v = parseFloat($(id).value); return isFinite(v) && v > 0 ? v : 0; };
    var last = null;
    function flash(el) { el.classList.add('flash'); setTimeout(function () { el.classList.remove('flash'); }, 500); }
    function update(anim) {
      var rev = num('c5-rev'), cogs = num('c5-cogs');
      var dio = num('c5-dio'), dioT = num('c5-dio-t'), dso = num('c5-dso'), dsoT = num('c5-dso-t');
      var pInv = cogs / 365, pAr = rev / 365;
      var inv = Math.round(Math.max(0, dio - dioT) * pInv), ar = Math.round(Math.max(0, dso - dsoT) * pAr);
      $('c5-inv').textContent = '≈ ' + fmt(inv) + ' tỷ';
      $('c5-ar').textContent = '≈ ' + fmt(ar) + ' tỷ';
      $('c5-inv-s').textContent = dio > dioT ? 'giảm tồn từ ' + fmt(dio) + ' xuống ' + fmt(dioT) + ' ngày' : 'tồn kho đã ở mức mục tiêu';
      $('c5-ar-s').textContent = dso > dsoT ? 'thu tiền nhanh hơn, từ ' + fmt(dso) + ' xuống ' + fmt(dsoT) + ' ngày' : 'thu tiền đã ở mức mục tiêu';
      $('c5-total').textContent = '≈ ' + fmt(inv + ar) + ' tỷ';
      var rate = parseFloat($('c5-rate').value); if (!isFinite(rate) || rate < 0) rate = 0;
      var yr = (inv + ar) * rate / 100 + inv * 0.05;
      $('c5-yr').textContent = '+ ≈ ' + fmt(yr) + ' tỷ mỗi năm';
      $('c5-per').textContent = 'Mỗi ngày tồn kho giảm được ≈ ' + fmt(pInv, 1) + ' tỷ · mỗi ngày thu tiền nhanh hơn ≈ ' + fmt(pAr, 1) + ' tỷ';
      var key = inv + '|' + ar;
      if (anim && key !== last) { flash($('c5-inv')); flash($('c5-ar')); }
      last = key;
    }
    root.querySelectorAll('input').forEach(function (el) {
      el.addEventListener('input', function () { update(true); });
      el.addEventListener('keydown', function (e) { e.stopPropagation(); });
    });
    $('c5-reset').addEventListener('click', function () { Object.keys(D).forEach(function (k) { $(k).value = D[k]; }); update(true); });
    $('c5-reset').addEventListener('keydown', function (e) { e.stopPropagation(); });
    update(false);
  }


  /* ---------- Action board: CEO can re-prioritise ---------- */
  function initActions() {
    var body = document.getElementById('ab-body'); if (!body) return;
    var A = [
      ['Tồn kho chôn vốn', 'Dashboard tồn kho, danh sách hàng chậm để xả', '60 ngày đầu|ngày 41–60', 1, '', 'Tồn kho 110 → 95 ngày ở tháng 18'],
      ['Công nợ đại lý quá hạn', 'Dashboard công nợ, hạn mức hiện trên ứng dụng bán hàng', 'Giai đoạn 1|3–6 tháng', 1, 'hạn mức công nợ', 'Thu tiền 55 → 48 ngày ở tháng 18'],
      ['Bán vượt tồn, mỗi kênh một số', 'Lớp kết nối, lớp thời gian thực, trung tâm tồn kho', 'Giai đoạn 1 → 2|3–9 tháng', 1, 'quy tắc chia hàng', 'Bán vượt tồn < 0,5%, tồn cập nhật < 60 giây'],
      ['Mã và số liệu không khớp', 'Quản trị dữ liệu, mã duy nhất, Data Champion', 'Giai đoạn 1|0–6 tháng', 1, '', 'Điểm chất lượng dữ liệu ≥ 95%'],
      ['Lừa đảo email, chưa biết lỗ hổng', 'Bảo mật email lãnh đạo, đào tạo, kiểm thử xâm nhập', '60 ngày đầu|tuần 1–8', 1, '', 'Báo cáo lỗ hổng, tỷ lệ bấm link giả giảm'],
      ['Website nội dung cũ, 0 đánh giá', 'Gỡ nội dung cũ, nhắn xin đánh giá sau giao hàng', '60 ngày đầu|tuần 2–6', 1, '', 'Hết link hỏng, sản phẩm có đánh giá thật'],
      ['Chi phí NetSuite có thể tăng', 'Xác nhận bậc dịch vụ, giấy phép', '60 ngày đầu|tuần 1', 1, '', 'Không nâng bậc ngoài kế hoạch'],
      ['Website chậm', 'Đo 2–6 tuần, rồi chọn phương án Haravan', 'Giai đoạn 1|1–6 tháng', 2, '', 'Quyết nền tảng bằng số đo tốc độ, lỗi'],
      ['CRM có đủ cho 3 năm?', 'Đánh giá: giữ, nâng cấp hay thay', '60 ngày đầu|2–6 tuần', 2, '', 'Quyết giữ, nâng cấp hay thay có số liệu'],
      ['Năng suất, chất lượng CSKH', 'AI hằng ngày, agent chấm chất lượng, hỏi NetSuite', '60 ngày đầu|tuần 1–8', 2, '', '100% hội thoại được chấm, % nhân viên dùng AI'],
      ['Báo cáo rời rạc, nhiều con số', 'Data Lake, dashboard mọi phòng ban', 'Giai đoạn 1 → 2|3–12 tháng', 2, '', 'Một bộ số chung, số file Excel đã tắt'],
      ['Khách mua qua đại lý vô danh', 'Hồ sơ khách định danh, thử 2–3 việc kích hoạt', 'Giai đoạn 2|6–18 tháng', 2, '', '800.000 khách định danh ở năm 2'],
      ['Thiếu, dư hàng theo mùa', 'AI dự báo, gợi ý bán kèm, agent bảo hành', 'Giai đoạn 2|6–18 tháng', 2, '', '4% doanh thu online từ gợi ý AI ở năm 2'],
      ['Phá giá trên sàn, xung đột kênh', 'Quét mã xuất kho, giám sát giá sàn, cổng đại lý', 'Giai đoạn 2|6–18 tháng', 2, 'giá sàn, hoa hồng đại lý', 'Biết lô phá giá trong vài phút'],
      ['Mở rộng quốc tế', 'Chọn mô hình, khung nhân bản, pháp lý dữ liệu', 'Giai đoạn 2 → 3|12–36 tháng', 3, 'thị trường, mô hình mở rộng', 'Mở nước mới đúng mô hình, đúng pháp lý'],
      ['Mua CDP, mini app Zalo, DLP', 'Quyết theo số đo, khi quy mô đòi hỏi', 'Giai đoạn 3|từ tháng 18', 3, 'ngân sách theo số đo', 'Chỉ chi khi số đo chứng minh lợi ích']
    ];
    var cur = A.map(function (r) { return r[3]; });
    function render() {
      var idx = A.map(function (r, i) { return i; }).sort(function (a, b) { return (cur[a] - cur[b]) || (a - b); });
      body.innerHTML = '';
      idx.forEach(function (i, k) {
        var r = A[i], p = cur[i], chg = p !== r[3];
        var tr = document.createElement('tr'); if (chg) tr.className = 'chg';
        var dec = r[4] ? ' <em class="flag" title="Cần Ban Lãnh đạo chốt: ' + r[4] + '">⚑</em>' : '';
        tr.innerHTML = '<td class="n">' + (k + 1) + '</td><td class="p">' + r[0] + '</td><td>' + r[1] + dec + '</td><td class="t"><b>' + r[2].split('|')[0] + '</b> <small>· ' + r[2].split('|')[1] + '</small>' +
          '</td><td><button type="button" class="pri p' + p + '" data-i="' + i + '">P' + p + '</button>' + (chg ? '<span class="old">từ P' + r[3] + '</span>' : '') +
          '</td><td class="d">' + r[5] + '</td>';
        body.appendChild(tr);
      });
      [1, 2, 3].forEach(function (n) {
        document.getElementById('ab-c' + n).textContent = 'P' + n + ' · ' + cur.filter(function (x) { return x === n; }).length;
      });
    }
    body.addEventListener('click', function (e) {
      var b = e.target.closest('.pri'); if (!b) return;
      var i = +b.dataset.i; cur[i] = cur[i] % 3 + 1; render();
      var nb = body.querySelector('.pri[data-i="' + i + '"]'); if (nb) nb.focus();
    });
    body.addEventListener('keydown', function (e) { e.stopPropagation(); });
    var rs = document.getElementById('ab-reset');
    rs.addEventListener('click', function () { cur = A.map(function (r) { return r[3]; }); render(); });
    rs.addEventListener('keydown', function (e) { e.stopPropagation(); });
    render();
  }

  initCalc();
  initActions();
  initCalc5();
  initSim();
  initFlips();
  initHero();
  initFlow3d();

  document.querySelectorAll('.stage').forEach(buildLinks);


  /* ---------- Presentation flow: tracker in footer + map overlay (key M) ---------- */
  var FLOW = [
    { name: 'Mở đầu', rq: 0, rqt: 'Mở đầu', msg: 'Ba đề xuất, một điều kiện. Vì sao tin đề xuất này' },
    { name: 'Bài toán', rq: 0, rqt: 'Bối cảnh', msg: 'Quy mô gấp 4. Ba câu hỏi CEO, ≈ 125 tỷ đang kẹt. 8 hệ thống rời rạc' },
    { name: 'Kiến trúc MIS và dữ liệu', rq: 1, rqt: 'Yêu cầu 1', msg: 'Bốn lớp, Data Lake và lớp thời gian thực, website, quản trị dữ liệu, dashboard' },
    { name: 'Khách hàng, AI, an toàn thông tin', rq: 1, rqt: 'Yêu cầu 1', msg: 'CRM và CDP đo trước, AI ngắn và dài hạn, Phòng ban số, bảo mật hai tầng' },
    { name: 'Quốc tế và lộ trình', rq: 1, rqt: 'Yêu cầu 1', msg: 'Chọn mô hình trước. Lộ trình 3 năm, đạt kết quả mới đi tiếp' },
    { name: 'KPI', rq: 2, rqt: 'Yêu cầu 2', msg: '13 KPI, 4 nhóm, chấm điểm tăng dần theo năm' },
    { name: 'Nguồn lực và ngân sách', rq: 3, rqt: 'Yêu cầu 3', msg: '8 lên 11 người, ≈ 14 tỷ năm 1, hai phương án, cơ chế cả công ty' },
    { name: 'Triển khai và chốt', rq: 3, rqt: 'Yêu cầu 3', msg: 'Rủi ro, 60 ngày đầu, ủng hộ của Ban Lãnh đạo, chốt ưu tiên' },
    { name: 'Kết', rq: 0, rqt: 'Kết', msg: 'Cam kết hai chiều, hỏi đáp' },
    { name: 'Phụ lục', rq: 0, rqt: 'Hỏi đáp', msg: 'Nguồn số liệu, chi phí NetSuite, khung an toàn thông tin, tự làm hay mua, lộ trình theo quý' }
  ];
  var slidesAll = [].slice.call(document.querySelectorAll('.reveal .slides > section'));
  var stepOf = [], cur = 0;
  slidesAll.forEach(function (s, i) { var f = s.getAttribute('data-flow'); if (f) cur = +f - 1; stepOf[i] = cur; });
  FLOW.forEach(function (st, k) {
    var idx = stepOf.map(function (v, i) { return v === k ? i : -1; }).filter(function (i) { return i >= 0; });
    st.first = idx[0]; st.last = idx[idx.length - 1];
  });
  var MAIN = 9;
  slidesAll.forEach(function (s, i) {
    var k = stepOf[i];
    var note = s.querySelector('aside.notes');
    if (note) note.insertAdjacentHTML('afterbegin', '<p><b>Vị trí trong bài: bước ' + (k + 1) + '/' + FLOW.length + ' · ' + FLOW[k].name + '</b> (slide ' + (FLOW[k].first + 1) + '–' + (FLOW[k].last + 1) + ')</p>');
    var foot = s.querySelector(':scope > .foot'); if (!foot) return;
    var bar = '<span class="ftrack" title="Mở bản đồ bài trình bày (phím M)">';
    for (var q = 0; q < MAIN; q++) bar += '<i class="' + (q < k ? 'done' : (q === k ? 'cur' : '')) + '"></i>';
    bar += '</span><span class="fstep" title="Mở bản đồ bài trình bày (phím M)">' + (k < MAIN ? 'Bước ' + (k + 1) + '/' + MAIN : 'Phụ lục') + '</span>';
    foot.insertAdjacentHTML('afterbegin', bar);
  });
  var fm = document.createElement('div'); fm.id = 'flowmap';
  var grid = '';
  FLOW.forEach(function (st, k) {
    grid += '<div class="fmstep" data-k="' + k + '"><span class="n">' + (k < MAIN ? k + 1 : 'A') + '</span><span class="rq r' + st.rq + '">' + st.rqt + '</span>' +
      '<h5>' + st.name + '</h5><span class="sl">Slide ' + (st.first + 1) + (st.last > st.first ? '–' + (st.last + 1) : '') + '</span><p>' + st.msg + '</p>' +
      (k < FLOW.length - 1 && (k + 1) % 5 !== 0 ? '<span class="arr">›</span>' : '') + '</div>';
  });
  fm.innerHTML = '<div class="fm"><div class="fmh"><b>Bản đồ bài trình bày</b><span>Bấm vào một bước để chuyển tới. Phím M hoặc Esc để đóng.</span><button type="button" id="fm-close">Đóng</button></div><div class="fmgrid">' + grid +
    '</div><div class="fmnote"><span><b>Yêu cầu 1:</b> chiến lược, kiến trúc MIS, AI, CRM và CDP, an toàn thông tin</span><span><b>Yêu cầu 2:</b> KPI</span><span><b>Yêu cầu 3:</b> nguồn lực, ngân sách, hỗ trợ</span></div></div>';
  document.body.appendChild(fm);
  function mapRefresh() {
    var i = Reveal.getIndices().h, k = stepOf[i];
    fm.querySelectorAll('.fmstep').forEach(function (el, q) {
      el.classList.toggle('cur', q === k); el.classList.toggle('done', q < k);
      if (q === k) el.setAttribute('data-now', i + 1);
    });
  }
  function toggleMap(force) {
    var on = typeof force === 'boolean' ? force : !fm.classList.contains('on');
    if (on) mapRefresh();
    fm.classList.toggle('on', on);
  }
  window.toggleFlowMap = toggleMap;
  fm.addEventListener('click', function (e) {
    var st = e.target.closest('.fmstep');
    if (st) { Reveal.slide(FLOW[+st.dataset.k].first); toggleMap(false); return; }
    if (e.target === fm || e.target.id === 'fm-close') toggleMap(false);
  });
  document.addEventListener('click', function (e) { if (e.target.closest('.ftrack, .fstep')) { e.preventDefault(); toggleMap(true); } }, true);
  document.addEventListener('keydown', function (e) {
    if (!fm.classList.contains('on')) return;
    if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') { e.preventDefault(); e.stopPropagation(); toggleMap(false); }
  }, true);

  Reveal.initialize({
    width: 1280,
    height: 720,
    margin: 0.04,
    center: false,
    hash: true,
    slideNumber: 'c/t',
    transition: 'fade',
    backgroundTransition: 'none',
    controlsTutorial: false,
    keyboard: { 13: 'next', 77: function () { toggleMap(); } },
    pdfSeparateFragments: false,
    plugins: [RevealNotes]
  }).then(syncStage);

  function markFirst() { document.documentElement.classList.toggle('on-first', Reveal.getIndices().h === 0); }
  Reveal.on('ready', markFirst);
  Reveal.on('slidechanged', markFirst);
  Reveal.on('slidechanged', syncStage);
  Reveal.on('fragmentshown', syncStage);
  Reveal.on('fragmenthidden', syncStage);
})();
