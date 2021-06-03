let data = []

let ops = {
  '+': (op1, op2) => Number(op1) + Number(op2),
  '-': (op1, op2) => Number(op1) - Number(op2),
  '/': (op1, op2) => Number(op1) / Number(op2),
  '*': (op1, op2) => Number(op1) * Number(op2)
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

    console.log(cell, cell.childNodes)

    cell.childNodes[0].innerHTML = this.content
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

  static idToIndexes(id) {

    let rowLetter = id[0]
    let row = rowLetter.charCodeAt(0) - 65

    let col = id[1] - 1

    return [row, col]
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

    console.log(dependencies)

    if (dependencies.includes(Cell.indexesToId(row, col))) {
      console.log("can't refer to self")
      return
    }


    cell.formula = content
    cell.content = result


    cell.render()

    //need to fix this to remove unused dependencies
    for (dependency of dependencies) {
      let [dependencyRow, dependencyCol] = cellIdToIndexes(dependency)

      let dependencyCell = getCellAt(dependencyRow, dependencyCol)

      let id = Cell.indexesToId(row, col)

      if (dependencyCell.dependencyOf.indexOf(id) == -1) {
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
 


  let tokens = content.replaceAll('(', ' ( ').replaceAll(')', ' ) ').split(/  */)

  tokens.shift() //get rid of the =

  



  let tokens_to_ast = (tokens) => {

    let token = tokens.shift()

    if (token == '(') {
      let ast = []

      while (tokens[0] != ')') {
        ast.push(tokens_to_ast(tokens))
      }
      tokens.shift() //get rid of )
      return ast

    } else if (token == ')') {
      throw "there shouldn't be a ) here"
    } else {
      return token
    }
  }




  let ast = tokens_to_ast(tokens)
  
  
  let dependencies = []

  let eval = (x) => {
    console.log(x, Number(x))

    // console.log('evaluating', x)

    // if it's a cellId
    if (typeof(x) == 'string' && x.match(/[A-Z][0-9]/)) {
      
       console.log('cellId', x)

      dependencies.push(x)
     

      

      return getCellAt(...Cell.idToIndexes(x)).content

    }
    // it's a number
    else if (!isNaN(x)) {

      console.log('number', x)
      
      return x
    } 
     
    else if (typeof(x) == 'string' && ops[x]) {

       console.log('op', x)

      return ops[x]
    }

    // it's a procedure

    else {
      console.log('proc', x)
      let proc = eval(x[0])
      let args = x.slice(1).map((arg) => eval(arg))

      return args.reduce(proc)
    }
  }


  

  return [eval(ast), dependencies]
}


parseFormula('=(+ 0 1)')


function createCells() {
  let table = document.createElement('table')

  for(let ri = 0; ri < 100; ri++) {

    let tr = document.createElement('tr')

    for (let ci = 0; ci < 100; ci++ ) {
      let td = document.createElement('td')
      td.setAttribute('data-row-num', ri)
      td.setAttribute('data-col-num', ci)
      let p = document.createElement('p')
      let input = document.createElement('input')
      input.type = 'text'
      input.setAttribute('onchange', 'onInputChange()')

      
  
      td.appendChild(p)
      td.appendChild(input)
    
      tr.appendChild(td)
    }

    table.appendChild(tr)
  }

  document.getElementById('root').appendChild(table)
}

createCells()
