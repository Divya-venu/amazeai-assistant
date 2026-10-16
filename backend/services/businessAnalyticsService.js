const Sale = require('../models/Sale');

async function getShopSales(shopId) {
    return await Sale.find({ shopId }).lean();
}

async function getHighestProfitProduct(shopId) {
    const sales = await getShopSales(shopId);

    if (!sales.length) {
        return null;
    }

    return sales.reduce((highest, sale) => {
        const currentProfit =
            ((sale.price || 0) - (sale.costPrice || 0)) *
            (sale.quantity || 0);

        const highestProfit =
            ((highest.price || 0) - (highest.costPrice || 0)) *
            (highest.quantity || 0);

        return currentProfit > highestProfit ? sale : highest;
    });
}

module.exports = {
    getShopSales,
    getHighestProfitProduct
};