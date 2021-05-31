let data = []

let ops = {
  '+': (op1, op2) => Number(op1) + Number(op2)

}

function onInputChange() {

  let row = event.target.parentNode.getAttribute('data-row-num')
  let col = event.target.parentNode.getAttribute('data-col-num')
  let content = event.target.value




  //if cell doesn't exist, make one from scratch


  let existingCell = data.find((cell) => cell.row == row && cell.col == col)
  if (!existingCell) {

    let cellObject = {}

    cellObject.row = row
    cellObject.col = col
    cellObject.dependencyOf = []


    if (content[0] == '=') {
      cellObject.isFormula = true


      let [result, dependencies] = parseFormula(content)

      

      cellObject.formula = content
      cellObject.content = result

      for (dependency of dependencies) {
        let [dependencyRow, dependencyCol] = cellIdToIndexes(dependency)


    

      

        getCellAt(dependencyRow, dependencyCol).dependencyOf.push(cellIndexesToId(row, col))
      }

    } else {
      cellObject.isFormula = false
      cellObject.content = content
    }

    data.push(cellObject)

  //otherwise, update the existing cell 
  } else {

    if (content[0] == '=') {
      existingCell.isFormula = true


      let [result, dependencies] = parseFormula(content)

      

      existingCell.formula = content
      existingCell.content = result

      for (dependency of dependencies) {
        let [dependencyRow, dependencyCol] = cellIdToIndexes(dependency)



        getCellAt(dependencyRow, dependencyCol).dependencyOf.push(cellIndexesToId(row, col))
      }

    } else {
      existingCell.isFormula = false
      existingCell.content = content
    }
  }



  // if (data.find((cell) => cell.row == row && cell.col == col)) {
  //   data.find((cell) => cell.row == row && cell.col == col).content = content
  // } else {
  //   data.push(cellObject)
  // }


  //update dependencies

  let thisCell = data.find((cell) => cell.row == row && cell.col == col)

  if (thisCell?.dependencyOf) {
    thisCell.dependencyOf.forEach((cellId) => {
      
      
      let cellToUpdate = getCellAt(...cellIdToIndexes(cellId))
     
      let formula = cellToUpdate.formula

      cellToUpdate.content = parseFormula(formula)[0]

    }) 
  }




  console.log('data', data)



}


let cellIdToIndexes = (id) => {

  rowLetter = id[0]
  row = rowLetter.charCodeAt(0) - 65

  col = id[1] - 1

  return [row, col]
}

let cellIndexesToId = (row, col) => {

  console.log(row, col)

  rowLetter = String.fromCharCode(65 + Number(row))
  col = Number(col) + 1

  console.log(rowLetter, col)

  return rowLetter+col
}

let getCellAt = (row, col) => {
  return data.find((cell) => cell.row == row && cell.col == col)
}


function parseFormula(content) {



  let tokens = content.replace('(', ' ( ').replace(')', ' ) ').split(' ')

  tokens.shift()

  if (tokens[0] = '(') {
    tokens.shift()

    exp = []
    while (tokens[0] != ')') {
      exp.push(tokens.shift())
    }
  }


  let op = ops[exp.shift()]

  let vals = exp.map((val) => getCellAt(...cellIdToIndexes(val)).content)

  





  return [vals.reduce(op), exp]
}

// parseFormula('=(+ 1 1)')



// function execute() {
//   console.log(parseFormula('=(+ A1 B1)'))
// }





// need to change (add new, removed deleted cell ids) dependencies if formula is changed

// need to add a 