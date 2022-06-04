

// Contém funções utilitárias
var SimplexUtil = {}

// Cria uma matriz 2D
SimplexUtil.transpose = function (array) {
    return array[0].map((col, i) => array.map(row => row[i]));
}

// Copia uma matriz
SimplexUtil.cloneMatrix = function (matrix) {
    let copy = Array(matrix.length);

    for (let i = 0; i < matrix.length; i++) {
        copy[i] = matrix[i].slice();
    }

    return copy;
}

SimplexUtil.arrayIndexMax = function (array) {
    return array.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
}

SimplexUtil.arrayIndexMin = function (array) {
    return array.reduce((iMax, x, i, arr) => x < arr[iMax] ? i : iMax, 0);
}
