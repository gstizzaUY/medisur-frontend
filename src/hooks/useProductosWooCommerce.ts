import { useState, useCallback } from 'react';
import { woocommerceService } from '../services/woocommerceService';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para manejar operaciones de productos WooCommerce
 */
export const useProductosWooCommerce = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listar productos
  const listarProductos = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await woocommerceService.listarProductos(params);
      return response.data;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al listar productos';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener producto
  const obtenerProducto = useCallback(async (codigoArticulo: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await woocommerceService.obtenerProducto(codigoArticulo);
      return response.data;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al obtener producto';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Guardar producto
  const guardarProducto = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await woocommerceService.guardarProducto(data);
      toast.success('Producto guardado exitosamente');
      return response.data;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al guardar producto';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar producto publicado
  const actualizarProducto = useCallback(async (codigoArticulo: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await woocommerceService.actualizarProductoPublicado(codigoArticulo, data);
      toast.success('Producto actualizado exitosamente');
      return response.data;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al actualizar producto';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Publicar producto
  const publicarProducto = useCallback(async (codigoArticulo: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await woocommerceService.publicarProducto(codigoArticulo);
      toast.success('Producto publicado en WooCommerce');
      return response.data;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al publicar producto';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Despublicar producto
  const despublicarProducto = useCallback(async (codigoArticulo: string, eliminar = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await woocommerceService.despublicarProducto(codigoArticulo, eliminar);
      toast.success(eliminar ? 'Producto eliminado' : 'Producto despublicado');
      return response.data;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al despublicar producto';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar producto
  const eliminarProducto = useCallback(async (codigoArticulo: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await woocommerceService.eliminarProducto(codigoArticulo);
      toast.success('Producto eliminado');
      return response.data;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al eliminar producto';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sincronizar stock
  const sincronizarStock = useCallback(async (codigoArticulo: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await woocommerceService.sincronizarStock(codigoArticulo);
      toast.success('Stock sincronizado');
      return response.data;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al sincronizar stock';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sincronizar precio
  const sincronizarPrecio = useCallback(async (codigoArticulo: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await woocommerceService.sincronizarPrecio(codigoArticulo);
      toast.success('Precio sincronizado');
      return response.data;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al sincronizar precio';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sincronizar todo
  const sincronizarTodo = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await woocommerceService.sincronizarTodo(params);
      toast.success(`${response.data.totalSincronizados} productos sincronizados`);
      return response.data;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error en sincronización masiva';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener categorías
  const obtenerCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await woocommerceService.obtenerCategorias();
      return response.data.categorias;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al obtener categorías';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener etiquetas
  const obtenerEtiquetas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await woocommerceService.obtenerEtiquetas();
      return response.data.etiquetas;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al obtener etiquetas';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar artículos disponibles
  const buscarArticulos = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await woocommerceService.buscarArticulosDisponibles(params);
      return response.data.articulos;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al buscar artículos';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estadísticas
  const obtenerEstadisticas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await woocommerceService.obtenerEstadisticas();
      return response.data.estadisticas;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al obtener estadísticas';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    listarProductos,
    obtenerProducto,
    guardarProducto,
    actualizarProducto,
    publicarProducto,
    despublicarProducto,
    eliminarProducto,
    sincronizarStock,
    sincronizarPrecio,
    sincronizarTodo,
    obtenerCategorias,
    obtenerEtiquetas,
    buscarArticulos,
    obtenerEstadisticas,
  };
};
