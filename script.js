let data = []

let ops = {
  '+': (op1, op2) => Number(op1) + Number(op2),
  '-': (op1, op2) => Number(op1) - Number(op2),
  '/': (op1, op2) => Number(op1) / Number(op2),
  '*': (op1, op2) => Number(op1) * Number(op2)
}






class Cell {

  constructor(row, col, content = '', dependencyOf = [], isFormula = false, isSelected = false) {
    this.row = row
    this.col = col
    this.content = content
    this.dependencyOf = dependencyOf
    this.isFormula = isFormula
    this.isSelected = isSelected
  }

  render() {
    let cell = document.querySelectorAll(`[data-row-num="${this.row}"][data-col-num="${this.col}"]`)[0]

    let p = cell.childNodes[0]
    let input = cell.childNodes[1]

    if (this.isSelected) {
      p.style.display = 'none'
      input.style.display = 'block'
      cell.style.borderColor = 'blue'

      input.select()

    } else {
      p.style.display = 'block'
      input.style.display = 'none'
      cell.style.borderColor = '#dfdfdf';
    }


    p.innerHTML = this.content
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



  let cell = getCellAt(row, col)

  let isFormula = (content[0] == '=')





  if (isFormula) {



    let [result, dependencies] = parseFormula(content)

    if (dependencies.includes(Cell.indexesToId(row, col))) {
      console.log("can't refer to self")
      return
    }



    if (cell.formula) {
      let [_, oldDependencies] = parseFormula(cell.formula)

      let droppedDependencyIds = oldDependencies.filter((dependency, idx) => {
        if (dependency != dependencies[idx]) {
          return dependency
        }
      })

      droppedDependencyIds.forEach((id) => {
        let updateCell = data.find((cell) => cell.id == id)
        updateCell.dependencyOf = updateCell.dependencyOf.filter(cellId => cellId != Cell.indexesToId(row, col))
      })
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



  let dependencies = cell.getDependentCells()

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


    // console.log('evaluating', x)

    // if it's a cellId
    if (typeof (x) == 'string' && x.match(/[A-Z][0-9]/)) {



      dependencies.push(x)




      return getCellAt(...Cell.idToIndexes(x)).content

    }
    // it's a number
    else if (!isNaN(x)) {



      return x
    }

    else if (typeof (x) == 'string' && ops[x]) {



      return ops[x]
    }

    // it's a procedure

    else {

      let proc = eval(x[0])
      let args = x.slice(1).map((arg) => eval(arg))

      return args.reduce(proc)
    }
  }




  return [eval(ast), dependencies]
}






function onCellClick() {

  // console.log(event.target, event.target.nodeName)
  let row
  let col

  if (event.target.nodeName == 'P') {
    console.log()
    row = event.target.parentNode.getAttribute('data-row-num')
    col = event.target.parentNode.getAttribute('data-col-num')
  } else {
    row = event.target.getAttribute('data-row-num')
    col = event.target.getAttribute('data-col-num')
  }




  let cell = getCellAt(row, col)


  if (cell) {

    data.filter((cell) => cell.isSelected)
      .map((cell) => {
        cell.isSelected = false
        cell.render()
      })



    cell.isSelected = true



    cell.render()
  }


}

function onCellKeyPress() {
  if (event.key == 'Enter') {
    let row = event.target.parentNode.getAttribute('data-row-num')
    let col = event.target.parentNode.getAttribute('data-col-num')

    let cell = getCellAt(row, col)


    if (cell) {
      cell.isSelected = false
      cell.render()
    }

  }
}




function createCells() {
  let table = document.createElement('table')

  for (let ri = 0; ri < 100; ri++) {

    let tr = document.createElement('tr')

    for (let ci = 0; ci < 100; ci++) {
      let td = document.createElement('td')
      td.setAttribute('data-row-num', ri)
      td.setAttribute('data-col-num', ci)
      td.setAttribute('onclick', 'onCellClick()')
      td.setAttribute('onkeypress', 'onCellKeyPress()')
      let p = document.createElement('p')
      let input = document.createElement('input')
      input.type = 'text'
      input.setAttribute('onchange', 'onInputChange()')



      td.appendChild(p)
      td.appendChild(input)

      tr.appendChild(td)
      data.push(new Cell(ri, ci))
    }

    table.appendChild(tr)
  }

  document.getElementById('root').appendChild(table)
}

createCells()
