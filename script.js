const productos=[["Perfume Elegance","Fragancia femenina de muestra",89.90,"Perfumes","https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=80"],["Perfume Intense","Aroma sofisticado",99.90,"Perfumes","https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=700&q=80"],["Perfume Floral","Fragancia fresca y delicada",79.90,"Perfumes","https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=700&q=80"],["Set de Belleza","Kit de cuidado personal",69.90,"Belleza","https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=700&q=80"],["Perfume Classic","Aroma elegante",85,"Perfumes","https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=80"],["Crema Corporal","Cuidado e hidratación",39.90,"Cuidado personal","https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=700&q=80"],["Set Perfume + Crema","Combo especial",119.90,"Belleza","https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=700&q=80"],["Fragancia Premium","Presentación para regalo",129.90,"Perfumes","https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=700&q=80"]];let carrito=[];
const productosBase=productos.slice();
const guardados=JSON.parse(localStorage.getItem("yabalProductos")||"null");
if(guardados) productos.splice(0,productos.length,...guardados);
function guardarDatos(){localStorage.setItem("yabalProductos",JSON.stringify(productos));}
function guardarProducto(){
 const n=nuevoNombre.value.trim(),p=parseFloat(nuevoPrecio.value),c=nuevoCategoria.value,i=nuevoImagen.value.trim(),d=nuevoDescripcion.value.trim();
 if(!n||isNaN(p)) return alert("Ingresa nombre y precio.");
 productos.push([n,d||"Producto Yabal",p,c,i||"https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=80"]);
 guardarDatos(); nuevoNombre.value=nuevoPrecio.value=nuevoImagen.value=nuevoDescripcion.value=""; pintar(); renderAdmin(); renderAdmin(); alert("Producto agregado.");
}
function editarProducto(i){
 const p=productos[i],n=prompt("Nombre:",p[0]); if(n===null)return;
 const precio=prompt("Precio:",p[2]); if(precio===null)return;
 p[0]=n.trim()||p[0]; p[2]=parseFloat(precio)||p[2]; guardarDatos(); pintar(); renderAdmin();
}
function eliminarProducto(i){if(confirm("¿Eliminar "+productos[i][0]+"?")){productos.splice(i,1);guardarDatos();pintar();renderAdmin();}}
function renderAdmin(){document.getElementById("adminLista").innerHTML=productos.map((p,i)=>`<div class="admin-item"><img src="${p[4]}"><div><b>${p[0]}</b><br>S/ ${p[2].toFixed(2)} · ${p[3]}</div><button onclick="editarProducto(${i})">✏️ Editar</button><button onclick="eliminarProducto(${i})">🗑️ Eliminar</button></div>`).join("")}
function pintar(lista=productos){document.getElementById("lista").innerHTML=lista.map(p=>`<article class="card"><img src="${p[4]}" alt="${p[0]}"><div class="body"><h3>${p[0]}</h3><div class="desc">${p[1]}</div><div class="price">S/ ${p[2].toFixed(2)}</div><button class="add" onclick="agregar(${productos.indexOf(p)})">Agregar al carrito</button></div></article>`).join("")}pintar();
function filtrar(){let q=buscar.value.toLowerCase(),c=categoria.value;pintar(productos.filter(p=>(p[0].toLowerCase().includes(q)||p[1].toLowerCase().includes(q))&&(!c||p[3]===c)))}
function agregar(i){carrito.push(productos[i]);contador.textContent=carrito.length}
function verCarrito(){modal.style.display="flex";render()}function cerrar(){modal.style.display="none"}
function render(){
  carrito.innerHTML=carrito.length?carrito.map((p,i)=>`<div class="item">
    <div><b>${p[0]}</b><br><small>S/ ${p[2].toFixed(2)} c/u</small></div>
    <div class="acciones"><button onclick="editar(${i},-1)">−</button><span>1</span><button onclick="editar(${i},1)">+</button><button class="eliminar" onclick="eliminar(${i})">🗑️</button></div>
  </div>`).join(""):"<p>Tu carrito está vacío.</p>";
  total.textContent=carrito.reduce((s,p)=>s+p[2],0).toFixed(2);
}
function editar(i,cambio){
  if(cambio<0){const pos=carrito.indexOf(carrito[i]); if(pos>-1) carrito.splice(pos,1)}
  else carrito.push(carrito[i]);
  contador.textContent=carrito.length; render();
}
function eliminar(i){
  carrito.splice(i,1); contador.textContent=carrito.length; render();
}
function whatsapp(){if(!carrito.length)return alert("Agrega un producto.");let t=carrito.reduce((s,p)=>s+p[2],0).toFixed(2),d=carrito.map(p=>"- "+p[0]+" S/ "+p[2].toFixed(2)).join("%0A"),n=document.getElementById("nombre").value||"Cliente",a=document.getElementById("direccion").value||"Por confirmar";window.open("https://wa.me/51935752403?text=Hola,%20soy%20"+encodeURIComponent(n)+"%20y%20quiero%20hacer%20este%20pedido:%0A"+d+"%0ATotal:%20S/"+t+"%0ADirección:%20"+encodeURIComponent(a)," _blank")}
function abrirLogin(){document.getElementById("login").style.display="flex";document.getElementById("admin").style.display="none"}
function cerrarLogin(){document.getElementById("login").style.display="none"}
function loginAdmin(){
 const u=document.getElementById("adminUser").value,p=document.getElementById("adminPass").value;
 if(u==="admin"&&p==="yabal2026"){document.getElementById("login").style.display="none";document.getElementById("admin").style.display="block";document.getElementById("admin").scrollIntoView({behavior:"smooth"});}
 else alert("Usuario o contraseña incorrectos.");
}
function cerrarAdmin(){document.getElementById("admin").style.display="none";document.getElementById("adminUser").value="";document.getElementById("adminPass").value="";}
