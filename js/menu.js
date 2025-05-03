
const selectorCategoria = document.getElementById("selector-categoria");

// Cargar categoría guardada al abrir el menú
const categoriaGuardada = localStorage.getItem("categoriaElegida");
if (categoriaGuardada) {
    selectorCategoria.value = categoriaGuardada;
}

// Guardar nueva categoría cuando el usuario cambie
selectorCategoria.addEventListener("change", () => {
    localStorage.setItem("categoriaElegida", selectorCategoria.value);
});



