//imports
const path = require('path');
const url = require('url');
let sqlite3 = require("sqlite3");
let knex = require("knex")({
    client: "sqlite3",
    connection:{
        filename:"./pastadb.db"
    },
    useNullAsDefault: true
});

//deconstruct imports
const { app, BrowserWindow, Menu, ipcMain } = require('electron');

//variables for windows
let mainWindow;
let addWindow;

//function to create main window
function createWindow() {
  mainWindow = new BrowserWindow( {
    width: 1200,
    height: 600,
    icon: __dirname + '/Icon/icon.ico',
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadFile('mainwindow.html')
  
  mainWindow.on('closed', function() {
    app.quit();
  });

  // insert to DB
  ipcMain.on('item:insert', function(e, item,category,type,year,winery,yearpurchased,rating) {
    console.log(item);//test data got here to main
    const data = [{Name:item, Category:category,Type:type, Year:year, Winery:winery, Year_Purchased:yearpurchased, Rating:rating }]
    knex('wine').insert(data).then(() => console.log("data inserted"))
    .catch((err) => { console.log(err); throw err })
    // .finally(() => {
    //     knex.destroy();
    // });
    addWindow.close();
    clearWindow()
    readDB();
  });


  let menu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(menu)

 

}//end createWindow

//function to create window for Adding
function createAddWindow() {
  addWindow = new BrowserWindow({
    width: 600,
    height: 600,
    title: 'Add Vintage',
    icon: __dirname + '/Icon/icon.ico',
    webPreferences: {
      nodeIntegration: true
    }
  });

  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addwindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  addWindow.on('close', function() {
    addWindow = null;
  });

}//end create addWindow

//function to create window for Updating
function createUpdateWindow() {
  updateWindow = new BrowserWindow({
    width: 600,
    height: 600,
    title: 'Update Vintage',
    icon: __dirname + '/Icon/icon.ico',
    webPreferences: {
      nodeIntegration: true
    }
  });

  updateWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'update.html'),
    protocol: 'file:',
    slashes: true
  }));

  updateWindow.on('close', function() {
    updatedWindow = null;
  });

}//end update window

function createDeleteWindow() {
  deleteWindow = new BrowserWindow( {
    width: 300,
    height: 300,
    icon: __dirname + '/Icon/icon.ico',
    webPreferences: {
      nodeIntegration: true
    }
  })

  deleteWindow.loadFile('delete.html')
  
  deleteWindow.on('closed', function() {
    deleteWindow = null;
  });

// delete wine
  ipcMain.on('item:delete', function(e, id) {
    console.log(id);//test data got here to main
    knex('wine')
    .where('Wine_Id',id)
    .del().then(() => console.log("data deleted"))
    .catch((err) => { console.log(err); throw err })

    deleteWindow.close();
    clearWindow();
    readDB();
       
    
  });
  
}


function clearWindow()
{
    mainWindow.webContents.send('item:clear');
}//end function clearWindow

// read data
function readDB()
{
  //cach 1:
  // let result = knex.select("Name","Category","Type","Year","Winery","Year_Purchased","Rating").from("pastatable")
  // result.then(function(rows){
  //     mainWindow.webContents.send('item:add',rows);
  //   }).catch((err) => { console.log( err); throw err })
  // // .finally(() => {
  // //     knex.destroy();
  // // });
  // cach 2:
  knex.from('wine').select("*")
  .then((rows) => {
      mainWindow.webContents.send('item:add',rows);
  }).catch((err) => { console.log( err); throw err })
  // .finally(() => {
  //     knex.destroy();
  // });

  
}//end function readDB
// update table
ipcMain.on('item:update', function(e, item,category,category_reds,category_whites,category_dessert,year,winery,yearpurchased,rating) {
  knex('wine')
  .where({Name:item})
  .update({'Name':item, 'Category':category, 'Year':year, 'Winery':winery, 'Year_Purchased':yearpurchased, 'Rating':rating}).then(() => console.log("data updated"))
  .catch((err) => { console.log( err); throw err })
    // .finally(() => {
    //     knex.destroy();
    // });
  clearWindow()
  readDB()
  updateWindow.close();
});



//template for menu
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Vintage',
        click() {createAddWindow()}
      },
      {
        label: 'Clear',
        click(){clearWindow()}
      },
      {
        label: 'List',
        click(){readDB()}
      },
      {
        label: 'Update',
        click(){createUpdateWindow()}
      },
      {
        label: 'Delete',
        click(){createDeleteWindow()}
      },
      {
        label: 'Quit',
        click(){app.quit()}
      }
      
    ]
  }
];

app.on('ready', createWindow)

