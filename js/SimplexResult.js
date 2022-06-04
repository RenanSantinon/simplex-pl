
// Shows the simplex result
var SimplexResult = {}

$(document).ready(function () {
    SimplexResult.output = $('#resultModal .modal-content');
});

SimplexResult.show = function (data) {
    SimplexResult.output.html('<h4>Resultado</h4>');

    if (data.failed) {
        SimplexResult.output.append('Could not solve the Linear Program in ' + data.iter + ' iterations');
    } else {
        SimplexResult.showInitialLinearProgram(data);
        SimplexResult.showResults(data);
        SimplexResult.showFinalResult(data);
    }
}

SimplexResult.showInitialLinearProgram = function (data) {

    let result = $('<ul>').addClass('collection').addClass('with-header');

    let header = $('<li>').addClass('collection-header').html('<b>INÍCIO</b>');

    let objFunction = $('<li>').addClass('collection-item').html([
        
        data.type === 'max' ? 'FO Max(z)  = ' : 'Minimize Z = ',
        data.objectiveFunction.map((val, i) => `${val} * X<sub>${i+1}</sub>`).join(' + ')
    ]);

    let constraintsText = $('<div>').html(() =>
        [
            $('<li>').addClass('collection-item').html('Restrições:'),
            ...data.constraints.map((c, ci) => $('<li>')
                .addClass('collection-item')
                .html([
                    c.map((val, i) => `${val} * X<sub>${i+1}</sub>`).join(' + '),
                    " ",
                    data.operators[ci],
                    " ",
                    data.b[ci]
                ]))
        ]
    );

    result.append(header, objFunction, constraintsText);

    SimplexResult.output.append($('<div>').html([result]));
}

SimplexResult.showResults = function (data) {
    let result = Array();

    // Skip the initial linear program up to the penultimate result
    for (let i = 1; i < data.steps.length - 1; i++) {
        // Add title
        result.push($('<hr>'));
        result.push($('<h5>').text(`Algoritmo ${i}`));

        let pInfo = data.steps[i].pivotInfo;
        let table = SimplexResult.transformMatrixToTable(data.columns,
            data.steps[i].matrix,
            pInfo.pivotRowIndex,
            pInfo.pivotColIndex,
            true);

        result.push(table);

        result.push($('<h5>').text(`Solução ${i}`));
        result.push(SimplexResult.buildAnswer(data, i));
    }

    SimplexResult.output.append(result);
}

SimplexResult.showFinalResult = function (data) {
    let result = Array();

    result.push($('<hr>'));
    result.push($('<h5>').text('Algoritmo Final'));

    let lastResult = data.steps[data.steps.length - 1];

    let table = SimplexResult.transformMatrixToTable(data.columns, lastResult.matrix, 0, 0, false);

    result.push(table);

    result.push(SimplexResult.buildAnswer(data, data.steps.length - 1));

    result.push('<hr>');

    SimplexResult.output.append(result);
}

SimplexResult.transformMatrixToTable = function (columns, matrix, pivotRow, pivotCol, color) {
    let table = $('<table>').addClass('striped');
    let tableHead = $('<thead>');
    let tableBody = $('<tbody>');

    tableHead.append($('<tr>').html(
        columns.map((colName) => $('<th>').html(colName))
    ));

    table.append(tableHead);

    tableBody.html(matrix.map(
        (c, i) => $('<tr>').html(
            c.map((val, j) => $('<td>')
                .addClass(SimplexResult.getColorClass(i, j, pivotRow, pivotCol, color))
                .html(val.toFixed(2)))
        ))
    );

    table.append(tableBody);

    return table;
}

SimplexResult.getColorClass = function (row, col, pivotRow, pivotCol, color) {
    if (!color) {
        return '';
    }

    if (row === pivotRow && col === pivotCol) {
        return 'red lighten-1';
    }

    if (row === pivotRow) {
        return 'green lighten-2';
    }

    if (col === pivotCol) {
        return 'blue lighten-2';
    }

    return '';
}

SimplexResult.buildAnswer = function (data, nthStep) {
    let targetMatrix = data.steps[nthStep].matrix;

    let result = $('<ul>').addClass('collection');

    let valueZ = $('<li>')
        .addClass('collection-item')
        .text(`Valor de Z: ${targetMatrix[0][targetMatrix[0].length - 1].toFixed(2)}`);

    let basicVar = $('<li>').addClass('collection-item').append('Variáveis básicas: <br>');
    let nonBasicVar = $('<li>').addClass('collection-item').append('Variáveis não básicas: <br>');


    for (let i = 1; i < targetMatrix[0].length - 1; i++) {

        let col = Simplex.getColumn(targetMatrix, i);

        // Skip first row where the objective function is
        if (Simplex.isBasic(col.slice(1))) {

            basicVar.append(`${data.columns[i]} = 0 <br>`);
        } else {
            nonBasicVar.append(`${data.columns[i]} = ${Simplex.valueOfNonBasic(targetMatrix, i).toFixed(2)} <br> `);
        }
    }

 
    result.html([valueZ, nonBasicVar, basicVar]);

    return result;  
}
