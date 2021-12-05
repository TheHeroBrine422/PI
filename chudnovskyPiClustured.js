const Decimal = require('decimal.js')
const fs = require('fs')
const cluster = require('cluster')
const numCPUs = require('os').cpus().length
const process = require('process')

iterations = 5e2
Decimal.set({precision:20000})

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
  partialSumsRec = 0
  for (var i = 0; i < numCPUs; i++) {
    console.log("starting worker "+(i+1))
    worker = cluster.fork({id:(i+1)})
    worker.on('message', msg => {
      for (var i = 0; i < msg.length; i++) {
        partialSums.push(msg[i])
      }
      partialSumsRec++
      console.log("finished worker")
    })
  }
  finishID = setInterval(finish,10)
} else {
  localpartialSums = []
  exponentialTerm = new Decimal(1)
  linearTerm = new Decimal(13591409)
  for (var i = Number(process.env.id); i < iterations; i+=numCPUs) {
    multinomialTerm = factorial(6*i).div(factorial(3*i).mul(factorial(i).pow(3)))
    linearTerm = linearTerm.add(545140134*Math.min(i,numCPUs))
    for (var j = 0; j < Math.min(i,numCPUs); j++) {
      exponentialTerm = exponentialTerm.mul(-262537412640768000)
    }
    localpartialSums.push(multinomialTerm.mul(linearTerm).div(exponentialTerm))
    //console.log(i)
  }
  process.send(localpartialSums)
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
