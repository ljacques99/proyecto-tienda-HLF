export const formatPrice = (priceInt) => {
    const euros = priceInt / 100; // Convertir céntimos a euros
    return euros.toLocaleString('es-ES', { minimumFractionDigits: 2 });
}