// C version of the code: https://gist.github.com/komasaru/9e418eb666ab649ef589
const Decimal = require('decimal.js')
const fs = require('fs')
const {GPU} = require('gpu.js')
const gpu = new GPU();

gpuMode = true

d = 1000000 // digit to compute

d--

kernelSize = 1024

massCompModExp = gpu.createKernel(function(a) {
  let m = 8 * a[this.thread.x][0] + a[this.thread.x][1]

  let ans = 1
  for (var i = 65; i > 1; i--) {
    ans = (ans*ans) % m
    if ((a[this.thread.x][i] % 2) == 1) {ans = (ans * 16) % m};
  }
  return (ans / m) % 1
}).setOutput([kernelSize]);

//let r = 8 * a[this.thread.x][1] + a[this.thread.x][2]
//return compModExp(a[this.thread.x][0] - a[this.thread.x][1], r) / r
function S(j) {
  let s = 0.0;        // Summation of Total, Left
  let t;              // Each term of right summation
  let r;              // Denominator
  let k;              // Loop index
  let EPS = 1.0e-17;  // Loop-exit accuration of the right summation

  if (!gpuMode) {
    // Left Sum (0 ... d)
    for (k = 0; k <= d; k++) {
        r = 8 * k + j;
        t = compModExp(d - k, r);
        t /= r;
        s += t%1;
        s -= Math.floor(s);
    }
  } else {

    gpuArray = []
    gpuArrays = []

    for (k = 0; k <= d; k++) {
      temp = [k, j]
      let eValues = [d - k]
      for (var i = 0; i < 63; i++) {
        eValues.push(Math.floor(eValues[eValues.length-1]/2))
      }

      temp = temp.concat(eValues)
      gpuArray.push(temp)

    }

    debugger

    /*while (true) {
      temp = gpuArray.splice(0, kernelSize)
      if (temp.length < kernelSize) {
        temp = temp.concat(Array(kernelSize-temp.length).fill(Array(66).fill(0)))
        gpuArrays.push(temp)
        break
      }
      gpuArrays.push(temp)
    }

    out = []
    for (var i = 0; i < gpuArrays.length; i++) {
      out.push(massCompModExp(gpuArrays[i]))
    }*/



    fin = []

    for (var i = 0; i < gpuArray.length; i++) {
      fin.push(gpuCompModExpTest(gpuArray[i]))
    }

    //console.log(fin[0])

    /*for (var i = 0; i < out.length; i++) {
      for (var j = 0; j < out[0].length; j++) {
        fin.push(out[i][j])
      }
    }*/

    debugger
    console.log(fin.length)
    nanCounter = 0

    for (var i = 0; i < fin.length; i++) {
      if (!Number.isNaN(fin[i])) { // check nan
        s += fin[i];
        s -= Math.floor(s);
      } else {
        nanCounter++
      }
    }
    console.log(nanCounter)
  }

  console.log(s)

console.log("first half time:"+(Date.now()-startTime))

  // Right sum (d + 1 ...)
  while (true) {
      r = 8 * k + j;
      t = Math.pow(16, d - k);
      t /= r;
      if (t < EPS) break;
      s += t;
      s -= Math.floor(s);
      k ++;
  }

  console.log("second half time:"+(Date.now()-startTime))


  return s;
}

function compModExpNonRecursive(e,m) {
  let eValues = [e]
  for (var i = 0; i < 63; i++) {
    eValues.push(Math.floor(eValues[eValues.length-1]/2))
  }

  let ans = 1
  for (var i = eValues.length-1; i > 0; i--) {
    ans = (ans*ans) % m
    if ((eValues[i] % 2) == 1) ans = (ans * 16) % m;
  }
  return ans
}

function gpuCompModExpTest(eValues) {
  let m = 8 * eValues[0] + eValues[1]

  let ans = 1
  for (var i = 65; i > 1; i--) {
    //console.log(i)
    ans = (ans*ans) % m
    if ((eValues[i] % 2) == 1) ans = (ans * 16) % m;
  }
  return (ans / m) % 1
}

function compModExp(e, m) {
    let ans;

    if (e == 0) return 1;

    ans = compModExp(Math.floor(e / 2), m);
    ans = (ans * ans) % m;
    if ((e % 2) == 1) ans = (ans * 16) % m;
    return ans;
}

function convHex(x) {
    let y = Math.abs(x);
    hx = "0123456789ABCDEF";
    let out = ""

    for (var i = 0; i < 4; i++) {
        y = 16.0 * (y - Math.floor(y));
        out += hx.charAt(Math.floor(y));
    }
    return out
}

function checkDigits(n1, n2) {
  n1 = n1.toString()
  n2 = n2.toString()
  correctDigits = 0
  for (var j = 0; j < n1.length; j++) {
    if (n1.charAt(j) == n2.charAt(j)) {correctDigits++} else {break}
  }
  return correctDigits
}

Decimal.config({ precision: 10 })

realPi = fs.readFileSync('pi.txt').toString()

console.log(new Date())
//hexPi = "0x3."
hexPi = ""
//d = 0

startTime = Date.now()
//for (var i = 0; i <10000; i++) {
  pi = 4.0 * S(1) - 2.0 * S(4) - S(5) - S(6);
  pi = pi - Math.floor(pi) +1
  d+=4
  hexPi += convHex(pi)
  //if(i/1000%1 == 0) {console.log(i+" "+(Date.now()-startTime))}
//}

console.log("time:"+(Date.now()-startTime))
console.log(hexPi)
//finPi = new Decimal(hexPi)
//console.log("convertTime:"+(Date.now()-startTime))

//correctDigits = checkDigits(finPi, realPi)
//console.log(correctDigits+" correct Digits")





/*
hexPiFirst = convHex(pi)

d = 16
pi = 4.0 * S(1) - 2.0 * S(4) - S(5) - S(6);
pi = pi - Math.floor(pi) +1

hexPiSecond = convHex(pi)

//console.log(pi)
console.log(hexPiFirst)
console.log(hexPiSecond)

base10Pi = new Decimal("0x3."+hexPiFirst)
console.log(base10Pi)
base10PiFirst = new Decimal("0x"+hexPiFirst.charAt(0)+"."+hexPiFirst.substring(1,hexPiFirst.length))
base10PiFirst = base10PiFirst.toFixed(15)
numOfZeros = 13
based10PiTest = new Decimal(base10PiFirst).add(new Decimal("0x0."+Array(numOfZeros).fill('0').join('')+hexPiSecond))
console.log(hexToDec(hexPiFirst))
*/
