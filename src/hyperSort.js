(function(exports) {
    exports.hypersort = exports.hypersort || {};

    var hypersort = exports.hypersort;

    hypersort.createRowManager = function(rows) {
        // Fields
        var stableSorting;
        var colInfos = {};
        var lastSortColumn = null;
        var dirty = false;

        // Initialization & Local Variables 
        var detectBestSortType = function(colName) {
            var detectedType = null;
            var type = null;

            for (var j = 0; j < rows.length; j++) {
                val = rows[i][colName];

                if ((val === undefined) || (val === null)) {
                    continue;
                } else {
                    type = typeof val;
                }

                if (type === 'string') {
                    type = 'string';
                    sortType = 'object';
                    break;
                } else if (type === 'number') {
                    type = 'number';
                    sortType = 'number';
                } else if (type === 'object') {
                    if (val.constructor === Date) {
                        type = 'date';
                        sortType = 'number';
                    }
                    // type = typeof val.valueOf();
                    type = 'object';
                    sortType = 'object';
                    break;
                }
            }

            colInfos[name] = {
                type: type,
                sortType: sortType
            };
        };

        // Mark Original Positions
        for (i = 0; i < rows.length; i++) {
            rows[i].__oi = i;
            Object.defineProperty(rows[i], '__oi', NOT_ENUMERABLE);
        }

        return {
            setStableSorting: function(stableSorting) {
                this.stableSorting = stableSorting;
            },

            setSortType: function(colName, sortType, subType) {
                colInfo = colInfos[colName];

                if (colInfo === undefined) {
                    colInfo = {};
                    colInfos[colName] = colInfo;
                }

                colInfo.sortType = sortType;
                colInfo.subType = subType;
            },

            sort: function(colName) {
                var colInfo = colInfos[colName];

                if (colInfo === undefined) {
                    detectBestSortType(colName);
                }

                colInfo = colInfos[colName];

                switch (colInfo.sortType) {
                    case 'number':
                        flashSort();
                        break;
                    default:
                        break;
                }

                dirty = false;
            },

            reverseCurrentSort: function() {
                if (dirty) {
                    throw {
                        message: "Dirty"
                    };
                }
                if (stableSorting) {
                    stableReverse(rows, lastSortColumn);
                } else {
                    rows.reverse();
                }
            },

            markAsDirty: function() {
                dirty = false;
            },

            revertToOriginal: function() {
                var temp;

                for (i = 0; i < rows.length; i++) {
                    j = rows.__oi;
                    if (j !== i) {
                        temp = rows[j];
                        rows[j] = rows[i];
                        rows[i] = temp;
                    }
                }
            }

        };
    };

    hypersort.quicksort = function(rows, colName) {
        stablizableQuicksort(rows, colName, false);
    };

    hypersort.stableQuicksort = function(rows, colName) {
        stablizableQuicksort(rows, colName, true);
    };

    hypersort.fasterQuicksort = function(rows, colName) {
        stablizableFasterQuicksort(rows, colName, false);
    };

    hypersort.stableFasterQuicksort = function(rows, colName) {
        stablizableFasterQuicksort(rows, colName, true);
    };

    hypersort.nativeSort = function(rows, colName) {
        stablizableNativeSort(rows, colName, false);
    };

    hypersort.stableNativeSort = function(rows, colName) {
        stablizableNativeSort(rows, colName, true);
    };

    hypersort.flashSort = function(rows, colName) {
        flashSort(rows, colName);
    };

    hypersort.stableFlashSort = function(rows, colName) {
        flashSort(rows, colName);
        stablizeSorted(rows, colName);
    };

    var partialReverse = function(rows, from, to) {
        if (to === from) {
            return;
        } else {
            var halfway = ((to - from) / 2);
            for (var i = 0; i < halfway; i++) {
                temp = rows[to - i];
                rows[to - i] = rows[from + i];
                rows[from + i] = temp;
            }
        }
    };

    hypersort.stableReverse = function(rows, colName) {
        rows.reverse();

        var s = '(function(d) { return d.' + colName + '; })';
        var f = eval(s); // jshint ignore:line

        var runValue = f(rows[0]);
        var startRun = 0;

        for (var i = 1; i < rows.length; i++) {
            var value = f(rows[i]);

            if (value != runValue) {
                partialReverse(rows, startRun, i - 1);
                startRun = i;
                runValue = value;
            }
        }

        partialReverse(rows, startRun, i - 1);
    };

    var stablizeSorted = function(rows, colName) {
        var s = '(function(d) { return d.' + colName + '; })';
        var f = eval(s); // jshint ignore:line

        var runValue = f(rows[0]);
        var startRun = 0;

        var sort = quicksort_by(function(d) {
            return d.__i;
        });

        for (var i = 1; i < rows.length; i++) {
            var value = f(rows[i]);

            if (value != runValue) {

                // for (var j = startRun; j < i; j++) {
                //     console.log(j + ': ' + rows[j].__i + ' ' + rows[j].textValue);
                // }

                sort(rows, startRun, i);

                // console.log('after');
                // for (j = startRun; j < i; j++) {
                //     console.log(j + ': ' + rows[j].__i + ' ' + rows[j].textValue);
                // }
                startRun = i;
                runValue = value;
            }
        }

        sort(rows, startRun, i);
    };


    function stablizableNativeSort(rows, colName, isStable) {
        // console.log('nativeSort: ' + isStable);

        var s = '';
        s += '(function(a, b) { \n';
        s += '    if (a.colName < b.colName) { \n';
        s += '        return -1; \n';
        s += '    } else if (a.colName > b.colName) { \n';
        s += '        return 1; \n';
        s += '    } else { \n';

        if (isStable) {
            markIndices(rows);
            s += '      if (a.__i > b.__i) { \n';
            s += '            return 1; \n';
            s += '      } else { \n';
            s += '          return -1; \n';
            s += '      } \n';
        } else {
            s += '        return 0; \n';
        }

        s += '    } \n';
        s += '}) \n';

        s = s.replace(/colName/g, colName);

        var compare = eval(s); // jshint ignore:line

        rows.sort(compare);
    }



    function stablizableQuicksort(rows, colName, isStable) {
        var s = '(function(d) { return d.' + colName + '; })';

        var f = eval(s); // jshint ignore:line

        var sort = quicksort_by(f, isStable);

        markIndices(rows);

        sort(rows, 0, rows.length);
    }

    function stablizableFasterQuicksort(rows, colName, isStable) {
        var s = '(function(d) { return d.' + colName + '; })';

        var f = eval(s); // jshint ignore:line

        var sort = fasterQuicksort_by(f, isStable);

        markIndices(rows);

        sort(rows, 0, rows.length);

        if (isStable) {
            stablizeSorted(rows, colName);
        }
    }



    var NOT_ENUMERABLE = {
        enumerable: false
    };

    function markIndices(rows) {
        for (var i = 0; i < rows.length; i++) {
            rows[i].__i = i;
            Object.defineProperty(rows[i], '__i', NOT_ENUMERABLE);
        }
    }

    //////////////////////////////////////////////
    ////  BEGIN of Insertion Sort and QuickSort
    //////////////////////////////////////////////


    function insertionsort_by(f, isStable) {

        var gt = function(f) {
            return function(x1, x2, e1, e2) {
                if (x1 > x2) {
                    return true;
                } else if (isStable && (x1 === x2)) { // ((x1 >= x2) && (x2 >= x1)) { // Need Coersion because == and === do not force Object.prototype.valueOf()
                    return (e1.__i > e2.__i);
                } else {
                    return false;
                }
            };
        }();

        function insertionsort(a, lo, hi) {
            // console.log('IN INSERT: ' + lo + ' ' + hi);

            for (var i = lo + 1; i < hi; ++i) {
                var j = i,
                    t = a[i],
                    x = f(t);
                for (; j > lo && gt(f(a[j - 1]), x, a[j - 1], t); --j) {
                    a[j] = a[j - 1];
                }
                a[j] = t;
            }

            // for (i = lo; i < hi; i++) {
            //     console.log('insCheck[' + i + ']: ' + a[i]);
            // }
            return a;
        }

        return insertionsort;
    }

    function quicksort_by(f, isStable) {

        var insertionSort = insertionsort_by(f, isStable);

        var gt = function(f) {
            return function(x1, x2, e1, e2) {
                if (x1 > x2) {
                    return true;
                } else if (isStable && (x1 === x2)) { // ((x1 >= x2) && (x2 >= x1)) { // Need Coersion because == and === do not force Object.prototype.valueOf()
                    return (e1.__i > e2.__i);
                } else {
                    return false;
                }
            };
        }();

        var lt = function(f) {
            return function(x1, x2, e1, e2) {
                if (x1 < x2) {
                    return true;
                } else if (isStable && (x1 === x2)) { // ((x1 >= x2) && (x2 >= x1)) { // Need Coersion because == and === do not force Object.prototype.valueOf()
                    return (e1.__i < e2.__i);
                } else {
                    return false;
                }

            };
        }();

        var eq = function(f) {
            return function(x1, x2, e1, e2) {
                if (!(gt(x1, x2, e1, e2) || lt(x1, x2, e1, e2))) {
                    // return true;
                    if (isStable) {
                        return (e1.__i < e2.__i);
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            };
        }();


        function sort(a, lo, hi) {
            // console.log('Sort: ' + lo + ' ' + hi);
            var needsInsertionSort = (hi - lo < quicksort_sizeThreshold);
            if (needsInsertionSort) {
                return insertionSort(a, lo, hi);
            } else {
                return quicksort(a, lo, hi);
            }

        }

        function quicksort(a, lo, hi) {
            // continuesole.log('IN Quick: ' + lo + ' ' + hi);
            // Compute the two pivots by looking at 5 elements.
            var sixth = (hi - lo) / 6 | 0,
                i1 = lo + sixth,
                i5 = hi - 1 - sixth,
                i3 = lo + hi - 1 >> 1, // The midpoint.
                i2 = i3 - sixth,
                i4 = i3 + sixth;

            var e1 = a[i1],
                x1 = f(e1),
                e2 = a[i2],
                x2 = f(e2),
                e3 = a[i3],
                x3 = f(e3),
                e4 = a[i4],
                x4 = f(e4),
                e5 = a[i5],
                x5 = f(e5);

            var t;

            // Sort the selected 5 elements using a sorting network.
            if (gt(x1, x2, e1, e2)) {
                t = e1;
                e1 = e2;
                e2 = t;
                t = x1;
                x1 = x2;
                x2 = t;
            }
            if (gt(x4, x5, e4, e5)) {
                t = e4;
                e4 = e5;
                e5 = t;
                t = x4;
                x4 = x5;
                x5 = t;
            }
            if (gt(x1, x3, e1, e3)) {
                t = e1;
                e1 = e3;
                e3 = t;
                t = x1;
                x1 = x3;
                x3 = t;
            }
            if (gt(x2, x3, e2, e3)) {
                t = e2;
                e2 = e3;
                e3 = t;
                t = x2;
                x2 = x3;
                x3 = t;
            }
            if (gt(x1, x4, e1, e4)) {
                t = e1;
                e1 = e4;
                e4 = t;
                t = x1;
                x1 = x4;
                x4 = t;
            }
            if (gt(x3, x4, e3, e4)) {
                t = e3;
                e3 = e4;
                e4 = t;
                t = x3;
                x3 = x4;
                x4 = t;
            }
            if (gt(x2, x5, e2, e5)) {
                t = e2;
                e2 = e5;
                e5 = t;
                t = x2;
                x2 = x5;
                x5 = t;
            }
            if (gt(x2, x3, e2, e3)) {
                t = e2;
                e2 = e3;
                e3 = t;
                t = x2;
                x2 = x3;
                x3 = t;
            }
            if (gt(x4, x5, e4, e5)) {
                t = e4;
                e4 = e5;
                e5 = t;
                t = x4;
                x4 = x5;
                x5 = t;
            }

            var pivot1 = e2,
                pivotValue1 = x2,
                pivot2 = e4,
                pivotValue2 = x4;

            // e2 and e4 have been saved in the pivot variables. They will be written
            // back, once the partitioning is finished.
            a[i1] = e1;
            a[i2] = a[lo];
            a[i3] = e3;
            a[i4] = a[hi - 1];
            a[i5] = e5;

            var less = lo + 1, // First element in the middle partition.
                great = hi - 2; // Last element in the middle partition.

            var greatValue, lessValue, // temp var
                greatElt, lessElt,
                k, // looping var
                ek, xk; // temp var

            // Note that for value comparison, <, <=, >= and > coerce to a primitive via
            // Object.prototype.valueOf; == and === do not, so in order to be consistent
            // with natural order (such as for Date objects), we must do two compares.
            // NOTE: In the Stable implemntation this pivotsEqual is always FALSE
            var pivotsEqual = eq(pivotValue1, pivotValue2, pivot1, pivot2); // This will always be false for    
            if (pivotsEqual) {

                // Degenerated case where the partitioning becomes a dutch national flag
                // problem.
                //
                // [ |  < pivot  | == pivot | unpartitioned | > pivot  | ]
                //  ^             ^          ^             ^            ^
                // left         less         k           great         right
                //
                // a[left] and a[right] are undefined and are filled after the
                // partitioning.
                //
                // Invariants:
                //   1) for x in ]left, less[ : x < pivot.
                //   2) for x in [less, k[ : x == pivot.
                //   3) for x in ]great, right[ : x > pivot.
                for (k = less; k <= great; ++k) {
                    ek = a[k];
                    xk = f(ek);
                    if (lt(xk, pivotValue1, ek, pivot1)) {
                        if (k !== less) {
                            a[k] = a[less];
                            a[less] = ek;
                        }
                        ++less;
                    } else if (gt(xk, pivotValue1, ek, pivot1)) {

                        // Find the first element <= pivot in the range [k - 1, great] and
                        // put [:ek:] there. We know that such an element must exist:
                        // When k == less, then el3 (which is equal to pivot) lies in the
                        // interval. Otherwise a[k - 1] == pivot and the search stops at k-1.
                        // Note that in the latter case invariant 2 will be violated for a
                        // short amount of time. The invariant will be restored when the
                        // pivots are put into their final positions.
                        while (true) {
                            greatElt = a[great];
                            greatValue = f(a[great]);
                            if (gt(greatValue, pivotValue1, greatElt, pivot1)) {
                                great--;
                                // This is the only location in the while-loop where a new
                                // iteration is started.
                                continue;
                            } else if (lt(greatValue, pivotValue1, greatElt, pivot1)) {
                                // Triple exchange.
                                a[k] = a[less];
                                a[less++] = a[great];
                                a[great--] = ek;
                                break;
                            } else {
                                a[k] = a[great];
                                a[great--] = ek;
                                // Note: if great < k then we will exit the outer loop and fix
                                // invariant 2 (which we just violated).
                                break;
                            }
                        }
                    }
                }
            } else {

                // We partition the list into three parts:
                //  1. < pivot1
                //  2. >= pivot1 && <= pivot2
                //  3. > pivot2
                //
                // During the loop we have:
                // [ | < pivot1 | >= pivot1 && <= pivot2 | unpartitioned  | > pivot2  | ]
                //  ^            ^                        ^              ^             ^
                // left         less                     k              great        right
                //
                // a[left] and a[right] are undefined and are filled after the
                // partitioning.
                //
                // Invariants:
                //   1. for x in ]left, less[ : x < pivot1
                //   2. for x in [less, k[ : pivot1 <= x && x <= pivot2
                //   3. for x in ]great, right[ : x > pivot2
                for (k = less; k <= great; k++) {
                    ek = a[k];
                    xk = f(ek);
                    if (lt(xk, pivotValue1, ek, pivot1)) {
                        if (k !== less) {
                            a[k] = a[less];
                            a[less] = ek;
                        }
                        ++less;
                    } else {
                        if (gt(xk, pivotValue2, ek, pivot2)) {
                            while (true) {
                                greatElt = a[great];
                                greatValue = f(a[great]);
                                if (gt(greatValue, pivotValue2, greatElt, pivot2)) {
                                    great--;
                                    if (great < k) break;
                                    // This is the only location inside the loop where a new
                                    // iteration is started.
                                    continue;
                                } else {
                                    // a[great] <= pivot2.
                                    if (lt(greatValue, pivotValue1, greatElt, pivot1)) {
                                        // Triple exchange.
                                        a[k] = a[less];
                                        a[less++] = a[great];
                                        a[great--] = ek;
                                    } else {
                                        // a[great] >= pivot1.
                                        a[k] = a[great];
                                        a[great--] = ek;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            // Move pivots into their final positions.
            // We shrunk the list from both sides (a[left] and a[right] have
            // meaningless values in them) and now we move elements from the first
            // and third partition into these locations so that we can store the
            // pivots.
            a[lo] = a[less - 1];
            a[less - 1] = pivot1;
            a[hi - 1] = a[great + 1];
            a[great + 1] = pivot2;

            // The list is now partitioned into three partitions:
            // [ < pivot1   | >= pivot1 && <= pivot2   |  > pivot2   ]
            //  ^            ^                        ^             ^
            // left         less                     great        right

            // Recursive descent. (Don't include the pivot values.)
            sort(a, lo, less - 1);
            sort(a, great + 2, hi);

            if (pivotsEqual) {
                // All elements in the second partition are equal to the pivot. No
                // need to sort them.
                return a;
            }

            // In theory it should be enough to call _doSort recursively on the second
            // partition.
            // The Android source however removes the pivot elements from the recursive
            // call if the second partition is too large (more than 2/3 of the list).
            if (less < i1 && great > i5) {
                // while ((lessValue = f(a[less])) <= pivotValue1 && lessValue >= pivotValue1) ++less;
                // while ((greatValue = f(a[great])) <= pivotValue2 && greatValue >= pivotValue2) --great;

                for (;;) {
                    lessElt = a[less];
                    lessValue = f(a[less]);

                    if (eq(lessValue, pivotValue1, lessElt, pivot1)) {
                        ++less;
                    } else {
                        break;
                    }
                }

                for (;;) {
                    greatElt = a[great];
                    greatValue = f(a[great]);

                    if (eq(greatValue, pivotValue2, greatElt, pivot2)) {
                        --great;
                    } else {
                        break;
                    }
                }


                // Copy paste of the previous 3-way partitioning with adaptions.
                //
                // We partition the list into three parts:
                //  1. == pivot1
                //  2. > pivot1 && < pivot2
                //  3. == pivot2
                //
                // During the loop we have:
                // [ == pivot1 | > pivot1 && < pivot2 | unpartitioned  | == pivot2 ]
                //              ^                      ^              ^
                //            less                     k              great
                //
                // Invariants:
                //   1. for x in [ *, less[ : x == pivot1
                //   2. for x in [less, k[ : pivot1 < x && x < pivot2
                //   3. for x in ]great, * ] : x == pivot2
                for (k = less; k <= great; k++) {
                    ek = a[k];
                    xk = f(ek);
                    if (eq(xk, pivotValue1, ek, pivot1)) {
                        if (k !== less) {
                            a[k] = a[less];
                            a[less] = ek;
                        }
                        less++;
                    } else {
                        if (eq(xk, pivotValue2, ek, pivot2)) {
                            while (true) {
                                greatElt = a[great];
                                greatValue = f(a[great]);
                                if (eq(greatValue, pivotValue2, greatElt, pivot2)) {
                                    great--;
                                    if (great < k) break;
                                    // This is the only location inside the loop where a new
                                    // iteration is started.
                                    continue;
                                } else {
                                    // a[great] < pivot2.
                                    if (lt(greatValue, pivotValue1, greatElt, pivot1)) {
                                        // Triple exchange.
                                        a[k] = a[less];
                                        a[less++] = a[great];
                                        a[great--] = ek;
                                    } else {
                                        // a[great] == pivot1.
                                        a[k] = a[great];
                                        a[great--] = ek;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            // The second partition has now been cleared of pivot elements and looks
            // as follows:
            // [  *  |  > pivot1 && < pivot2  | * ]
            //        ^                      ^
            //       less                  great
            // Sort the second partition using recursive descent.

            // The second partition looks as follows:
            // [  *  |  >= pivot1 && <= pivot2  | * ]
            //        ^                        ^
            //       less                    great
            // Simply sort it by recursive descent.

            return sort(a, less, great + 1);
        }

        return sort;
    }

    var quicksort_sizeThreshold = 32;

    //////////////////////////////////////////////
    ////  END of Insertion Sort and QuickSort
    //////////////////////////////////////////////

    //////////////////////////////////////////////
    ////  BEGIN of Faster Insertion Sort and QuickSort
    //////////////////////////////////////////////
    /* jshint ignore:start */

    function fasterInsertionsort_by(f) {

        function insertionsort(a, lo, hi) {
            for (var i = lo + 1; i < hi; ++i) {
                for (var j = i, t = a[i], x = f(t); j > lo && f(a[j - 1]) > x; --j) {
                    a[j] = a[j - 1];
                }
                a[j] = t;
            }
            return a;
        }

        return insertionsort;
    }

    // Algorithm designed by Vladimir Yaroslavskiy.
    // Implementation based on the Dart project; see lib/dart/LICENSE for details.

    function fasterQuicksort_by(f) {
        var insertionsort = fasterInsertionsort_by(f);

        function sort(a, lo, hi) {
            return (hi - lo < fasterQuicksort_sizeThreshold ? insertionsort : fasterQuicksort)(a, lo, hi);
        }

        function fasterQuicksort(a, lo, hi) {
            // Compute the two pivots by looking at 5 elements.
            var sixth = (hi - lo) / 6 | 0,
                i1 = lo + sixth,
                i5 = hi - 1 - sixth,
                i3 = lo + hi - 1 >> 1, // The midpoint.
                i2 = i3 - sixth,
                i4 = i3 + sixth;

            var e1 = a[i1],
                x1 = f(e1),
                e2 = a[i2],
                x2 = f(e2),
                e3 = a[i3],
                x3 = f(e3),
                e4 = a[i4],
                x4 = f(e4),
                e5 = a[i5],
                x5 = f(e5);

            var t;

            // Sort the selected 5 elements using a sorting network.
            if (x1 > x2) t = e1, e1 = e2, e2 = t, t = x1, x1 = x2, x2 = t;
            if (x4 > x5) t = e4, e4 = e5, e5 = t, t = x4, x4 = x5, x5 = t;
            if (x1 > x3) t = e1, e1 = e3, e3 = t, t = x1, x1 = x3, x3 = t;
            if (x2 > x3) t = e2, e2 = e3, e3 = t, t = x2, x2 = x3, x3 = t;
            if (x1 > x4) t = e1, e1 = e4, e4 = t, t = x1, x1 = x4, x4 = t;
            if (x3 > x4) t = e3, e3 = e4, e4 = t, t = x3, x3 = x4, x4 = t;
            if (x2 > x5) t = e2, e2 = e5, e5 = t, t = x2, x2 = x5, x5 = t;
            if (x2 > x3) t = e2, e2 = e3, e3 = t, t = x2, x2 = x3, x3 = t;
            if (x4 > x5) t = e4, e4 = e5, e5 = t, t = x4, x4 = x5, x5 = t;

            var pivot1 = e2,
                pivotValue1 = x2,
                pivot2 = e4,
                pivotValue2 = x4;

            // e2 and e4 have been saved in the pivot variables. They will be written
            // back, once the partitioning is finished.
            a[i1] = e1;
            a[i2] = a[lo];
            a[i3] = e3;
            a[i4] = a[hi - 1];
            a[i5] = e5;

            var less = lo + 1, // First element in the middle partition.
                great = hi - 2; // Last element in the middle partition.

            // Note that for value comparison, <, <=, >= and > coerce to a primitive via
            // Object.prototype.valueOf; == and === do not, so in order to be consistent
            // with natural order (such as for Date objects), we must do two compares.
            var pivotsEqual = pivotValue1 <= pivotValue2 && pivotValue1 >= pivotValue2;
            if (pivotsEqual) {

                // Degenerated case where the partitioning becomes a dutch national flag
                // problem.
                //
                // [ |  < pivot  | == pivot | unpartitioned | > pivot  | ]
                //  ^             ^          ^             ^            ^
                // left         less         k           great         right
                //
                // a[left] and a[right] are undefined and are filled after the
                // partitioning.
                //
                // Invariants:
                //   1) for x in ]left, less[ : x < pivot.
                //   2) for x in [less, k[ : x == pivot.
                //   3) for x in ]great, right[ : x > pivot.
                for (var k = less; k <= great; ++k) {
                    var ek = a[k],
                        xk = f(ek);
                    if (xk < pivotValue1) {
                        if (k !== less) {
                            a[k] = a[less];
                            a[less] = ek;
                        }
                        ++less;
                    } else if (xk > pivotValue1) {

                        // Find the first element <= pivot in the range [k - 1, great] and
                        // put [:ek:] there. We know that such an element must exist:
                        // When k == less, then el3 (which is equal to pivot) lies in the
                        // interval. Otherwise a[k - 1] == pivot and the search stops at k-1.
                        // Note that in the latter case invariant 2 will be violated for a
                        // short amount of time. The invariant will be restored when the
                        // pivots are put into their final positions.
                        while (true) {
                            var greatValue = f(a[great]);
                            if (greatValue > pivotValue1) {
                                great--;
                                // This is the only location in the while-loop where a new
                                // iteration is started.
                                continue;
                            } else if (greatValue < pivotValue1) {
                                // Triple exchange.
                                a[k] = a[less];
                                a[less++] = a[great];
                                a[great--] = ek;
                                break;
                            } else {
                                a[k] = a[great];
                                a[great--] = ek;
                                // Note: if great < k then we will exit the outer loop and fix
                                // invariant 2 (which we just violated).
                                break;
                            }
                        }
                    }
                }
            } else {

                // We partition the list into three parts:
                //  1. < pivot1
                //  2. >= pivot1 && <= pivot2
                //  3. > pivot2
                //
                // During the loop we have:
                // [ | < pivot1 | >= pivot1 && <= pivot2 | unpartitioned  | > pivot2  | ]
                //  ^            ^                        ^              ^             ^
                // left         less                     k              great        right
                //
                // a[left] and a[right] are undefined and are filled after the
                // partitioning.
                //
                // Invariants:
                //   1. for x in ]left, less[ : x < pivot1
                //   2. for x in [less, k[ : pivot1 <= x && x <= pivot2
                //   3. for x in ]great, right[ : x > pivot2
                for (var k = less; k <= great; k++) {
                    var ek = a[k],
                        xk = f(ek);
                    if (xk < pivotValue1) {
                        if (k !== less) {
                            a[k] = a[less];
                            a[less] = ek;
                        }
                        ++less;
                    } else {
                        if (xk > pivotValue2) {
                            while (true) {
                                var greatValue = f(a[great]);
                                if (greatValue > pivotValue2) {
                                    great--;
                                    if (great < k) break;
                                    // This is the only location inside the loop where a new
                                    // iteration is started.
                                    continue;
                                } else {
                                    // a[great] <= pivot2.
                                    if (greatValue < pivotValue1) {
                                        // Triple exchange.
                                        a[k] = a[less];
                                        a[less++] = a[great];
                                        a[great--] = ek;
                                    } else {
                                        // a[great] >= pivot1.
                                        a[k] = a[great];
                                        a[great--] = ek;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            // Move pivots into their final positions.
            // We shrunk the list from both sides (a[left] and a[right] have
            // meaningless values in them) and now we move elements from the first
            // and third partition into these locations so that we can store the
            // pivots.
            a[lo] = a[less - 1];
            a[less - 1] = pivot1;
            a[hi - 1] = a[great + 1];
            a[great + 1] = pivot2;

            // The list is now partitioned into three partitions:
            // [ < pivot1   | >= pivot1 && <= pivot2   |  > pivot2   ]
            //  ^            ^                        ^             ^
            // left         less                     great        right

            // Recursive descent. (Don't include the pivot values.)
            sort(a, lo, less - 1);
            sort(a, great + 2, hi);

            if (pivotsEqual) {
                // All elements in the second partition are equal to the pivot. No
                // need to sort them.
                return a;
            }

            // In theory it should be enough to call _doSort recursively on the second
            // partition.
            // The Android source however removes the pivot elements from the recursive
            // call if the second partition is too large (more than 2/3 of the list).
            if (less < i1 && great > i5) {
                var lessValue, greatValue;
                while ((lessValue = f(a[less])) <= pivotValue1 && lessValue >= pivotValue1) ++less;
                while ((greatValue = f(a[great])) <= pivotValue2 && greatValue >= pivotValue2) --great;

                // Copy paste of the previous 3-way partitioning with adaptions.
                //
                // We partition the list into three parts:
                //  1. == pivot1
                //  2. > pivot1 && < pivot2
                //  3. == pivot2
                //
                // During the loop we have:
                // [ == pivot1 | > pivot1 && < pivot2 | unpartitioned  | == pivot2 ]
                //              ^                      ^              ^
                //            less                     k              great
                //
                // Invariants:
                //   1. for x in [ *, less[ : x == pivot1
                //   2. for x in [less, k[ : pivot1 < x && x < pivot2
                //   3. for x in ]great, * ] : x == pivot2
                for (var k = less; k <= great; k++) {
                    var ek = a[k],
                        xk = f(ek);
                    if (xk <= pivotValue1 && xk >= pivotValue1) {
                        if (k !== less) {
                            a[k] = a[less];
                            a[less] = ek;
                        }
                        less++;
                    } else {
                        if (xk <= pivotValue2 && xk >= pivotValue2) {
                            while (true) {
                                var greatValue = f(a[great]);
                                if (greatValue <= pivotValue2 && greatValue >= pivotValue2) {
                                    great--;
                                    if (great < k) break;
                                    // This is the only location inside the loop where a new
                                    // iteration is started.
                                    continue;
                                } else {
                                    // a[great] < pivot2.
                                    if (greatValue < pivotValue1) {
                                        // Triple exchange.
                                        a[k] = a[less];
                                        a[less++] = a[great];
                                        a[great--] = ek;
                                    } else {
                                        // a[great] == pivot1.
                                        a[k] = a[great];
                                        a[great--] = ek;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            // The second partition has now been cleared of pivot elements and looks
            // as follows:
            // [  *  |  > pivot1 && < pivot2  | * ]
            //        ^                      ^
            //       less                  great
            // Sort the second partition using recursive descent.

            // The second partition looks as follows:
            // [  *  |  >= pivot1 && <= pivot2  | * ]
            //        ^                        ^
            //       less                    great
            // Simply sort it by recursive descent.

            return sort(a, less, great + 1);
        }

        return sort;
    }

    /* jshint ignore:end */

    //////////////////////////////////////////////
    ////  END of Faster Insertion Sort and QuickSort
    //////////////////////////////////////////////


    //////////////////////////////////////////////
    ////  BEGIN of Flash Sort
    //////////////////////////////////////////////

    var flashSort = function(a, property) {
        var strVar = "(function(a) { ";
        strVar += "        var n = a.length;";
        strVar += "";
        strVar += "        var i = 0, j = 0, k = 0, t;";
        strVar += "        var m = ~~( n * 0.125 );";
        strVar += "        var a_nmin = a[0];";
        strVar += "        var nmax = 0;";
        strVar += "        var nmove = 0;";
        strVar += "";
        strVar += "        var l = new Array(m);";
        strVar += "        for ( i = 0; i < m; i++ ) {";
        strVar += "            l[ i ] = 0;";
        strVar += "        }";
        strVar += "";
        strVar += "        for ( i = 1; i < n; ++i ) {";
        strVar += "            var a_i = a[ i ];";
        strVar += "            if ( a_i." + property + " < a_nmin." + property + " ) { a_nmin = a_i; }";
        strVar += "            if ( a_i." + property + " > a[ nmax ]." + property + " ) { nmax = i; }";
        strVar += "        }";
        strVar += "";
        strVar += "        var a_nmax = a[ nmax ];";
        strVar += "        if ( a_nmin." + property + " === a_nmax." + property + ") { return a; }";
        strVar += "        var c1 = ( m - 1 ) \/ ( a_nmax." + property + " - a_nmin." + property + " );";
        strVar += "";
        strVar += "        for ( i = 0; i < n; ++i ) {";
        strVar += "            ++l[ ~~( c1 * ( a[ i ]." + property + " - a_nmin." + property + " ) ) ];";
        strVar += "        }";
        strVar += "";
        strVar += "        for ( k = 1; k < m; ++k ) {";
        strVar += "            l[ k ] += l[ k - 1 ];";
        strVar += "        }";
        strVar += "";
        strVar += "        var hold = a_nmax;";
        strVar += "        a[ nmax ] = a[ 0 ];";
        strVar += "        a[ 0 ] = hold;";
        strVar += "";
        strVar += "        var flash;";
        strVar += "        j = 0;";
        strVar += "        k = m - 1;";
        strVar += "        i = n - 1;";
        strVar += "";
        strVar += "        while ( nmove < i ) {";
        strVar += "            while ( j > ( l[ k ] - 1 ) ) {";
        strVar += "                k = ~~( c1 * ( a[ ++j ]." + property + " - a_nmin." + property + " ) );";
        strVar += "            }";
        strVar += "            if (k < 0) { break; }";
        strVar += "";
        strVar += "            flash = a[ j ];";
        strVar += "";
        strVar += "            while ( j !== l[ k ] ) {";
        strVar += "                k = ~~( c1 * ( flash." + property + " - a_nmin." + property + " ) );";
        strVar += "                hold = a[ t = --l[ k ] ];";
        strVar += "                a[ t ] = flash;";
        strVar += "                flash = hold;";
        strVar += "                ++nmove;";
        strVar += "            }";
        strVar += "        }";
        strVar += "";
        strVar += "        for( j = 1; j < n; ++j ) {";
        strVar += "            hold = a[ j ];";
        strVar += "            i = j - 1;";
        strVar += "            while( i >= 0 && a[i]." + property + " > hold." + property + " ) {";
        strVar += "                a[ i + 1 ] = a[ i-- ];";
        strVar += "            }";
        strVar += "            a[ i + 1 ] = hold;";
        strVar += "        }";
        strVar += "";
        strVar += "        return a; })";
        var sortFunction = eval(strVar); // jshint ignore:line
        sortFunction(a);
    };

    var fasterQuicksort_sizeThreshold = 32;


    //////////////////////////////////////////////
    ////  END of Flash Sort
    //////////////////////////////////////////////

    var sortTypes = [{
        name: 'Quicksort',
        sortFunction: hypersort.quicksort,
        isStable: false,
        bestFor: [],
    }, {
        name: 'Stable Quicksort',
        sortFunction: hypersort.stableQuicksort,
        isStable: true,
        bestFor: ['object', 'string'],
    }, {
        name: 'Faster Quicksort',
        sortFunction: hypersort.fasterQuicksort,
        isStable: false,
        bestFor: ['object', 'string'],
    }, {
        name: 'Stable Faster Quicksort',
        sortFunction: hypersort.stableFasterQuicksort,
        isStable: true,
        bestFor: ['object', 'string'],
    }, {
        name: 'Native Sort',
        sortFunction: hypersort.nativeSort,
        isStable: false,
        bestFor: ['object'],
    }, {
        name: 'Stable Native Sort',
        sortFunction: hypersort.stableNativeSort,
        isStable: true,
        bestFor: ['number'],
    }, {

        name: 'Flash Sort',
        sortFunction: hypersort.flashSort,
        isStable: false,
        bestFor: ['number'],
    }, {
        name: 'Stable Flash Sort',
        sortFunction: hypersort.stableFlashSort,
        isStable: true,
        bestFor: ['number'],
    }];

    var availableSorts = [];

    hypersort.getSortTypes = function() {
        return sortTypes;
    };



})((typeof exports !== 'undefined' && exports) || this);
