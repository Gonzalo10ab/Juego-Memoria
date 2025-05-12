const selectorCategoria = document.getElementById("selector-categoria");

const categoriaGuardada = localStorage.getItem("categoriaElegida");
if (categoriaGuardada) {
    selectorCategoria.value = categoriaGuardada;
}

selectorCategoria.addEventListener("change", () => {
    localStorage.setItem("categoriaElegida", selectorCategoria.value);
});



