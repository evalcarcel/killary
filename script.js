const SUPABASE_URL = 'https://vwghhcjbdzdrkonjlrjg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_zoU4a0hBbAMs-35wmCjK3g_CXslGQGM';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

let productos = [];
let carrito = [];
let categorias = [];


const $ = id => document.getElementById(id);

function prepararMarca() {
  const logo = document.querySelector('header .logo');
  if (!logo || logo.querySelector('.logo-arte-moda')) return;
  const img = document.createElement('img');
  img.className = 'logo-arte-moda';
  img.src = 'imagenes/logo-killary-arte-moda.png';
  img.alt = 'Killary Arte & Moda';
  logo.prepend(img);
}



async function cargarProductos() {
  const { data, error } = await supabaseClient
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    $('lista').innerHTML = '<p class="error">No se pudieron cargar los productos. Verifica la conexión con Supabase.</p>';
    return;
  }
  productos = data || [];
  pintar();
  pintarOfertas();
}

function productoImagen(p) {
  return p.imagen_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=80';
}


function datosOferta(p) {
  const normal = Number(p.precio);
  const oferta = Number(p.precio_oferta);
  const enOferta = Boolean(p.en_oferta) && Number.isFinite(oferta) && oferta > 0 && oferta < normal;
  const descuento = enOferta && normal > 0 ? Math.round((1 - oferta / normal) * 100) : 0;
  const ahorro = enOferta ? normal - oferta : 0;
  return { normal, oferta, enOferta, descuento, ahorro };
}

function precioMostrar(p) {
  const o = datosOferta(p);
  return o.enOferta
    ? `<div class="price"><del class="normal-price">S/ ${o.normal.toFixed(2)}</del> <strong class="offer-price">S/ ${o.oferta.toFixed(2)}</strong></div><div class="ahorro">Ahorras S/ ${o.ahorro.toFixed(2)} · ${o.descuento}% menos</div>`
    : `<div class="price"><strong>S/ ${o.normal.toFixed(2)}</strong></div>`;
}

function precioCarrito(p) {
  const o = datosOferta(p); return o.enOferta ? o.oferta : o.normal;
}

function pintar(lista = productos) {
  $('lista').innerHTML = lista.length ? lista.map(p => {
    const o = datosOferta(p);
    return `
    <article class="card">
      ${o.enOferta ? `<span class="badge-comercial">🔥 OFERTA -${o.descuento}%</span>` : ''}
      ${p.destacado ? `<span class="badge-destacado">⭐ DESTACADO</span>` : ''}
      <img src="${productoImagen(p)}" alt="${escapeHtml(p.nombre)}">
      <div class="body">
        <h3>${escapeHtml(p.nombre)}</h3>
        <div class="desc">${escapeHtml(p.descripcion || '')}</div>
        ${precioMostrar(p)}
        <button class="add" onclick="agregar('${p.id}')">🛒 Agregar al carrito</button>
      </div>
    </article>`;
  }).join('') : '<p>No hay productos disponibles.</p>';
}

function pintarOfertas() {
  const ofertas = productos.filter(p => datosOferta(p).enOferta);
  $('listaOfertas').innerHTML = ofertas.length ? ofertas.map(p => {
    const o = datosOferta(p);
    return `
    <article class="card oferta-card">
      <span class="badge-oferta">🔥 OFERTA</span>
      <span class="badge-comercial">-${o.descuento}%</span>
      <img src="${productoImagen(p)}" alt="${escapeHtml(p.nombre)}">
      <div class="body">
        <h3>${escapeHtml(p.nombre)}</h3>
        <div class="desc">${escapeHtml(p.descripcion || '')}</div>
        ${precioMostrar(p)}
        <button class="add" onclick="agregar('${p.id}')">🛒 Aprovechar oferta</button>
      </div>
    </article>`;
  }).join('') : '<p>Aún no hay ofertas publicadas.</p>';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function filtrar() {
  const q = ($('buscar')?.value || '').toLowerCase();
  const c = $('categoria')?.value || '';
  let lista = productos.filter(p =>
    ((p.nombre || '').toLowerCase().includes(q) || (p.descripcion || '').toLowerCase().includes(q))
  );
  if (c === '__ofertas__') lista = lista.filter(p => datosOferta(p).enOferta);
  else if (c) lista = lista.filter(p => String(p.categoria || '').toLowerCase() === c.toLowerCase());
  pintar(lista);
}

function agregar(id) {
  const p = productos.find(x => String(x.id) === String(id));
  if (!p) return;
  carrito.push(p);
  $('contador').textContent = carrito.length;
}

function verCarrito() { $('modal').style.display = 'flex'; renderCarrito(); }
function cerrar() { $('modal').style.display = 'none'; }

function renderCarrito() {
  $('carrito').innerHTML = carrito.length ? carrito.map((p, i) => `
    <div class="item">
      <div><b>${escapeHtml(p.nombre)}</b><br><small>S/ ${precioCarrito(p).toFixed(2)} c/u</small></div>
      <div class="acciones"><button onclick="editarCarrito(${i},-1)">−</button><span>1</span><button onclick="editarCarrito(${i},1)">+</button><button class="eliminar" onclick="eliminarCarrito(${i})">🗑️</button></div>
    </div>`).join('') : '<p>Tu carrito está vacío.</p>';
  $('total').textContent = carrito.reduce((s,p) => s + precioCarrito(p), 0).toFixed(2);
}

function editarCarrito(i, cambio) {
  if (cambio < 0) carrito.splice(i, 1);
  else carrito.push(carrito[i]);
  $('contador').textContent = carrito.length;
  renderCarrito();
}
function eliminarCarrito(i) {
  carrito.splice(i, 1);
  $('contador').textContent = carrito.length;
  renderCarrito();
}

function whatsapp() {
  if (!carrito.length) return alert('Agrega un producto.');
  const total = carrito.reduce((s,p) => s + precioCarrito(p), 0).toFixed(2);
  const detalle = carrito.map(p => '- ' + p.nombre + ' S/ ' + precioCarrito(p).toFixed(2)).join('\n');
  const nombre = $('nombre').value || 'Cliente';
  const direccion = $('direccion').value || 'Por confirmar';
  const entrega = $('entrega').value;
  const destino = $('destino').value;
  const destinoNombre = $('destino').selectedOptions[0]?.textContent || destino;
  const msg = `🛍️ PEDIDO KILLARY\n\nHola, soy ${nombre} y quiero hacer este pedido:\n${detalle}\n\n💰 TOTAL: S/ ${total}\n🚚 Entrega: ${entrega}\n📍 Dirección / referencia: ${direccion}\n💳 Yape seleccionado: ${destinoNombre}\n\nEnviaré el comprobante de pago por este WhatsApp.`;
  window.open(`https://wa.me/${destino}?text=${encodeURIComponent(msg)}`, '_blank');
}

function abrirLogin() {
  $('login').style.display = 'flex';
  $('admin').style.display = 'none';
  $('adminEmail').focus();
}
function cerrarLogin() { $('login').style.display = 'none'; }

async function loginAdmin() {
  const email = $('adminEmail').value.trim();
  const password = $('adminPass').value;
  if (!email || !password) return alert('Ingresa tu correo y contraseña.');

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) return alert('No se pudo iniciar sesión. Revisa tu correo y contraseña.');

  const { data: isAdmin, error: adminError } = await supabaseClient.rpc('is_admin');
  if (adminError || !isAdmin) {
    await supabaseClient.auth.signOut();
    return alert('Este usuario no tiene permisos de administrador.');
  }

  $('login').style.display = 'none';
  $('admin').style.display = 'block';
  $('admin').scrollIntoView({ behavior: 'smooth' });
  await renderAdmin();
}

async function cerrarAdmin() {
  await supabaseClient.auth.signOut();
  $('admin').style.display = 'none';
  $('adminEmail').value = '';
  $('adminPass').value = '';
}

async function renderAdmin() {
  const { data, error } = await supabaseClient.from('productos').select('*').order('created_at', { ascending: false });
  if (error) return alert('No se pudieron cargar los productos del administrador.');

  $('adminLista').innerHTML = (data || []).map(p => `
    <div class="admin-item">
      <img src="${productoImagen(p)}" alt="">
      <div><b>${escapeHtml(p.nombre)}</b><br>S/ ${precioCarrito(p).toFixed(2)}${p.en_oferta ? ' 🔥 OFERTA' : ''} · ${escapeHtml(p.categoria)} · ${p.activo ? 'Activo' : 'Oculto'}</div>
      <button onclick="editarProducto('${p.id}')">✏️ Editar</button>
      <button onclick="eliminarProducto('${p.id}')">🗑️ Eliminar</button>
    </div>`).join('') || '<p>No hay productos registrados.</p>';
}
  prepararGestionCategorias();
  await renderCategoriasAdmin();
  actualizarSelectCategorias();

async function guardarProducto() {
  const nombre = $('nuevoNombre').value.trim();
  const precio = parseFloat($('nuevoPrecio').value);
  const categoria = $('nuevoCategoria').value;
  const imagen_url = $('nuevoImagen').value.trim();
  const descripcion = $('nuevoDescripcion').value.trim();
  const en_oferta = $('nuevoEnOferta').checked;
  const precioOfertaTexto = $('nuevoPrecioOferta').value;
  const precio_oferta = precioOfertaTexto ? parseFloat(precioOfertaTexto) : null;

  if (!nombre || Number.isNaN(precio)) return alert('Ingresa nombre y precio.');
  if (en_oferta && (precio_oferta == null || Number.isNaN(precio_oferta) || precio_oferta <= 0 || precio_oferta >= precio)) return alert('El precio de oferta debe ser menor que el precio normal.');

  const { error } = await supabaseClient.from('productos').insert({
    nombre, categoria, precio, stock: 0,
    descripcion: descripcion || 'Producto KILLARY',
    imagen_url: imagen_url || null,
    destacado: false, en_oferta, precio_oferta: en_oferta ? precio_oferta : null, activo: true
  });

  if (error) {
    console.error(error);
    return alert('No se pudo guardar el producto. Verifica que tu usuario sea administrador.');
  }

  $('nuevoNombre').value = '';
  $('nuevoPrecio').value = '';
  $('nuevoImagen').value = '';
  $('nuevoDescripcion').value = '';
  $('nuevoEnOferta').checked = false;
  $('nuevoPrecioOferta').value = '';
  await cargarProductos();
  await renderAdmin();
  alert('Producto agregado correctamente en la nube.');
}

async function editarProducto(id) {
  const { data: p, error: readError } = await supabaseClient.from('productos').select('*').eq('id', id).single();
  if (readError || !p) return alert('No se encontró el producto.');

  const nombre = prompt('Nombre:', p.nombre);
  if (nombre === null) return;
  const precioTexto = prompt('Precio:', p.precio);
  if (precioTexto === null) return;
  const descripcion = prompt('Descripción:', p.descripcion || '');
  if (descripcion === null) return;
  const imagen_url = prompt('URL de imagen:', p.imagen_url || '');
  if (imagen_url === null) return;
  const enOfertaTexto = prompt('¿Es oferta? (si/no):', p.en_oferta ? 'si' : 'no');
  if (enOfertaTexto === null) return;
  const en_oferta = enOfertaTexto.trim().toLowerCase() === 'si' || enOfertaTexto.trim().toLowerCase() === 'sí';
  const precioOfertaTexto = prompt('Precio de oferta (deja vacío si no aplica):', p.precio_oferta ?? '');
  if (precioOfertaTexto === null) return;
  const precio_oferta = precioOfertaTexto.trim() ? parseFloat(precioOfertaTexto) : null;

  const precio = parseFloat(precioTexto);
  if (!nombre.trim() || Number.isNaN(precio)) return alert('Datos inválidos.');
  if (en_oferta && (precio_oferta == null || Number.isNaN(precio_oferta) || precio_oferta <= 0 || precio_oferta >= precio)) return alert('El precio de oferta debe ser menor que el precio normal.');

  const { error } = await supabaseClient.from('productos').update({
    nombre: nombre.trim(), precio, descripcion: descripcion.trim(), imagen_url: imagen_url.trim() || null, en_oferta, precio_oferta: en_oferta ? precio_oferta : null
  }).eq('id', id);

  if (error) return alert('No se pudo actualizar el producto.');
  await cargarProductos();
  await renderAdmin();
}

async function eliminarProducto(id) {
  const { data: p } = await supabaseClient.from('productos').select('nombre').eq('id', id).single();
  if (!p || !confirm('¿Eliminar ' + p.nombre + '?')) return;
  const { error } = await supabaseClient.from('productos').delete().eq('id', id);
  if (error) return alert('No se pudo eliminar el producto.');
  await cargarProductos();
  await renderAdmin();
}

async function comprobarSesion() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;
  const { data: isAdmin } = await supabaseClient.rpc('is_admin');
  if (isAdmin) {
    $('admin').style.display = 'block';
    await renderAdmin();
  }
}



async function cargarCategorias() {
  const { data, error } = await supabaseClient.from('categorias').select('*').eq('activo', true).order('orden', { ascending: true }).order('nombre', { ascending: true });
  if (error) { console.warn('Categorías dinámicas no disponibles:', error.message); return; }
  categorias = data || [];
  pintarCategorias();
  actualizarSelectCategorias();
}

function pintarCategorias() {
  const contenedor = document.querySelector('.cats');
  if (!contenedor) return;
  contenedor.innerHTML = categorias.map(c => `
    <a href="#productos" data-cat-nombre="${escapeHtml(c.nombre)}">${escapeHtml(c.icono || '🏷️')} ${escapeHtml(c.nombre)}</a>`).join('') +
    '<a href="#productos" data-cat-ofertas="1">🎁 Promociones</a>';
  prepararCategorias();
}

function actualizarSelectCategorias() {
  const cliente = $('categoria');
  if (cliente) {
    const valor = cliente.value;
    cliente.innerHTML = '<option value="">Todas las categorías</option>' + categorias.map(c => `<option value="${escapeHtml(c.nombre)}">${escapeHtml(c.nombre)}</option>`).join('') + '<option value="__ofertas__">🎁 Promociones</option>';
    if ([...cliente.options].some(o => o.value === valor)) cliente.value = valor;
  }
  const admin = $('nuevoCategoria');
  if (admin) {
    const valor = admin.value;
    admin.innerHTML = categorias.length ? categorias.map(c => `<option value="${escapeHtml(c.nombre)}">${escapeHtml(c.icono || '🏷️')} ${escapeHtml(c.nombre)}</option>`).join('') : '<option value="">Crea una categoría primero</option>';
    if ([...admin.options].some(o => o.value === valor)) admin.value = valor;
  }
}

function prepararCategorias() {
  document.querySelectorAll('.cats a').forEach(enlace => {
    if (enlace.dataset.killaryCategoria === '1') return;
    enlace.dataset.killaryCategoria = '1';
    enlace.addEventListener('click', e => {
      e.preventDefault();
      const nombre = enlace.dataset.catNombre || '';
      const esOferta = enlace.dataset.catOfertas === '1';
      const lista = esOferta ? productos.filter(p => datosOferta(p).enOferta) : productos.filter(p => String(p.categoria || '').toLowerCase() === nombre.toLowerCase());
      if ($('categoria')) $('categoria').value = esOferta ? '__ofertas__' : nombre;
      pintar(lista);
      document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function prepararGestionCategorias() {
  const admin = $('admin');
  if (!admin || document.getElementById('gestionCategorias')) return;
  const box = document.createElement('div');
  box.id = 'gestionCategorias';
  box.className = 'gestion-categorias';
  box.innerHTML = `
    <div class="gestion-cat-head"><div><h3>📂 Gestión de categorías</h3><p>Agrega y administra las categorías de KILLARY.</p></div></div>
    <div class="gestion-cat-form">
      <input id="nuevaCategoriaNombre" placeholder="Nombre de categoría">
      <input id="nuevaCategoriaIcono" placeholder="Ícono (ej. 🌸)" maxlength="4" value="🏷️">
      <input id="nuevaCategoriaOrden" type="number" min="0" step="1" placeholder="Orden" value="10">
      <button onclick="agregarCategoria()">➕ Agregar categoría</button>
    </div>
    <div id="listaCategoriasAdmin"></div>`;
  const lista = $('adminLista');
  if (lista) admin.insertBefore(box, lista); else admin.appendChild(box);
}

async function renderCategoriasAdmin() {
  const contenedor = $('listaCategoriasAdmin');
  if (!contenedor) return;
  const { data, error } = await supabaseClient.from('categorias').select('*').order('orden', { ascending: true }).order('nombre', { ascending: true });
  if (error) { contenedor.innerHTML = '<p class="error">No se pudieron cargar las categorías.</p>'; return; }
  categorias = (data || []).filter(c => c.activo);
  contenedor.innerHTML = (data || []).map(c => `
    <div class="categoria-admin-item ${c.activo ? '' : 'inactiva'}">
      <span class="categoria-admin-icon">${escapeHtml(c.icono || '🏷️')}</span>
      <div class="categoria-admin-info"><b>${escapeHtml(c.nombre)}</b><small>Orden ${Number(c.orden || 0)} · ${c.activo ? 'Activa' : 'Inactiva'}</small></div>
      <button onclick="editarCategoria('${c.id}')">✏️</button>
      <button onclick="alternarCategoria('${c.id}', ${c.activo ? 'false' : 'true'})">${c.activo ? '⏸️' : '▶️'}</button>
      <button onclick="eliminarCategoria('${c.id}')">🗑️</button>
    </div>`).join('') || '<p>No hay categorías.</p>';
  pintarCategorias();
  actualizarSelectCategorias();
}

async function agregarCategoria() {
  const nombre = $('nuevaCategoriaNombre')?.value.trim();
  const icono = $('nuevaCategoriaIcono')?.value.trim() || '🏷️';
  const orden = parseInt($('nuevaCategoriaOrden')?.value || '10', 10);
  if (!nombre) return alert('Escribe el nombre de la categoría.');
  const { error } = await supabaseClient.from('categorias').insert({ nombre, icono, orden: Number.isNaN(orden) ? 10 : orden, activo: true });
  if (error) return alert(error.code === '23505' ? 'Esa categoría ya existe.' : 'No se pudo agregar la categoría. Verifica tus permisos.');
  $('nuevaCategoriaNombre').value = ''; $('nuevaCategoriaIcono').value = '🏷️';
  await renderCategoriasAdmin();
  alert('Categoría agregada correctamente.');
}

async function editarCategoria(id) {
  const { data: c, error } = await supabaseClient.from('categorias').select('*').eq('id', id).single();
  if (error || !c) return alert('No se encontró la categoría.');
  const nombre = prompt('Nombre de la categoría:', c.nombre); if (nombre === null) return;
  const icono = prompt('Ícono:', c.icono || '🏷️'); if (icono === null) return;
  const ordenTexto = prompt('Orden:', c.orden ?? 10); if (ordenTexto === null) return;
  const orden = parseInt(ordenTexto, 10);
  const { error: updateError } = await supabaseClient.from('categorias').update({ nombre: nombre.trim(), icono: icono.trim() || '🏷️', orden: Number.isNaN(orden) ? 10 : orden }).eq('id', id);
  if (updateError) return alert(updateError.code === '23505' ? 'Ya existe una categoría con ese nombre.' : 'No se pudo actualizar la categoría.');
  await renderCategoriasAdmin();
}

async function alternarCategoria(id, activo) {
  const { error } = await supabaseClient.from('categorias').update({ activo }).eq('id', id);
  if (error) return alert('No se pudo cambiar el estado de la categoría.');
  await renderCategoriasAdmin();
}

async function eliminarCategoria(id) {
  const { data: c, error } = await supabaseClient.from('categorias').select('nombre').eq('id', id).single();
  if (error || !c) return alert('No se encontró la categoría.');
  const { count, error: countError } = await supabaseClient.from('productos').select('id', { count: 'exact', head: true }).eq('categoria', c.nombre);
  if (countError) return alert('No se pudo comprobar si la categoría tiene productos.');
  if (count > 0) return alert(`No se puede eliminar “${c.nombre}” porque tiene ${count} producto(s). Puedes desactivarla con ⏸️.`);
  if (!confirm(`¿Eliminar la categoría “${c.nombre}”?`)) return;
  const { error: deleteError } = await supabaseClient.from('categorias').delete().eq('id', id);
  if (deleteError) return alert('No se pudo eliminar la categoría.');
  await renderCategoriasAdmin();
}

function prepararWhatsAppAtencion() {
  if (document.getElementById('waAtencion')) return;

  const btn = document.createElement('a');
  btn.id = 'waAtencion';
  btn.className = 'wa-atencion';
  btn.href = 'https://wa.me/51935752403?text=' + encodeURIComponent('Hola KILLARY 👋, tengo una consulta sobre sus productos.');
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.setAttribute('aria-label', 'Conversar con KILLARY por WhatsApp');
  btn.innerHTML = '<span class="wa-atencion-icon">💬</span><span class="wa-atencion-text"><b>¿Tienes dudas?</b><small>Escríbenos por WhatsApp</small></span>';
  document.body.appendChild(btn);
}

function toggleMenu() {
  const nav = $('mainNav');
  const btn = document.querySelector('.menu-toggle');
  if (!nav) return;
  const abierto = nav.classList.toggle('open');
  if (btn) {
    btn.setAttribute('aria-expanded', String(abierto));
    btn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  }
}

function cerrarMenuMovil() {
  const nav = $('mainNav');
  const btn = document.querySelector('.menu-toggle');
  if (!nav) return;
  nav.classList.remove('open');
  if (btn) {
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir menú');
  }
}

document.addEventListener('click', e => {
  const nav = $('mainNav');
  const btn = document.querySelector('.menu-toggle');
  if (!nav) return;
  if (nav.contains(e.target)) {
    if (e.target.closest('a,button') && !e.target.closest('.menu-toggle')) cerrarMenuMovil();
    return;
  }
  if (nav.classList.contains('open') && e.target !== btn && !btn?.contains(e.target)) cerrarMenuMovil();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) cerrarMenuMovil();
});

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') $('admin').style.display = 'none';
});

prepararMarca();
prepararCategorias();
cargarCategorias();
cargarProductos();
comprobarSesion();
prepararWhatsAppAtencion();
