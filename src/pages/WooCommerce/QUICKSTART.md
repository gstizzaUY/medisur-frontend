# 🚀 Quick Start - WooCommerce Frontend

## ⚡ Inicio Rápido

### 1. Verificar Backend
Asegúrate de que el backend esté corriendo:
```bash
# En el directorio del backend
npm start
```

### 2. Iniciar Frontend
```bash
# En este directorio
npm run dev
```

### 3. Acceder al Módulo
1. Abrir http://localhost:5173
2. Login con tus credenciales
3. Click en "WooCommerce" en el menú lateral

## 📋 Primera Configuración

### Variables de Entorno
Verifica que `.env` tenga:
```env
VITE_API_URL=http://localhost:4000
```

## 🎯 Primer Producto

### Paso a Paso
1. **WooCommerce > Productos Web** → Click "Nuevo Producto"
2. **Buscar artículo**: Escribe código o nombre, click "Buscar"
3. **Seleccionar**: Click en el artículo deseado
4. **Completar formulario**:
   - ✅ Nombre web (obligatorio)
   - ✅ Precio (obligatorio)
   - ✅ Al menos 1 imagen (obligatorio)
   - ✅ Descripción corta (obligatorio)
   - ⚪ Categorías (recomendado)
   - ⚪ SEO (recomendado)
5. **Guardar**: 
   - "Guardar Borrador" → Para revisar después
   - "Guardar y Publicar" → Publicar inmediatamente

## 📊 Ver Estadísticas
**WooCommerce > Estadísticas** para ver:
- Total de productos configurados
- Productos publicados
- Borradores
- Productos destacados
- Estado de sincronización

## 🔄 Sincronización

### Automática
- Se ejecuta cada 6 horas (backend)
- Solo productos con sincronización habilitada
- Stock actualizado desde Zsoftware

### Manual
En la lista de productos:
- Click "Sincronizar Todo" para sincronización masiva

## 📚 Documentación Completa

Ver archivos:
- `README.md` - Documentación detallada del módulo
- `../../../WOOCOMMERCE_IMPLEMENTACION.md` - Resumen de implementación
- `../docs/` - Documentación del backend

## 🐛 Problemas Comunes

### No aparece el menú WooCommerce
- Verificar que estés logueado
- Hard refresh: Ctrl + Shift + R

### Error 401 en peticiones
- Re-login
- Verificar que el backend esté corriendo

### Las imágenes no se muestran
- Usar URLs absolutas (https://)
- Verificar que las URLs sean válidas

## 💡 Tips Rápidos

1. **Slug**: Se genera automáticamente del nombre
2. **Descuento**: Se calcula automáticamente entre precio regular y precio web
3. **SEO**: Límites de 60 chars para título, 160 para descripción
4. **Imágenes**: Primera imagen = imagen principal
5. **Borrador**: Puedes guardar y revisar antes de publicar

## ✅ Checklist Primera Vez

- [ ] Backend corriendo
- [ ] Frontend corriendo
- [ ] Login exitoso
- [ ] Menú WooCommerce visible
- [ ] Estadísticas se cargan
- [ ] Puedo buscar artículos de Zsoftware
- [ ] Puedo crear un producto
- [ ] Puedo ver la lista de productos

## 🎉 ¡Listo!

Ya puedes administrar productos de WooCommerce desde Medisur.

---

**Ayuda**: Ver README.md para documentación completa
