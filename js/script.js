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

//PINTAR LOS LIBROS EN LA TABLA (Crear nuevos elementos en el DOM: listado de productos)
//Encapsulado: Los eventos solo hablan con la clase a través de los métodos
function pintarProductos() {
    tablaProductos.replaceChildren();

    for (let i = 0; i < carrito.productos.length; i++) {
        const producto = carrito.productos[i];
        const fila = document.createElement("tr");

        // Casilla 1: título, autor y referencia
        const celdaLibro = document.createElement("td");

        const titulo = document.createElement("p");
        titulo.className = "titulo-libro";
        titulo.innerText = producto.title;

        const autor = document.createElement("p");
        autor.className = "autor";
        autor.innerText = producto.author;

        const referencia = document.createElement("p");
        referencia.className = "referencia";
        referencia.innerText = "REF: " + producto.sku;

        celdaLibro.appendChild(titulo);
        celdaLibro.appendChild(autor);
        celdaLibro.appendChild(referencia);

        // Casilla 2: botón -, caja de cantidad, botón +
        const celdaCantidad = document.createElement("td");
        celdaCantidad.className = "celda-cantidad";

        const botonMenos = document.createElement("button");
        botonMenos.className = "boton-cantidad";
        botonMenos.innerText = "-";
        botonMenos.onclick = function () { //salta con clic y guarda una función en el botón. Se ejecuta cada vez que el cliente hace clic 
            carrito.restarUnidad(producto.sku);
            actualizarProducto(producto.sku);
        };

        const inputCantidad = document.createElement("input");
        inputCantidad.type = "number";
        inputCantidad.min = "0";
        inputCantidad.className = "input-cantidad";
        inputCantidad.id = "cantidad-" + producto.sku;
        inputCantidad.value = producto.quantity;
        inputCantidad.onchange = function () { //Salta al cambiar el no. o salir de la casilla
            carrito.actualizarUnidades(producto.sku, inputCantidad.value);
            actualizarProducto(producto.sku);
        };

        const botonMas = document.createElement("button");
        botonMas.className = "boton-cantidad";
        botonMas.innerText = "+";
        botonMas.onclick = function () { //al hacer clic, la clase suma 1 y actualizamos la fila
            carrito.sumarUnidad(producto.sku);
            actualizarProducto(producto.sku);
        };

        celdaCantidad.appendChild(botonMenos);
        celdaCantidad.appendChild(inputCantidad);
        celdaCantidad.appendChild(botonMas);

        // Casilla 3: precio por unidad
        const celdaPrecio = document.createElement("td");
        celdaPrecio.innerText = producto.price.toFixed(2) + carrito.moneda;

        // Casilla 4: total de la línea
        const celdaSubtotal = document.createElement("td");
        celdaSubtotal.id = "subtotal-" + producto.sku;
        celdaSubtotal.innerText = "0.00" + carrito.moneda;

        // Metemos las casillas en la fila y la fila en una tabla:
        fila.appendChild(celdaLibro);
        fila.appendChild(celdaCantidad);
        fila.appendChild(celdaPrecio);
        fila.appendChild(celdaSubtotal);
        tablaProductos.appendChild(fila);
    }
}

// Actualiza la cantidad y el total de UNA fila
function actualizarProducto(sku) {
    const informacion = carrito.obtenerInformacionProducto(sku); //pide a la clase los datos actualizados  del libro

    const inputCantidad = document.getElementById("cantidad-" + sku);
    const celdaSubtotal = document.getElementById("subtotal-" + sku);

    inputCantidad.value = informacion.quantity; //cambia lo que muestyra un input
    celdaSubtotal.innerText = informacion.subtotal.toFixed(2) + carrito.moneda; // cambia el texto de cualquier otro elemento
    actualizarResumen(); //cada cambio en una fila actualiza también la cesta y el TOTAL
}

// Repinta la lista de la cesta (aside) y el TOTAL
function actualizarResumen() {
    const datosCarrito = carrito.obtenerCarrito(); //trae solo los libros con unidades y el total calculado: la función solo los pinta

    resumen.replaceChildren(); //borra las líneas anteriores para que no se vayan acumulando en cada clic

    //if-else: si no hay libros, "Tu cesta está vacía". Si hay, un <li> por libro con dos <span> (texto a la izquierda, importe a la derecha)
    if (datosCarrito.products.length === 0) {
        const lineaVacia = document.createElement("li");
        lineaVacia.innerText = "Tu cesta está vacía... No dejes para mañana lo que puedas leer hoy";
        resumen.appendChild(lineaVacia);
    } else {
        for (let i = 0; i < datosCarrito.products.length; i++) {
            const producto = datosCarrito.products[i];
            const linea = document.createElement("li");

            const texto = document.createElement("span");
            texto.innerText = producto.quantity + " x " + producto.title;

            const importe = document.createElement("span");
            importe.innerText = producto.subtotal.toFixed(2) + datosCarrito.currency;

            linea.appendChild(texto);
            linea.appendChild(importe);
            resumen.appendChild(linea);
        }
    }

    total.innerText = datosCarrito.total + datosCarrito.currency;
    console.log(datosCarrito); //muestra en la consola el objeto del enunciado en cada cambio (para depurar y ver que obtenerCarrito está OK)
}

//Vaciar cesta: la clase pone todo a 0, actualiza cada fila, y con ella la cesta
botonVaciar.onclick = function () {
    if (carrito === null) { //por si la API hubiera fallado y el carrito no existe
        return;
    }
    carrito.vaciarCarrito();
    for (let i = 0; i < carrito.productos.length; i++) {
        actualizarProducto(carrito.productos[i].sku);
    }
};

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
        pintarProductos(); //pinta una fila por cada libro
        actualizarResumen(); //al cargar muestra la cesta vacía y TOTAL 0.00€
        console.log(carrito);

        estado.innerText = 'Libros cargados: ' + carrito.productos.length; //modificación del DOM para cambiar el texto "Cargamdo libros..."

    } catch (error) {
        console.log(error);
        estado.innerText = 'No se han podido cargar los libros';
        botonVaciar.disabled = true;
    }
}

inicializar(); //única línea que se ejecuta sola al cargar
