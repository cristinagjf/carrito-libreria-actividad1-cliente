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
        // Buscar un libro por su SKU (null si no existe): soporte para el resto de métodos
    buscarProducto(sku) {
        for (let i = 0; i < this.productos.length; i++) {
            if (this.productos[i].sku === sku) { //comparamos valor y tipo
                return this.productos[i]; //sale del método en cuanto lo encuentra
            }
        }
        return null; //Si el bucle termina sin encontrarlo, devuelve null/nada
    }

        // Cambiar las unidades de un libro (nunca negativas)
    actualizarUnidades(sku, unidades) {
        //const porque no se reasigna:
        const producto = this.buscarProducto(sku); //un método llama a otro de la misma clase con this
        if (producto === null) {
            console.log('No existe el libro ' + sku);
            return;
        }
        //let porque nuevasUnidades puede cambiar:
        let nuevasUnidades = parseInt(unidades); //conviertimos a entero (lo que escribe el cliente en la caja llega como texto)
        if (isNaN(nuevasUnidades) || nuevasUnidades < 0) {
            nuevasUnidades = 0;
        }
        producto.quantity = nuevasUnidades; //cambia el libro que está dentro de this.productos (es el mismo objeto)
    }

    //Para los botones + y − (No repiten la lógica: llaman a actualizarUnidades que ya valida los negativos)

        // Botón +
    sumarUnidad(sku) {
        const producto = this.buscarProducto(sku);
        if (producto !== null) {
            this.actualizarUnidades(sku, producto.quantity + 1);
        }
    }

        // Botón -
    restarUnidad(sku) {
        const producto = this.buscarProducto(sku);
        if (producto !== null) {
            this.actualizarUnidades(sku, producto.quantity - 1);
        }
    }

        // Vaciar carrito: Pone todas las unidades a 0:

    vaciarCarrito() {
        for (let i = 0; i < this.productos.length; i++) {
            this.productos[i].quantity = 0;
        }
    }

    //Devuelve los datos de un libro y sus unidades:
    obtenerInformacionProducto(sku) {
        const producto = this.buscarProducto(sku);
        if (producto === null) {
            return null;
        }
        return {
            sku: producto.sku,
            title: producto.title,
            author: producto.author,
            price: producto.price,
            quantity: producto.quantity,
            subtotal: producto.price * producto.quantity
        };
    }
    //Calcular total y obtener carrito:

    // Suma de todas las líneas
    calcularTotal() { //usa un acumulador (variable que empieza en 0 y va sumando)
        let total = 0;
        for (let i = 0; i < this.productos.length; i++) {
            total = total + this.productos[i].price * this.productos[i].quantity;
        }
        return total;
    }

    // Libros con unidades + total + moneda
    obtenerCarrito() { //devuelve el objeto con el formato exacto del enunciado: total, currency y products
        const seleccionados = [];
        for (let i = 0; i < this.productos.length; i++) {
            if (this.productos[i].quantity > 0) {
                seleccionados.push(this.obtenerInformacionProducto(this.productos[i].sku));
            }
        }
        return {
            total: this.calcularTotal().toFixed(2),//solo dos decimales
            currency: this.moneda,
            products: seleccionados //solo los libros con unidades:
        };
    }

}

//CONECTAMOS CON EL HTML Y PEDIMOS LOS LIBROS A LA API

// URL de la API ("api.php")
const URL_API = "api.php";

// Elementos del HTML con los que vamos a trabajar: const porque la referencia al elemento no cambia aunque sí cambiemos su contenido:
const tablaProductos = document.getElementById("productos"); //busca en el HTML el elemento con id="productos" (el <tbody>) y lo guarda en una constante. (Texto coincide exactamente con el id del HTML)
const resumen = document.getElementById("resumen");
const total = document.getElementById("total");
const estado = document.getElementById("estado");
const botonVaciar = document.getElementById("botonVaciar");

// El carrito se crea cuando lleguen los datos al responder la API
let carrito = null;

//Función inicializar: async hace que la página siga cargando mientras esperamos
async function inicializar() {
    //hacemos try-catch para que si algo falla, salte al catch y muestre un mensaje en vez de romperse
    try {
        const respuesta = await fetch(URL_API);

        if (!respuesta.ok) { //código: 200 ok, 404 no existe, 500 error del servidor
            throw new Error('Error HTTP ' + respuesta.status); //si no existe lanzamos error para ir al catch
        }

        const datos = await respuesta.json(); //convierte la respuesta en un objeto de JavaScript. Ahora datos.products es el array de libros y datos.currency es €
        console.log(datos);

        carrito = new Carrito(datos.products, datos.currency);
        console.log(carrito);

        estado.innerText = 'Libros cargados: ' + carrito.productos.length; //modificación del DOM para cambiar el texto "Cargamdo libros..."

    } catch (error) {
        console.log(error);
        estado.innerText = 'No se han podido cargar los libros';
        botonVaciar.disabled = true;
    }
}

inicializar(); //única línea que se ejecuta sola al cargar

//PINTAR LOS LIBROS EN LA TABLA (Crear nuevos elementos en el DOM: listado de productos)

