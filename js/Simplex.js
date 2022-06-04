
var Simplex = {
    maxIterations: 20
}

Simplex.assertDataIsCorrect = function (data) {
    if (typeof data === 'undefined'
        || typeof data.type === 'undefined'
        || typeof data.objectiveFunction === 'undefined'
        || typeof data.constraints === 'undefined'
        || typeof data.operators === 'undefined'
        || typeof data.b === 'undefined'
        || typeof data.columns === 'undefined') {
        console.error('Error, data input to simplex equals:');
        console.log(data);
        throw new Error("Not all data parameters were found");
    }
}

Simplex.simplex = function (data) {
    Simplex.assertDataIsCorrect(data);

    // Keep steps for SimplexResult
    data.steps = Array();
    data.steps.push(SimplexTable.getSimplexTable()); // Get a copy of the table

    data = Simplex.normalize(data);

    // First solution
    data.steps.push({matrix: SimplexUtil.cloneMatrix(data.matrix)});

    data.iter = 0;
    data.failed = false;

    while (!Simplex.isSolved(data.matrix) && data.iter < Simplex.maxIterations) {
        Simplex.pivot(data);

        data.steps.push({matrix: SimplexUtil.cloneMatrix(data.matrix)});

        data.iter++;
    }

    if (data.iter === Simplex.maxIterations) {
        data.failed = true;
    }

    return data;
}

Simplex.normalize = function (data) {
    Simplex.assertDataIsCorrect(data);

    data.numberOfVariables = data.objectiveFunction.length;
    data.numberOfConstraints = data.constraints.length;

    data.slack = Array();
    data.surplus = Array();

    // For each <= constraint we add a   slack variable
    // For each >= constraint we add a surplus variable
    for (let i = 0; i < data.numberOfConstraints; i++) {
        if (data.operators[i] === '<=') {
            // Adiciona a variavel de folga 
            this.addSlack(data, i);
        } else if (data.operators[i] === '>=') {
            // Adiciona a variavel auxiliar
            this.addSlack(data, i);
            this.addSurplus(data, i);

        }
    }

    let columnsToAdd = [...data.slack, ...data.surplus];

    data.matrix = Array(data.constraints.length + columnsToAdd.length);

    // Append columns

    for (let i = 0; i < data.matrix.length - columnsToAdd.length; i++) {
        data.matrix[i] = data.constraints[i].slice();
    }

    data.matrix = SimplexUtil.transpose(data.matrix);

    for (let i = 0; i < columnsToAdd.length; i++) {
        data.matrix.push(columnsToAdd[i].slice());
    }

    data.matrix = SimplexUtil.transpose(data.matrix);

    // Not sure why but the length of the matrix doesn't match up anymore
    data.matrix.length = data.constraints.length;

    // Add b column
    data.columns.push('b');
    for (let i = 0; i < data.matrix.length; i++) {
        data.matrix[i].push(data.b[i]);
    }

    // Add the objective function
    data.matrix.unshift(data.objectiveFunction.slice());

    // Transform objective function as LHS = 0
    // This is the same as multiplying everything to -1
    for (let i = 0; i < data.matrix[0].length; i++) {
        data.matrix[0][i] *= -1;
    }

    while (data.matrix[0].length < data.matrix[1].length) {
        data.matrix[0].push(0);
    }

    // Add Z column
    data.columns.unshift('Z');
    for (let i = 0; i < data.matrix.length; i++) {
        data.matrix[i].unshift(0);
    }

    data.matrix[0][0] = 1;

    return data;
}

// i = algoritimo constraint
Simplex.addSlack = function (data, i) {
     // numero de constraints desde da criacao da coluna
    let result = Array(data.numberOfConstraints).fill(0);

    result[i] = 1;

    data.columns.push(`Xf<sub>${data.slack.length +1}</sub>`);
    data.slack.push(result);
}


Simplex.addSurplus = function (data, i) {
   
        let result = Array(data.numberOfConstraints).fill(0);

    result[i] = - 1;

    // DEFINE O COEFICIENTE DA VARIAVEL AUXILIAR
    data.columns.push(`a<sub>${data.surplus.length +2}</sub>`);
    data.surplus.push(result);
}

// O simplex só termina quando as variáveis são diferentes de 0 (>= 0)
Simplex.isSolved = function (matrix) {

    
    for (let i = 1; i < matrix[0].length; i++) {
        if (matrix[0][i] < 0) {
            return false;
        }
    }

    return true;
}

Simplex.pivot = function (data) {

    // procura o valor maior negativo
    let pivotColIndex = Simplex.findPivotCol(data);
    let pivotRowIndex = Simplex.findPivotRow(data, pivotColIndex);

    let pivotNumber = data.matrix[pivotRowIndex][pivotColIndex];

    // salva os dados
    data.steps[data.steps.length - 1].pivotInfo = {
        pivotColIndex: pivotColIndex,
        pivotRowIndex: pivotRowIndex,
        pivotNumber: pivotNumber
    };

    // calcula nlp
    let outRow = data.matrix[pivotRowIndex].slice();
    


    for (let i = 0; i < outRow.length; i++) {
        outRow[i] /= pivotNumber;
    }

    data.matrix[pivotRowIndex] = outRow;

    // cria as nl para o proximo algoritimo
    for (let i = 0; i < data.matrix.length; i++) {
        if (i !== pivotRowIndex) {
            let targetRow = data.matrix[i];
            let mul = data.matrix[i][pivotColIndex] * - 1;

            for (let j = 0; j < targetRow.length; j++) {
                targetRow[j] += outRow[j] * mul;
            }
        }
    }
}

Simplex.findPivotCol = function (data) {
    let min = Number.MAX_VALUE;
    let index = 1;

    for (let i = 0; i < data.matrix[0].length; i++) {
        if (data.matrix[0][i + 1] < min) {
            min = data.matrix[0][i + 1];
            index = i + 1;
        }
    }

    return index;
}


Simplex.findPivotRow = function (data, pivotColIndex) {
   
    let t = Simplex.getColumn(data.matrix, data.matrix[0].length - 1).slice(1);
    let pivotColumn = Simplex.getColumn(data.matrix, pivotColIndex).slice(1);

    
    for (let i = 0; i < t.length; i++) {
        t[i] /= pivotColumn[i];
    }

    // pega o menor valor
    let min = Number.MAX_VALUE;
    let index = 0;
    for (let i = 0; i < t.length; i++) {
        if (t[i] > 0 && t[i] < min) {
            min = t[i];
            index = i;
        }
    }

   
    return index + 1;
}

Simplex.getColumn = function (matrix, columnIndex) {
    let result = Array(matrix.length);

    for (let i = 0; i < matrix.length; i++) {
        result[i] = matrix[i][columnIndex];
    }

    return result;
}

Simplex.isBasic = function (column) {
    let found1 = false;

    for (let i = 0; i < column.length; i++) {
        if (column[i] !== 1 && column[i] !== 0) {
            return true;
        } else {
            if (found1 && column[i] === 1) {
                return true;
            } else if (column[i] === 1) {
                found1 = true;
            }
        }
    }

    return false;
}

Simplex.valueOfNonBasic = function (matrix, columnIndex) {
    let column = Simplex.getColumn(matrix, columnIndex);

    if (Simplex.isBasic(column)) {
        return NaN;
    }

    return matrix[column.indexOf(1)][matrix[0].length - 1];
}
