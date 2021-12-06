// C version of the code: https://gist.github.com/komasaru/9e418eb666ab649ef589
const Decimal = require('decimal.js')
const fs = require('fs')


d = 100000 // digit to compute

d--

function S(j) {
  let s = 0.0;        // Summation of Total, Left
  let t;              // Each term of right summation
  let r;              // Denominator
  let k;              // Loop index
  let EPS = 1.0e-17;  // Loop-exit accuration of the right summation

  // Left Sum (0 ... d)
  for (k = 0; k <= d; k++) {
      r = 8 * k + j;
      t = compModExp(16, d - k, r);
      t /= r;
      s += t%1;
      s -= Math.floor(s);
  }

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

  return s;
}

function compModExp(b, e, m) {
    let ans;

    if (e == 0) return 1;

    ans = compModExp(b, Math.floor(e / 2), m);
    ans = (ans * ans) % m;
    if ((e % 2) == 1) ans = (ans * b) % m;

    return ans;
}

function convHex(x) {
    let y = Math.abs(x);
    hx = "0123456789ABCDEF";
    let out = ""

    for (var i = 0; i < 16; i++) {
        y = 16.0 * (y - Math.floor(y));
        out += hx.charAt(Math.floor(y));
    }
    return out
}

function hexToDec(s) {
    var i, j, digits = [0], carry;
    for (i = 0; i < s.length; i ++) {
        carry = parseInt(s.charAt(i), 16);
        for (j = 0; j < digits.length; j += 1) {
            digits[j] = digits[j] * 16 + carry;
            carry = digits[j] / 10 | 0;
            digits[j] %= 10;
        }
        while (carry > 0) {
            digits.push(carry % 10);
            carry = carry / 10 | 0;
        }
    }
    return digits.reverse().join('');
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

Decimal.config({ precision: 1000 })

startTime = Date.now()
for (var i = 0; i < 100; i++) {
  pi = 4.0 * S(1) - 2.0 * S(4) - S(5) - S(6);
  pi = pi - Math.floor(pi) +1
}


endtime = Date.now()

console.log("time:"+(endtime-startTime))

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


/*
realPi = fs.readFileSync('pi.txt').toString()
correctDigits = checkDigits(based10PiTest, realPi)
console.log(correctDigits+" correct Digits")
//console.log(base10Pi)
console.log(numOfZeros)
console.log(based10PiTest)
console.log(realPi.substring(0,100))*/
