const Decimal = require('decimal.js')
const fs = require('fs')
const cluster = require('cluster')
const numCPUs = require('os').cpus().length
const process = require('process')

iterations = 1e4
Decimal.set({precision:170000})
/*iterations = 1e3
Decimal.set({precision:17000})*/
/*2e3: 32k
4e3: 64k
8e3: 128k
10e3: 160k
12e3: 192k
16e3: 256k*/

if (cluster.isPrimary) {
  partialSums = []
  function finish() {
    if (partialSumsRec == numCPUs) {
      clearInterval(finishID)
      constTerm = new Decimal(426880).mul(new Decimal(10005).sqrt())
      partialSum = new Decimal(13591409)
      //console.log(partialSums)
      for (var i = 0; i < partialSums.length; i++) {
        partialSum = partialSum.add(partialSums[i])
      }
      pi = constTerm.div(partialSum)
      //console.log(pi)
      endTime = Date.now()
      realPi = fs.readFileSync('pi.txt').toString()
      correctDigits = checkDigits(pi, realPi)
      console.log(iterations.toExponential().toString().replace(/\+/g, '')+": "+((endTime-startTime)/1000)+" seconds - "+correctDigits+" correct Digits")
      process.exit()
    }
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

  startTime = Date.now()
  console.log(new Date())
  partialSumsRec = 0
  for (var i = 0; i < numCPUs; i++) {
    console.log("starting worker "+(i+1))
    worker = cluster.fork({id:(i+1)})
    worker.on('message', msg => {
      partialSums.push(msg)
      partialSumsRec++
      console.log("finished worker")
    })
  }
  finishID = setInterval(finish,10)
} else {
  localPartialSum = new Decimal(0)
  exponentialTerm = new Decimal(1)
  linearTerm = new Decimal(13591409)
  for (var i = Number(process.env.id); i < iterations; i+=numCPUs) {
    multinomialTerm = factorial(6*i).div(factorial(3*i).mul(factorial(i).pow(3)))
    linearTerm = linearTerm.add(545140134*Math.min(i,numCPUs))
    for (var j = 0; j < Math.min(i,numCPUs); j++) {
      exponentialTerm = exponentialTerm.mul(-262537412640768000)
    }
    localPartialSum.add(multinomialTerm.mul(linearTerm).div(exponentialTerm))
  }
  process.send(localPartialSum)
}

function factorial(num) {
  num = Number(num)
  result = Decimal(num)
  while (num > 1) {
    num--
    result = result.mul(num);
  }
  return result;
}
