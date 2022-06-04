/*
 * The MIT License
 *
 * Copyright 2019 Leonardo Vencovsky (https://github.com/LeoVen/).
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// Main class containing the simplex logic
//      Step 0 - Show initial table
//      Step 1 - Show normalized table
//      Step 2 - Show pivoting while not done
//      Step 3 - Show final result
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
            // Add   slack variable
            this.addSlack(data, i);
        } else if (data.operators[i] === '>=') {
            // Add surplus variable
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

// i = ith constraint
Simplex.addSlack = function (data, i) {
    // numberOfConstraints since we are creating a column
    let result = Array(data.numberOfConstraints).fill(0);

    result[i] = 1;

    data.columns.push(`Xf<sub>${data.slack.length +1}</sub>`);
    data.slack.push(result);
}

// i = ith constraint
Simplex.addSurplus = function (data, i) {
    // numberOfConstraints since we are creating a column
    let result = Array(data.numberOfConstraints).fill(0);

    result[i] = - 1;

    data.columns.push(`a<sub>${data.surplus.length +1}</sub>`);
    data.surplus.push(result);
}

// The simplex is solved when all variables are not negative (>= 0)
Simplex.isSolved = function (matrix) {

    // i = 1 to skip Z column
    for (let i = 1; i < matrix[0].length; i++) {
        if (matrix[0][i] < 0) {
            return false;
        }
    }

    return true;
}

Simplex.pivot = function (data) {

    // Find most negative indicator
    let pivotColIndex = Simplex.findPivotCol(data);
    let pivotRowIndex = Simplex.findPivotRow(data, pivotColIndex);

    let pivotNumber = data.matrix[pivotRowIndex][pivotColIndex];

    // Save data for SimplexResult
    data.steps[data.steps.length - 1].pivotInfo = {
        pivotColIndex: pivotColIndex,
        pivotRowIndex: pivotRowIndex,
        pivotNumber: pivotNumber
    };

    // Calculate new OUT row
    let outRow = data.matrix[pivotRowIndex].slice();
    


    for (let i = 0; i < outRow.length; i++) {
        outRow[i] /= pivotNumber;
    }

    data.matrix[pivotRowIndex] = outRow;

    // Operate now on each row that is not the pivotRowIndex
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

// Returns the index of pivot column
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

// Returns the index of pivot row
Simplex.findPivotRow = function (data, pivotColIndex) {
    // Last column contains b
    let t = Simplex.getColumn(data.matrix, data.matrix[0].length - 1).slice(1);
    let pivotColumn = Simplex.getColumn(data.matrix, pivotColIndex).slice(1);

    // pivotColumn and t should be of the same dimension
    for (let i = 0; i < t.length; i++) {
        t[i] /= pivotColumn[i];
    }

    // The smallest positive value in t is the pivotRow
    let min = Number.MAX_VALUE;
    let index = 0;
    for (let i = 0; i < t.length; i++) {
        if (t[i] > 0 && t[i] < min) {
            min = t[i];
            index = i;
        }
    }

    // +1 skipping the objective function row
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
