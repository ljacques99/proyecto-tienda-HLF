import { addInvoice } from "../hlfApi/Invoices/addInvoice"

export const checkOut = async (productos, verifyToken) => {
    // Agrupar productos por merchantId
    const productosPorMerchant = productos.reduce((acc, producto) => {
        acc[producto.merchantId] = acc[producto.merchantId] || [];
        acc[producto.merchantId].push(producto);
        return acc;
    }, {});

    for (const merchantId in productosPorMerchant) {
        const lineas = productosPorMerchant[merchantId].map(producto => ({
            productId: producto.id,
            quantity: producto.quantity,
            price: producto.priceInt
        }));

        const lineasString = JSON.stringify(lineas)

        try {
            await addInvoice(merchantId, lineasString, verifyToken);
        } catch (error) {
            console.error('Error al procesar la factura para el comerciante:', merchantId, error);
        }
    }
}
