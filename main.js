const Decimal = require('decimal.js')
const fs = require('fs')

realPi = fs.readFileSync('pi.txt').toString()

function factorial(num) {
  num = Number(num)
  result = Decimal(num)
  while (num > 1) {
    num--
    result = result.mul(num);
  }
  return result;
}

function leibnizPi(iterations) { // the original formula uses (-1)^i to deal with the negatives, but using modulo+ternary is faster in js. Roughly 1 second for 1e6 original vs 0.65 seconds for 1e6 modulo+ternary The original formula in JS would be Math.pow(-1, i)/((i*2)+1)
  quarterPi = 0
  for (var i = 0; i < iterations; i++) {
    quarterPi += 1/((i*2)+1)*(i%2==0 ? 1 : -1)
  }
  return quarterPi*4
}

function altLeibnizPi(iterations) { // alternate Leibniz found on craig-wood.com. In testing it is faster but by only 5% at best
  quarterPi = 0
  divisor = 1
  sign = 1
  for (var i = 0; i < iterations; i++) {
    quarterPi += sign/divisor
    divisor+=2
    sign = -sign
  }
  return quarterPi*4
}

function leibnizPiDecimal(iterations, precision) {
  Decimal.set({precision:precision})
  qPi = new Decimal(0)
  for (var i = 0; i < iterations; i++) {
    qPi = qPi.plus(new Decimal(1).div((i*2)+1).mul((i%2==0 ? 1 : -1)))
  }
  return qPi.mul(4)
}

function chudnovskyPiDecimal(iterations, precision) {
  Decimal.set({precision:precision})
  constTerm = new Decimal(426880).mul(new Decimal(10005).sqrt())
  exponentialTerm = new Decimal(1)
  linearTerm = new Decimal(13591409)
  partialSum = linearTerm
  for (var i = 1; i < iterations; i++) {
    multinomialTerm = factorial(6*i).div(factorial(3*i).mul(factorial(i).pow(3)))
    linearTerm = linearTerm.add(545140134)
    exponentialTerm = exponentialTerm.mul(-262537412640768000)
    partialSum = partialSum.add(multinomialTerm.mul(linearTerm).div(exponentialTerm))
  }
  return constTerm.div(partialSum)
}

function chudnovskyPi(iterations) {

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

console.log("Leibniz Vanilla:")
for (var i = 2; i < 7; i++) {
  startTime = Date.now()
  pi = leibnizPi(Math.pow(i,10))
  endTime = Date.now()

  console.log("1e"+i+": "+((endTime-startTime)/1000)+" seconds - "+pi+" - "+checkDigits(pi, Math.PI)+" correct Digits")
}

console.log("Alt Leibniz Vanilla:")
for (var i = 2; i < 7; i++) {
  startTime = Date.now()
  pi = altLeibnizPi(Math.pow(i,10))
  endTime = Date.now()

  console.log("1e"+i+": "+((endTime-startTime)/1000)+" seconds - "+pi+" - "+checkDigits(pi, Math.PI)+" correct Digits")
}

console.log("Leibniz Decimal:")
for (var i = 2; i < 4; i++) {
  startTime = Date.now()
  pi = leibnizPiDecimal(Math.pow(i,10), 50)
  endTime = Date.now()

  console.log("1e"+i+": "+((endTime-startTime)/1000)+" seconds - "+pi+" - "+checkDigits(pi, Math.PI)+" correct Digits")
}

precision = 2000
console.log("Chudnovsky Decimal:")
for (var i = 1; i < 100; i++) {
  startTime = Date.now()
  iter = Math.pow(i,2)

  pi = chudnovskyPiDecimal(iter, precision)
  endTime = Date.now()
  correctDigits = checkDigits(pi, realPi)
  console.log(iter.toExponential().toString().toString().replace(/\+/g, '')+": "+((endTime-startTime)/1000)+" seconds - "+correctDigits+" correct Digits")
  if (correctDigits+1000 > precision) {
    precision += 1000
  }
}
