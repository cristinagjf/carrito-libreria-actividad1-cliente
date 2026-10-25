<?php
//API propia que devuelve el catálogo de libros en formato Json
header('Content-Type: application/json; charset=utf-8');
?>
{
    "currency": "€", 
    "products": [
        {
            "SKU": "LIB0001",
            "title": "Cien años de soledad",
            "author": "Gabriel García Márquez",
            "price": "12.95"
        },
        {
            "SKU": "LIB0002",
            "title": "Don Quijote de la Mancha",
            "author": "Miguel de Cervantes Saavedra",
            "price": "20.80"
        },
        {
            "SKU": "LIB0003",
            "title": "1984",
            "author": "George Orwell",
            "price": "10.40"
        },
        {
            "SKU": "LIB0004",
            "title": "Fortunata y Jacinta",
            "author": "Benito Pérez Galdós",
            "price": "20.50"
        },
        {
            "SKU": "LIB0005",
            "title": "La sombra del viento",
            "author": "Carlos Ruiz Zafón",
            "price": "11.95"
        }
    ]
}