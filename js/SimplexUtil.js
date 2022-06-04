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

// Contains utility functions
var SimplexUtil = {}

// Transposes a 2D matrix
SimplexUtil.transpose = function (array) {
    return array[0].map((col, i) => array.map(row => row[i]));
}

// Copies a matrix
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
