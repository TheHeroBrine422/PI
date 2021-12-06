# PI

Messing around with various PI formulas. Used a few resources for this to make it easier to deal with. Didn't keep track of them all but got the original formulas from wikipedia.

chudnovskyPiDecimal() and chudnovskyPiClustered.js requires a modified version of Decimal that has higher precision limits. You need to set LN10_PRECISION and PI_PRECISION to higher values. I set mine to 1e100 in the copy included in node_modules.

### TODO:
I would like to write a GPU based version of this based on https://en.wikipedia.org/wiki/Bailey%E2%80%93Borwein%E2%80%93Plouffe_formula. This formula doesnt require massively precise data types since it can calculate specific digits of pi and so it should be relatively easy to implement.
