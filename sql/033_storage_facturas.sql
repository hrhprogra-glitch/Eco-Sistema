-- Crear el bucket de "facturas" si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('facturas', 'facturas', true)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas para permitir a cualquiera ver los objetos en el bucket 'facturas'
CREATE POLICY "Acceso publico lectura facturas"
ON storage.objects FOR SELECT
USING (bucket_id = 'facturas');

-- Crear política para permitir la subida de archivos al bucket 'facturas'
-- Si tienes autenticación con RLS, podrías restringirlo, pero dado que usamos el backend
-- usaremos la key anónima, por lo que abrimos la inserción (nuestro backend controla quién sube)
CREATE POLICY "Permitir subida facturas"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'facturas');
