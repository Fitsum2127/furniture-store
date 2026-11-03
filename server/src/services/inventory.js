// For products that have variants, products.stock is kept equal to the sum of the active variants' stock.
export async function syncProductStock(conn, productId) {
  const [[row]] = await conn.query(
    'SELECT COUNT(*) AS n, COALESCE(SUM(stock), 0) AS total FROM product_variants WHERE product_id = ? AND is_active = 1',
    [productId]
  );
  if (row.n > 0) {
    await conn.query('UPDATE products SET stock = ? WHERE id = ?', [Number(row.total), productId]);
  }
}