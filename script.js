const SUPABASE_URL = 'https://vwghhcjbdzdrkonjlrjg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_zoU4a0hBbAMs-35wmCjK3g_CXslGQGM';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

let productos = [];
let carrito = [];

const $ = id => document.getElementById(id);

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

function precioMostrar(p) {
  const enOferta = p.en_oferta && p.precio_oferta != null && Number(p.precio_oferta) > 0 && Number(p.precio_oferta) < Number(p.precio);
  return enOferta ? `<div class="price"><del>S/ ${Number(p.precio).toFixed(2)}</del> <strong>S/ ${Number(p.precio_oferta).toFixed(2)}</strong></div>` : `${precioMostrar(p)}`;
}

function precioCarrito(p) {
  return (p.en_oferta && p.precio_oferta != null && Number(p.precio_oferta) > 0 && Number(p.precio_oferta) < Number(p.precio)) ? Number(p.precio_oferta) : Number(p.precio);
}

function pintar(lista = productos) {
  $('lista').innerHTML = lista.length ? lista.map(p => `
    <article class="card">
      <img src="${productoImagen(p)}" alt="${escapeHtml(p.nombre)}">
      <div class="body">
        <h3>${escapeHtml(p.nombre)}</h3>
        <div class="desc">${escapeHtml(p.descripcion || '')}</div>
        ${precioMostrar(p)}
        <button class="add" onclick="agregar('${p.id}')">Agregar al carrito</button>
      </div>
    </article>`).join('') : '<p>No hay productos disponibles.</p>';
}

function pintarOfertas() {
  const ofertas = productos.filter(p => p.en_oferta && p.precio_oferta != null && Number(p.precio_oferta) > 0 && Number(p.precio_oferta) < Number(p.precio));
  $('listaOfertas').innerHTML = ofertas.length ? ofertas.map(p => `
    <article class="card oferta-card">
      <span class="badge-oferta">OFERTA</span>
      <img src="${productoImagen(p)}" alt="${escapeHtml(p.nombre)}">
      <div class="body">
        <h3>${escapeHtml(p.nombre)}</h3>
        <div class="desc">${escapeHtml(p.descripcion || '')}</div>
        ${precioMostrar(p)}
        <button class="add" onclick="agregar('${p.id}')">Agregar al carrito</button>
      </div>
    </article>`).join('') : '<p>Aún no hay ofertas publicadas.</p>';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function filtrar() {
  const q = $('buscar').value.toLowerCase();
  const c = $('categoria').value;
  pintar(productos.filter(p =>
    ((p.nombre || '').toLowerCase().includes(q) || (p.descripcion || '').toLowerCase().includes(q)) &&
    (!c || p.categoria === c)
  ));
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
  const msg = `Hola, soy ${nombre} y quiero hacer este pedido:\n${detalle}\nTotal: S/${total}\nEntrega: ${entrega}\nDirección: ${direccion}`;
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

function toggleMenu() {
  const nav = $('mainNav');
  if (nav) nav.classList.toggle('open');
}

document.addEventListener('click', e => {
  const nav = $('mainNav');
  const btn = document.querySelector('.menu-toggle');
  if (nav && nav.classList.contains('open') && !nav.contains(e.target) && e.target !== btn) nav.classList.remove('open');
});

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') $('admin').style.display = 'none';
});

cargarProductos();
comprobarSesion();
