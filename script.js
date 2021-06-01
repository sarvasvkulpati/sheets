let data = []

let ops = {
  '+': (op1, op2) => Number(op1) + Number(op2)

}


class Cell {

  constructor(row, col, content = '', dependencyOf = [], isFormula = false) {
    this.row = row
    this.col = col
    this.content = content
    this.dependencyOf = dependencyOf
    this.isFormula = isFormula
  }

  render() {
    let cell = document.querySelectorAll(`[data-row-num="${this.row}"][data-col-num="${this.col}"]`)[0]


    cell.childNodes[1].innerHTML = this.content
  }
}



function onInputChange() {

  let row = event.target.parentNode.getAttribute('data-row-num')
  let col = event.target.parentNode.getAttribute('data-col-num')
  let content = event.target.value




  //create a cell
  let isFormula = (content[0] == '=')
  let cell = new Cell(row, col, isFormula = isFormula)


  if (isFormula) {

    let [result, dependencies] = parseFormula(content)
    cell.formula = content
    cell.content = result
    cell.render()

    //need to fix this to remove unused dependencies
    for (dependency of dependencies) {
      let [dependencyRow, dependencyCol] = cellIdToIndexes(dependency)
      getCellAt(dependencyRow, dependencyCol).dependencyOf.push(cellIndexesToId(row, col))
    }


  } else {
    cell.content = content
    cell.render()
  }




  //replace or push cell
  let existingCell = data.find((cell) => cell.row == row && cell.col == col)

  if (existingCell) {

    if (cell.isFormula){
      existingCell.formula = cell.content
      existingCell.content = cell.result
    } else {
      existingCell.content = cell.content
    }

  } else {
    data.push(cell)
  }

  console.log(data)




  //need to create a function that recursively gets all dependencies in a list and then updates them


  let thisCell = data.find((cell) => cell.row == row && cell.col == col)

  if (thisCell ?.dependencyOf) {
    thisCell.dependencyOf.forEach((cellId) => {


      let cellToUpdate = getCellAt(...cellIdToIndexes(cellId))

      let formula = cellToUpdate.formula

      cellToUpdate.content = parseFormula(formula)[0]

      renderDataInCell(...cellIdToIndexes(cellId), parseFormula(formula)[0])

    })
  }

}

let renderDataInCell = (row, col, content)=> {
  let cell = document.querySelectorAll(`[data-row-num="${row}"][data-col-num="${col}"]`)[0]


    cell.childNodes[1].innerHTML = content
}


let cellIdToIndexes = (id) => {

  rowLetter = id[0]
  row = rowLetter.charCodeAt(0) - 65

  col = id[1] - 1

  return [row, col]
}

let cellIndexesToId = (row, col) => {



  rowLetter = String.fromCharCode(65 + Number(row))
  col = Number(col) + 1



  return rowLetter + col
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






// need to change (add new, removed deleted cell ids) dependencies if formula is changed

// need to prevent cells referring to themselves (put the a in the acyclic graphs)