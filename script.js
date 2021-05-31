let data = []

function onInputChange() {

  let row = event.target.parentNode.getAttribute('data-row-num')
  let col = event.target.parentNode.getAttribute('data-col-num')
  let content = event.target.value

  let cellObject = {}

  cellObject.row = row
  cellObject.col = col
  cellObject.content = content

  
  //if exists, update

  if (data.find((cell) => cell.row == row && cell.col == col)) {
    
    data.find((cell) => cell.row == row && cell.col == col).content = content

    
    
    
  } else {
    data.push(cellObject)


  }


  //else create
  

  
}





/*

{
  row: 
  col: 
  data:
}

*/