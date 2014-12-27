(function(exports) {

    exports.quicksort = function(rows, colName) {
        var isStable = false;

        stablizableQuicksort(rows, colName, isStable);
    };

    exports.stableQuicksort = function(rows, colName) {
        var isStable = true;

        stablizableQuicksort(rows, colName, isStable);
    };


    function stablizableQuicksort(rows, colName, isStable) {

        var sort = quicksort_by(function(d) {
            return d[colName];
        }, isStable);

        markIndices(rows);

        sort(rows, 0, rows.length);
    }

    function markIndices(rows) {
        for (var i = 0; i < rows.length; i++) {
            rows[i].__i = i;
        }
    }

    // quicksort.by = quicksort_by;

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

})(typeof exports !== 'undefined' && exports || this);
