class Carrito {

    // Recibe la lista de libros de la API y la moneda
    constructor(productos, moneda) {
        this.moneda = moneda; //guarda el dato dentro del objeto para usarlo en los métodos
        this.productos = []; //array vacío donde guardaremos los libros del carrito

        for (let i = 0; i < productos.length; i++) { //recorremos el array
            const producto = { //const porque no se reasigna en esta vuelta, se crea uno nuevo por libro
                sku: productos[i].SKU,
                title: productos[i].title,
                author: productos[i].author,
                price: parseFloat(productos[i].price), //parseFloat para convertir y que no se junten los textos al sumar
                quantity: 0 //sin unidad en la cesta al principio
            };
            this.productos.push(producto); //añadimos el objeto al final del array
        }
    }

}