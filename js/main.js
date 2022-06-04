

if (typeof SimplexTable === 'undefined') {
    throw new Error("SimplexTable.js is missing");
}

if (typeof Simplex === 'undefined') {
    throw new Error("Simplex.js is missing");
}

if (typeof SimplexResult === 'undefined') {
    throw new Error("SimplexResult.js is missing");
}

if (typeof SimplexUtil === 'undefined') {
    throw new Error("SimplexResult.js is missing");
}

$(document).ready(function () {

    $('.modal').modal();
    $('select').formSelect();

    $('#numberOfVariables').on('change', SimplexTable.changeVariables);
    $('#numberOfConstraints').on('change', SimplexTable.changeConstraints);
    $('#calculate').on('click', calculateSimplex);
    $('#reset').on('click', SimplexTable.resetTable);
    $('#clear').on('click', SimplexTable.clearTable);
    $('#save').on('click', SimplexTable.saveTable);
    $('#load').on('click', SimplexTable.loadTable);

    SimplexTable.changeConstraints();
    SimplexTable.changeVariables();

});

function add(quantity, variable) {
    if (variable === 'variable') {
        let numberOfVariables = $('#numberOfVariables').val() * 1;

        if (numberOfVariables === 1 && quantity < 0) {
            return;
        }

        numberOfVariables += quantity > 0 ? 1 : - 1;

        $('#numberOfVariables').val(numberOfVariables);

        SimplexTable.changeVariables();

    } else if (variable === 'constraint') {
        let numberOfConstraints = $('#numberOfConstraints').val() * 1;

        if (numberOfConstraints === 1 && quantity < 0) {
            return;
        }

        numberOfConstraints += quantity > 0 ? 1 : - 1;

        $('#numberOfConstraints').val(numberOfConstraints);

        SimplexTable.changeConstraints();
    }
}

function calculateSimplex() {
    SimplexResult.show(Simplex.simplex(SimplexTable.getSimplexTable()));
}
