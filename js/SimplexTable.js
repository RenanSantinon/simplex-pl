

if (!M) {
    throw new Error("materialize.js não está linkado");
}

// Operates the simplex table form
var SimplexTable = {}

SimplexTable.operatorOptions = $('<select>').html([
    $('<option>').attr('value', '<=').text('<='),
    $('<option>').attr('value', '=').text('='),
    $('<option>').attr('value', '>=').text('>=')]);

// Builds the nth input of the objective function
SimplexTable.makeObjFunInput = function (i) {
    return $('<div>')
        .addClass('valign-wrapper')
        .addClass('margin-right')
        .html([
            $('<input>')
                .attr('id', `objF-${i}`)
                .attr('type', 'number')
                .attr('value', '0'),
            $('<p>').html(`X<sub>${i+1}</sub>`)
        ]);
}

// Builds the constraint input of constraint i of variable j
SimplexTable.makeConstraintInput = function (i, j) {
    return $('<div>')
        .addClass('valign-wrapper')
        .addClass('margin-right')
        .html([
            $('<input>')
                .attr('id', `c-${i}-${j}`)
                .attr('type', 'number')
                .attr('value', '0'),
            $('<p>').html(`X<sub>${j+1}</sub>`)
        ]);
}

// Builds an entire constraint with operator options and b
SimplexTable.makeConstraint = function (i, nVar) {
    let result = Array(nVar + 2);

    let j = 0;
    for (; j < nVar; j++) {
        result[j] = SimplexTable.makeConstraintInput(i, j);
    }

    result[j + 1] = SimplexTable.operatorOptions.clone().attr('id', `op-${i}`);
    result[j + 2] = $('<input>').attr('id', `b-${i}`).attr('type', 'number').attr('value', '0');

    return $(`<div>`).addClass('flex-spacing').addClass('constraint').html(result);
}

// Changes the amount of columns
SimplexTable.changeVariables = function () {
    let numberOfVariables = $('#numberOfVariables').val() * 1;
    let numberOfConstraints = $('#numberOfConstraints').val() * 1;

    let $objectiveFunction = $('#objectiveFunction');
    let objectiveFunctionChildren = $objectiveFunction.children();

    // Change objective function
    if (objectiveFunctionChildren.length > numberOfVariables) {
        for (let i = 0; i < objectiveFunctionChildren.length - numberOfVariables; i++) {
            objectiveFunctionChildren.eq(objectiveFunctionChildren.length - 1).remove();
        }
    } else {
        for (let i = 0; i < numberOfVariables - objectiveFunctionChildren.length; i++) {
            $objectiveFunction.append(SimplexTable.makeObjFunInput(objectiveFunctionChildren.length + i));
        }
    }

    // Change each constraint
    let $constraints = $('#constraints .constraint');

    let totalVariables = $constraints.eq(0).children().length - 2;

    if (totalVariables > numberOfVariables) {
        // For each constraint, remove input variables from the end
        $constraints.each(function (index) {
            for (let j = 0; j < (totalVariables - numberOfVariables); j++) {
                $(this).children().eq($(this).children().length - 3).remove();
            }
        });
    } else {
        // For each constraint, add input variables
        $constraints.each(function (i) {
            for (let j = 0; j < (numberOfVariables - totalVariables); j++) {
                let lastInput = $(this).children().eq($(this).children().length - 3);
                lastInput.after(SimplexTable.makeConstraintInput(i, numberOfVariables + j - 1));
            }
        });
    }

    // Materialize
    $('select').formSelect();
}

// Changes the amount of rows
SimplexTable.changeConstraints = function () {
    let numberOfVariables = $('#numberOfVariables').val() * 1;
    let numberOfConstraints = $('#numberOfConstraints').val() * 1;

    let $constraints = $('#constraints');
    let $constraintsChildren = $constraints.children();

    if ($constraintsChildren.length > numberOfConstraints) {
        for (let i = 0; i < ($constraintsChildren.length - numberOfConstraints); i++) {
            $constraintsChildren.last().remove();
        }
    } else {
        for (let i = 0; i < (numberOfConstraints - $constraintsChildren.length); i++) {
            $constraints.append(SimplexTable.makeConstraint(numberOfConstraints + i - 1, numberOfVariables));
        }
    }

    // Materialize
    $('select').formSelect();
}

SimplexTable.getSimplexTable = function () {


    let numberOfVariables = $('#numberOfVariables').val() * 1;
    let numberOfConstraints = $('#numberOfConstraints').val() * 1;


    let objectiveFunction = Array(numberOfVariables).fill(0);

    for (let i = 0; i < numberOfVariables; i++) {
        objectiveFunction[i] = $(`#objF-${i}`).val() * 1;
    }

    if (objectiveFunction.includes(undefined)) {
        alert('Não foi possível recuperar todas as variáveis da função objetivo');
        return
    }

    /**
     * [n x m] matrix where
     * n = number of constraints
     * m = number of variables
     */
    let constraints = Array(numberOfConstraints).fill(undefined);

    for (let i = 0; i < constraints.length; i++) {
        constraints[i] = Array(numberOfVariables).fill(0).slice();
    }

    for (let i = 0; i < numberOfConstraints; i++) {
        for (let j = 0; j < numberOfVariables; j++) {
            constraints[i][j] = $(`#c-${i}-${j}`).val() * 1;
        }
    }


    let b = Array(numberOfConstraints).fill(0);

    for (let i = 0; i < numberOfConstraints; i++) {
        b[i] = $(`#b-${i}`).val() * 1;
    }


    let operators = Array(numberOfConstraints).fill('<=');

    for (let i = 0; i < numberOfConstraints; i++) {
        operators[i] = $(`#op-${i}`).val();
    }

    let columns = Array(numberOfVariables);

    for (let i = 0; i < numberOfVariables; i++) {
        columns[i] = `X<sub>${i+1}</sub>`;
    }

    let type = $('#simplexType').val();

    return {
        type: type,
        objectiveFunction: objectiveFunction,
        constraints: constraints,
        operators: operators,
        b: b,
        columns: columns
    };
}

SimplexTable.resetTable = function () {
    $('#numberOfVariables').val('1');
    $('#numberOfConstraints').val('1');

    $('#objectiveFunction').html(SimplexTable.makeObjFunInput(0));
    $('#constraints').html(SimplexTable.makeConstraint(0, 1));
}

SimplexTable.clearTable = function () {
    let numberOfVariables = $('#numberOfVariables').val() * 1;
    let numberOfConstraints = $('#numberOfConstraints').val() * 1;

    for (let i = 0; i < numberOfConstraints; i++) {
        $(`#b-${i}`).val('0');
        $(`#objF-${i}`).val('0');
        for (let j = 0; j < numberOfVariables; j++) {
            $(`#c-${i}-${j}`).val('0');
        }
    }
}

SimplexTable.loadTable = function () {
    let stringResult = window.prompt("Load Simplex Table");
    let result = undefined;

    try {
        result = JSON.parse(stringResult);
    } catch (err) {
        alert('Could not parse input string. Check console for more detail.');
        console.log(err);
    }

    if (!result)
        return;

    SimplexTable.resetTable();

    let numberOfConstraints = result.constraints.length;
    let numberOfVariables = result.objectiveFunction.length;

    let $numberOfConstraints = $('#numberOfConstraints');
    let $numberOfVariables = $('#numberOfVariables');

    for (let i = 1; i < numberOfConstraints; i++) {
        $numberOfConstraints.val($numberOfConstraints.val() * 1 + 1);
        SimplexTable.changeConstraints();
    }

    for (let i = 1; i < numberOfVariables; i++) {
        $numberOfVariables.val($numberOfVariables.val() * 1 + 1);
        SimplexTable.changeVariables();
    }

    for (let i = 0; i < numberOfConstraints; i++) {
        $(`#b-${i}`).val(result.b[i]);
        $(`#objF-${i}`).val(result.objectiveFunction[i]);
        $(`#op-${i}`).val(result.operators[i]);
        for (let j = 0; j < numberOfVariables; j++) {
            $(`#c-${i}-${j}`).val(result.constraints[i][j]);
        }
    }

    $('#simplexType').val(result.type);

    // Materialize
    $('select').formSelect();
}

SimplexTable.saveTable = function () {
    window.prompt("Save Simplex Table", JSON.stringify(SimplexTable.getSimplexTable()));
}

// EXAMPLES
// {"type":"max","objectiveFunction":[1,1],"constraints":[[2,1],[1,2]],"operators":["<=","<="],"b":[4,3],"columns":["X<sub>0</sub>","X<sub>1</sub>"]}
// {"type":"max","objectiveFunction":[4,1],"constraints":[[2,3],[2,1]],"operators":["<=","<="],"b":[12,8],"columns":["X<sub>0</sub>","X<sub>1</sub>"]}
// {"type":"max","objectiveFunction":[3,4],"constraints":[[1,1],[2,1]],"operators":["<=","<="],"b":[4,5],"columns":["X<sub>0</sub>","X<sub>1</sub>"]}
// {"type":"max","objectiveFunction":[4,6],"constraints":[[-1,1],[1,1],[2,5]],"operators":["<=","<=","<="],"b":[11,27,90],"columns":["X<sub>0</sub>","X<sub>1</sub>"]}
// {"type":"max","objectiveFunction":[1,1,1],"constraints":[[2,1,-1],[1,1,2],[2,1,3]],"operators":["<=",">=","="],"b":[10,20,60],"columns":["X<sub>0</sub>","X<sub>1</sub>","X<sub>2</sub>"]}

// Currently not working
// {"type":"min","objectiveFunction":[3,2],"constraints":[[2,1],[1,5]],"operators":[">=",">="],"b":[10,15],"columns":["X<sub>0</sub>","X<sub>1</sub>"]}
