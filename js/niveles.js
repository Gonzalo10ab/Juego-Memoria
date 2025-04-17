// MODIFICAR LAS FILAS Y COLUMNAS POR LAS DEFINITIVAS
const niveles = {
    1: {
        filas: 2,             // Número de filas del tablero
        columnas: 2,          // Número de columnas del tablero
        powerups: false,      // No se permite usar powerups en este nivel
        joker: false,         // No hay carta Joker disponible
        oscuridad: false,     // No se activa el efecto de oscuridad
        contrarreloj: false   // El jugador no tiene límite de tiempo
    },
    2: {
        filas: 4,
        columnas: 4,
        powerups: false,
        joker: false,
        oscuridad: false,
        contrarreloj: false
    },
    3: {
        filas: 4,
        columnas: 4,
        powerups: true,
        joker: false,
        oscuridad: false,
        contrarreloj: false
    },
    4: {
        filas: 4,
        columnas: 5,
        powerups: false,
        joker: true,
        oscuridad: false,
        contrarreloj: false
    },
    5: {
        filas: 6,
        columnas: 6,
        powerups: true,
        joker: false,
        oscuridad: true,
        contrarreloj: true
    },
    6: {
        filas: 8,
        columnas: 6,
        powerups: true,
        joker: true,
        oscuridad: true,
        contrarreloj: true
    }
};
