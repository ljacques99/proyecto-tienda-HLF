export const formatPrice = (priceInt) => {
    const euros = priceInt / 100; // Convertir céntimos a euros
    return euros.toLocaleString('es-ES', { minimumFractionDigits: 2 });
}

export const priceFormat = (number) => {
    var onesol = 1 
    var amount = parseFloat(number/onesol).toFixed(9)
    const filter = (Math.trunc(amount)).toString().length
    /*console.log(amount)
    console.log((Math.trunc(amount)).toString().length)*/
  
    if (filter <= 3){
      const result = parseFloat(amount).toFixed(2) 
      return result
    } 
  
    if (filter <= 6){
      const thousandAmount = amount/1000
      const result = parseFloat(thousandAmount).toFixed(1)
      return result + "K"
    }
  
    if (filter > 6){
      const millionAmount = amount/1000/1000
      const result = parseFloat(millionAmount).toFixed(1)
      return result + "M"
    }
}

