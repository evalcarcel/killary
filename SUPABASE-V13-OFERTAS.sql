-- KILLARY V13: habilitar ofertas en productos
alter table public.productos
add column if not exists en_oferta boolean not null default false,
add column if not exists precio_oferta numeric;

-- Opcional: si quieres que algunos productos existentes sean ofertas, ejecuta por ejemplo:
-- update public.productos set en_oferta = true, precio_oferta = 79.90 where nombre = 'Perfume Elegance';
