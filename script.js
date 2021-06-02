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


  get id() {
    let rowLetter = String.fromCharCode(65 + Number(this.row))
    let col = Number(this.col) + 1
    return rowLetter + col
  }

  static indexesToId(row, col) {
    let rowLetter = String.fromCharCode(65 + Number(row))
    let colNum = Number(col) + 1
    return rowLetter + colNum
  }

  getDependentCells() {
    // console.log('dependent', this.dependencyOf)


    let dependentCells = []

    let helper = (cell) => {

      cell.dependencyOf.forEach((cellId) => {


        dependentCells.push(cellId)

        //get cell from ID

        let cell = data.find((cell) => cell.id == cellId)



        helper(cell)

      })

    }

    helper(this)




    return dependentCells
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

    console.log(result, dependencies)
    cell.formula = content
    cell.content = result

    console.log('1-', cell.content)
    cell.render()

    //need to fix this to remove unused dependencies
    for (dependency of dependencies) {
      let [dependencyRow, dependencyCol] = cellIdToIndexes(dependency)

      let dependencyCell = getCellAt(dependencyRow, dependencyCol)

      let id = Cell.indexesToId(row, col)

      if(dependencyCell.dependencyOf.indexOf(id) == -1) {
        dependencyCell.dependencyOf.push(id)
      }

      
    }


  } else {
    cell.content = content
    cell.render()
  }




  //replace or push cell
  let existingCell = data.find((cell) => cell.row == row && cell.col == col)

  if (existingCell) {


    if (isFormula) {

      

      //find id of dropped cells

      let [_, newDependencies] = parseFormula(cell.formula)
      let [__, prevDependencies] = parseFormula(existingCell.formula)


      let droppedDependencyIds = prevDependencies.filter((dependency, idx) => {

        if (dependency != newDependencies[idx]) {
          return dependency
        } 
      })

      
      

      //remove id from dropped cells

      droppedDependencyIds.forEach((id) => {
        let updateCell = data.find((cell) => cell.id == id)

       

        updateCell.dependencyOf = updateCell.dependencyOf.filter(cellId => cellId != Cell.indexesToId(row, col))
      })

      





      existingCell.formula = cell.formula
      existingCell.content = cell.content
      existingCell.render()
      
    } else {
      existingCell.content = cell.content
      
    }

  } else {
    data.push(cell)
  }

  console.log(data)







  



  //it's either the cell object we created or an existing cell. I just re-find the cell to get whichever one it was
  let thisCell = data.find((cell) => cell.row == row && cell.col == col)



  let dependencies = thisCell.getDependentCells()

  dependencies.forEach((dependentCellId) => {
    dependentCell = data.find((cell) => cell.id == dependentCellId)
    dependentCell.content = parseFormula(dependentCell.formula)[0]
    dependentCell.render()
  })





}

let renderDataInCell = (row, col, content) => {
  let cell = document.querySelectorAll(`[data-row-num="${row}"][data-col-num="${col}"]`)[0]


  cell.childNodes[1].innerHTML = content
}


let cellIdToIndexes = (id) => {

  rowLetter = id[0]
  row = rowLetter.charCodeAt(0) - 65

  col = id[1] - 1

  return [row, col]
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