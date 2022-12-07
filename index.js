const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv').config();

const app = express();
const port = 3000;

const pool = new Pool({
    user: process.env.PSQL_USER,
    host: process.env.PSQL_HOST,
    database: process.env.PSQL_DATABASE,
    password: process.env.PSQL_PASSWORD,
    port: process.env.PSQL_PORT,
    ssl: {rejectUnauthorized: false}
});

process.on('SIGINT', function() {
    pool.end();
    console.log('Application successfully shutdown');
    process.exit(0);
});

app.use(express.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));

app.set("view engine", "ejs");

/**
 * @swagger
 * /manager:
 *   get:
 *     summary: Retrieves the manager/oauth webpage
 *     description: Retrieves the webpage for displaying the authentication page to the manager.
*/
app.get('/', (req, res) => {
    res.redirect('/manager/oauth');
});

/**
 * @swagger
 * /manager/oauth:
 *   get:
 *     summary: Retrieves the manager/oauth webpage
 *     description: Retrieves the webpage for displaying the authentication page to the manager.
*/
app.get('/manager/oauth', (req, res) => {
    res.render('manager/oauth');
})

/**
 * @swagger
 * /manager/customerorder:
 *   get:
 *     summary: Retrieves the manager/customerorder webpage
 *     description: Retrieves the webpage for displaying the customer order page to the manager.
*/
app.get('/manager/customerorder', (req, res) => {
    customerorders = []
    customerorderitemids = []
    customerorderitems = []
    pool
        .query('SELECT * FROM customerorder ORDER BY orderid DESC;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                customerorders.push(query_res.rows[i]);
            }
            pool
                .query('SELECT * FROM customerorderitemids ORDER BY orderid DESC;')
                .then(query_res => {
                    let j = 0;
                    customerorderitemids1 = []
                    for (let i = 0; i < query_res.rowCount; i++) {
                        if (customerorders[j].orderid == query_res.rows[i].orderid) {
                            customerorderitemids1.push(query_res.rows[i]);
                        } else {
                            customerorderitemids.push(customerorderitemids1);
                            customerorderitemids1 = []
                            customerorderitemids1.push(query_res.rows[i]);
                            j = j+1;
                        }
                    }
                    customerorderitemids.push(customerorderitemids1);
                    pool
                        .query('SELECT * FROM item ORDER BY itemid ASC;')
                        .then(query_res => {
                            for (let i = 0; i < customerorders.length; i++) {
                                customerorderitems1 = []
                                for (let j = 0; j < customerorderitemids[i].length; j++) {
                                    customerorderitems1.push(query_res.rows[customerorderitemids[i][j].itemid]);
                                }
                                customerorderitems.push(customerorderitems1);
                            }
                            const data = {customerorders: customerorders, customerorderitems: customerorderitems};
                            res.render('manager/customerorder', data);
                        });
                });
        });
});

/**
 * @swagger
 * /manager/customerordersearch:
 *   get:
 *     summary: Retrieves the manager/customerordersearch webpage
 *     description: Retrieves the webpage for displaying the customerordersearch page to the manager.
*/
app.get('/manager/customerordersearch', (req, res) => {
    res.render('manager/customerordersearch');
})

/**
 * @swagger
 * /manager/customerordersearch:
 *   post:
 *     summary: Searches for customer orders using the manager/customerordersearch webpage
 *     description: Allows the manager to search for customer orders using the customerordersearch GUI.
*/
app.post('/manager/customerordersearch', (req, res) => {
    if (req.body.customerorderattribute == "ordertimestamp") {
        customerorders = []
        customerorderitemids = []
        customerorderitems = []
        pool
            .query("SELECT * FROM customerorder WHERE "+req.body.customerorderattribute+" = '"+req.body.customerordersearch+"' ORDER BY orderid DESC;")
            .then(query_res => {
                for (let i = 0; i < query_res.rowCount; i++) {
                    customerorders.push(query_res.rows[i]);
                }
                if (customerorders.length == 0) {
                    res.render('manager/customerorder');
                    return;
                }
                pool
                    .query('SELECT * FROM customerorderitemids WHERE orderid >= '+customerorders[customerorders.length-1].orderid+' AND orderid <= '+customerorders[0].orderid+' ORDER BY orderid DESC;')
                    .then(query_res => {
                        let j = 0;
                        customerorderitemids1 = []
                        for (let i = 0; i < query_res.rowCount; i++) {
                            if (customerorders[j].orderid == query_res.rows[i].orderid) {
                                customerorderitemids1.push(query_res.rows[i]);
                            } else {
                                customerorderitemids.push(customerorderitemids1);
                                customerorderitemids1 = []
                                customerorderitemids1.push(query_res.rows[i]);
                                j = j+1;
                            }
                        }
                        customerorderitemids.push(customerorderitemids1);
                        pool
                            .query('SELECT * FROM item ORDER BY itemid ASC;')
                            .then(query_res => {
                                for (let i = 0; i < customerorders.length; i++) {
                                    customerorderitems1 = []
                                    for (let j = 0; j < customerorderitemids[i].length; j++) {
                                        customerorderitems1.push(query_res.rows[customerorderitemids[i][j].itemid]);
                                    }
                                    customerorderitems.push(customerorderitems1);
                                }
                                const data = {customerorders: customerorders, customerorderitems: customerorderitems};
                                res.render('manager/customerorder', data);
                            });
                    });
            });
    } else {
        customerorders = []
        customerorderitemids = []
        customerorderitems = []
        pool
            .query('SELECT * FROM customerorder WHERE '+req.body.customerorderattribute+' = '+req.body.customerordersearch+' ORDER BY orderid DESC;')
            .then(query_res => {
                for (let i = 0; i < query_res.rowCount; i++) {
                    customerorders.push(query_res.rows[i]);
                }
                if (customerorders.length == 0) {
                    res.render('manager/customerorder');
                    return;
                }
                pool
                    .query('SELECT * FROM customerorderitemids WHERE orderid >= '+customerorders[customerorders.length-1].orderid+' AND orderid <= '+customerorders[0].orderid+' ORDER BY orderid DESC;')
                    .then(query_res => {
                        let j = 0;
                        customerorderitemids1 = []
                        for (let i = 0; i < query_res.rowCount; i++) {
                            if (customerorders[j].orderid == query_res.rows[i].orderid) {
                                customerorderitemids1.push(query_res.rows[i]);
                            } else {
                                customerorderitemids.push(customerorderitemids1);
                                customerorderitemids1 = []
                                customerorderitemids1.push(query_res.rows[i]);
                                j = j+1;
                            }
                        }
                        customerorderitemids.push(customerorderitemids1);
                        pool
                            .query('SELECT * FROM item ORDER BY itemid ASC;')
                            .then(query_res => {
                                for (let i = 0; i < customerorders.length; i++) {
                                    customerorderitems1 = []
                                    for (let j = 0; j < customerorderitemids[i].length; j++) {
                                        customerorderitems1.push(query_res.rows[customerorderitemids[i][j].itemid]);
                                    }
                                    customerorderitems.push(customerorderitems1);
                                }
                                const data = {customerorders: customerorders, customerorderitems: customerorderitems};
                                res.render('manager/customerorder', data);
                            });
                    });
            });
    }
})

/**
 * @swagger
 * /manager/employee:
 *   get:
 *     summary: Retrieves the manager/employee webpage
 *     description: Retrieves the webpage for displaying the employee page to the manager.
*/
app.get('/manager/employee', (req, res) => {
    employees = []
    pool
        .query("SELECT * FROM employee WHERE employeestatus != '';")
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                employees.push(query_res.rows[i]);
            }
            const data = {employees: employees};
            res.render('manager/employee', data);
        })
});

/**
 * @swagger
 * /manager/addemployee:
 *   get:
 *     summary: Retrieves the manager/addemployee webpage
 *     description: Retrieves the webpage for displaying the addemployee page to the manager.
*/
app.get('/manager/addemployee', (req, res) => {
    res.render('manager/addemployee');
});

/**
 * @swagger
 * /manager/removeemployee:
 *   get:
 *     summary: Retrieves the manager/removeemployee webpage
 *     description: Retrieves the webpage for displaying the removeemployee page to the manager.
*/
app.get('/manager/removeemployee', (req, res) => {
    res.render('manager/removeemployee');
})

/**
 * @swagger
 * /manager/updateemployee:
 *   get:
 *     summary: Retrieves the manager/updateemployee webpage
 *     description: Retrieves the webpage for displaying the updateemployee page to the manager.
*/
app.get('/manager/updateemployee', (req, res) => {
    res.render('manager/updateemployee');
})

/**
 * @swagger
 * /manager/employeesearch:
 *   get:
 *     summary: Retrieves the manager/employeesearch webpage
 *     description: Retrieves the webpage for displaying the employeesearch page to the manager.
*/
app.get('/manager/employeesearch', (req, res) => {
    res.render('manager/employeesearch');
})

/**
 * @swagger
 * /manager/addemployee:
 *   post:
 *     summary: Adds employee using the manager/addemployee webpage
 *     description: Allows the manager to add an employee into the employee GUI.
*/
app.post('/manager/addemployee', (req, res) => {
    pool
    .query('SELECT COUNT(employeeid) from employee;')
    .then(query_res => {
        employeeid = query_res.rows[0].count;
        pool.query("INSERT INTO employee(employeeid, employeename, employeestatus) VALUES("+employeeid+", '"+req.body.employeename+"', '"+req.body.employeestatus+"');")
    })
    res.redirect('/manager/employee');
})

/**
 * @swagger
 * /manager/removeemployee:
 *   post:
 *     summary: Removes employee using the manager/removeemployee webpage
 *     description: Allows the manager to remove an employee using the employee GUI.
*/
app.post('/manager/removeemployee', (req, res) => {
    pool.query("UPDATE employee SET employeestatus='' WHERE employeeid="+req.body.employeeid+";")
    res.redirect('/manager/employee');
})

/**
 * @swagger
 * /manager/updateemployee:
 *   post:
 *     summary: Updates employee using the manager/updateemployee webpage
 *     description: Allows the manager to update an employee's status using the employee GUI.
*/
app.post('/manager/updateemployee', (req, res) => {
    pool.query("UPDATE employee SET employeename='"+req.body.employeename+"', employeestatus='"+req.body.employeestatus+"' WHERE employeeid="+req.body.employeeid+";")
    res.redirect('/manager/employee');
})

/**
 * @swagger
 * /manager/employeesearch:
 *   post:
 *     summary: Searches employees using the manager/employeesearch webpage
 *     description: Allows the manager to search for employees using the employeesearch GUI.
*/
app.post('/manager/employeesearch', (req, res) => {
    if (req.body.employeeattribute == "employeeid") {
        employees = []
        pool
            .query("SELECT * FROM employee WHERE employeestatus != '' AND "+req.body.employeeattribute+" = "+req.body.employeesearch+";")
            .then(query_res => {
                for (let i = 0; i < query_res.rowCount; i++) {
                    employees.push(query_res.rows[i]);
                }
                const data = {employees: employees};
                res.render('manager/employee', data);
            })
    } else {
        employees = []
        pool
            .query("SELECT * FROM employee WHERE employeestatus != '' AND "+req.body.employeeattribute+" = '"+req.body.employeesearch+"';")
            .then(query_res => {
                for (let i = 0; i < query_res.rowCount; i++) {
                    employees.push(query_res.rows[i]);
                }
                const data = {employees: employees};
                res.render('manager/employee', data);
            })
    }
})

/**
 * @swagger
 * /manager/inventory:
 *   get:
 *     summary: Retrieves the manager/inventory webpage
 *     description: Retrieves the webpage for displaying the inventory page to the manager.
*/
app.get('/manager/inventory', (req, res) => {
    ingredients = []
    inventory = []
    pool
        .query('SELECT * FROM ingredient ORDER BY ingredientid ASC;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                ingredients.push(query_res.rows[i]);
            }
            pool
                .query('SELECT * FROM inventory ORDER BY ingredientid ASC;')
                .then(query_res => {
                    for (let i = 0; i < query_res.rowCount; i++) {
                        inventory.push(query_res.rows[i]);
                    }
                    const data = {ingredients: ingredients, inventory: inventory};
                    res.render('manager/inventory', data);
                });
        });
});

/**
 * @swagger
 * /manager/addingredient:
 *   get:
 *     summary: Retrieves the manager/addingredient webpage
 *     description: Retrieves the webpage for displaying the addingredient page to the manager.
*/
app.get('/manager/addingredient', (req, res) => {
    res.render('manager/addingredient');
});

/**
 * @swagger
 * /manager/removeingredient:
 *   get:
 *     summary: Retrieves the manager/removeingredient webpage
 *     description: Retrieves the webpage for displaying the removeingredient page to the manager.
*/
app.get('/manager/removeingredient', (req, res) => {
    res.render('manager/removeingredient');
})

/**
 * @swagger
 * /manager/updateingredient:
 *   get:
 *     summary: Retrieves the manager/updateingredient webpage
 *     description: Retrieves the webpage for displaying the updateingredient page to the manager.
*/
app.get('/manager/updateingredient', (req, res) => {
    res.render('manager/updateingredient');
})

/**
 * @swagger
 * /manager/inventorysearch:
 *   get:
 *     summary: Retrieves the manager/inventorysearch webpage
 *     description: Retrieves the webpage for displaying the inventorysearch page to the manager.
*/
app.get('/manager/inventorysearch', (req, res) => {
    res.render('manager/inventorysearch');
})

/**
 * @swagger
 * /manager/addingredient:
 *   post:
 *     summary: Adds ingredient using the manager/addingredient webpage
 *     description: Allows the manager to add an ingredient into the inventory.
*/
app.post('/manager/addingredient', (req, res) => {
    pool
    .query('SELECT COUNT(ingredientid) FROM ingredient')
    .then(query_res => {
        ingredientid = query_res.rows[0].count;
        laststocked = new Date().toISOString().slice(0, 19).replace('T', ' ');
        pool.query("INSERT INTO ingredient(ingredientid, ingredientname) VALUES("+ingredientid+", '"+req.body.ingredientname+"');")
        pool.query("INSERT INTO inventory(ingredientid, stock, laststocked, stockstatus, unit) VALUES("+ingredientid+", 0, '"+laststocked+"', 'Not Stocked', '"+req.body.ingredientunit+"');")
        updateid;
        pool
            .query("SELECT COUNT(updateid) FROM inventoryupdates;")
            .then(query_res => {
                updateid = query_res.rows[0].count;
                pool.query("INSERT INTO inventoryupdates(updateid, ingredientid, stock, stockdate) VALUES("+updateid+", "+ingredientid+", 0, "+laststocked+");")
            })
    })
    res.redirect('/manager/inventory');
})

/**
 * @swagger
 * /manager/removeingredient:
 *   post:
 *     summary: Remove ingredient using the manager/removeingredient webpage
 *     description: Allows the manager to remove an ingredient into the inventory.
*/
app.post('/manager/removeingredient', (req, res) => {
    pool.query("UPDATE inventory SET stockstatus='' WHERE ingredientid="+req.body.ingredientid+";")
    res.redirect('/manager/inventory');
})

/**
 * @swagger
 * /manager/updateingredient:
 *   post:
 *     summary: Updates ingredient using the manager/updateingredient webpage
 *     description: Allows the manager to update ingredients through inventory.
*/
app.post('/manager/updateingredient', (req, res) => {
    pool.query("UPDATE ingredient SET ingredientname='"+req.body.ingredientname+"' WHERE ingredientid="+req.body.ingredientid+";")
    pool
        .query('SELECT * FROM inventory WHERE ingredientid = '+req.body.ingredientid+';')
        .then(query_res => {
            if (query_res.rows[i].stock != req.body.stock) {
                updateid;
                pool
                    .query('SELECT COUNT(updateid) FROM inventoryupdates;')
                    .then(query_res => {
                        updateid = query_res.rows[0].count;
                        pool.query("INSERT INTO inventoryupdates(updateid, ingredientid, stock, stockdate) VALUES("+updateid+", "+req.body.ingredientid+", "+req.body.ingredientstock+", "+req.body.ingredientlaststocked+");")
                    })
            }
        })
    pool.query("UPDATE inventory SET stock="+req.body.ingredientstock+", laststocked= '"+req.body.ingredientlaststocked+"', stockstatus='"+req.body.ingredientstockstatus+"', unit='"+req.body.ingredientunit+"' WHERE ingredientid="+req.body.ingredientid+";")
    res.redirect('/manager/inventory');
})

/**
 * @swagger
 * /manager/inventorysearch:
 *   post:
 *     summary: Searches the manager/inventorysearch webpage
 *     description: Allows the manager to search through inventory.
*/
app.post('/manager/inventorysearch', (req, res) => {
    if (req.body.inventoryattribute == "ingredientname") {
        ingredients = []
        inventory = []
        pool
            .query("SELECT * FROM ingredient WHERE "+req.body.inventoryattribute+" = '"+req.body.inventorysearch+"' ORDER BY ingredientid ASC;")
            .then(query_res => {
                for (let i = 0; i < query_res.rowCount; i++) {
                    ingredients.push(query_res.rows[i]);
                }
                if (ingredients.length == 0) {
                    res.render('manager/inventory');
                    return;
                }
                pool
                    .query('SELECT * FROM inventory WHERE ingredientid >= '+ingredients[0].ingredientid+' AND ingredientid <= '+ingredients[ingredients.length-1].ingredientid+' ORDER BY ingredientid ASC;')
                    .then(query_res => {
                        for (let i = 0; i < query_res.rowCount; i++) {
                            inventory.push(query_res.rows[i]);
                        }
                        const data = {ingredients: ingredients, inventory: inventory};
                        res.render('manager/inventory', data);
                    });
            });
    } else if (req.body.inventoryattribute == "ingredientid" || req.body.inventoryattribute == "stock") {
        ingredients = []
        inventory = []
        pool
            .query('SELECT * FROM inventory WHERE '+req.body.inventoryattribute+' = '+req.body.inventorysearch+' ORDER BY ingredientid ASC;')
            .then(query_res => {
                for (let i = 0; i < query_res.rowCount; i++) {
                    inventory.push(query_res.rows[i]);
                }
                pool
                    .query('SELECT * FROM ingredient ORDER BY ingredientid ASC;')
                    .then(query_res => {
                        for (let i = 0; i < query_res.rowCount; i++) {
                            ingredients.push(query_res.rows[i]);
                        }
                        const data = {ingredients: ingredients, inventory: inventory};
                        res.render('manager/inventory', data);
                    });
            });
    } else {
        ingredients = []
        inventory = []
        pool
            .query("SELECT * FROM inventory WHERE "+req.body.inventoryattribute+" = '"+req.body.inventorysearch+"' ORDER BY ingredientid ASC;")
            .then(query_res => {
                for (let i = 0; i < query_res.rowCount; i++) {
                    inventory.push(query_res.rows[i]);
                }
                pool
                    .query('SELECT * FROM ingredient ORDER BY ingredientid ASC;')
                    .then(query_res => {
                        for (let i = 0; i < query_res.rowCount; i++) {
                            ingredients.push(query_res.rows[i]);
                        }
                        const data = {ingredients: ingredients, inventory: inventory};
                        res.render('manager/inventory', data);
                    });
            });
    }
})

/**
 * @swagger
 * /manager/menu:
 *   get:
 *     summary: Retrieves the manager/menu webpage
 *     description: Retrieves the webpage for displaying the menu page to the manager.
*/
app.get('/manager/menu', (req, res) => {
    items = []
    itemingredientids = []
    itemingredients = []
    pool
        .query('SELECT * FROM item ORDER BY itemid ASC;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                items.push(query_res.rows[i]);
            }
            pool
                .query('SELECT * FROM itemingredientids ORDER BY itemid ASC;')
                .then(query_res => {
                    let j = 0;
                    itemingredientids1 = []
                    for (let i = 0; i < query_res.rowCount; i++) {
                        if (items[j].itemid == query_res.rows[i].itemid) {
                            itemingredientids1.push(query_res.rows[i]);
                            if (i == query_res.rowCount-1) {
                                itemingredientids.push(itemingredientids1);
                            }
                        } else {
                            itemingredientids.push(itemingredientids1);
                            itemingredientids1 = []
                            itemingredientids1.push(query_res.rows[i]);
                            j = j+1;
                        }
                    }
                    pool
                        .query('SELECT * FROM ingredient ORDER BY ingredientid ASC;')
                        .then(query_res => {
                            for (let i = 0; i < itemingredientids.length; i++) {
                                itemingredients1 = []
                                for (let j = 0; j < itemingredientids[i].length; j++) {
                                    itemingredients1.push(query_res.rows[itemingredientids[i][j].ingredientid]);
                                }
                                itemingredients.push(itemingredients1);
                            }
                            const data = {items: items, itemingredients: itemingredients};
                            res.render('manager/menu', data);
                        });
                });
        });
});

/**
 * @swagger
 * /manager/additem:
 *   get:
 *     summary: Retrieves the manager/additem webpage
 *     description: Retrieves the webpage for displaying the additem page to the manager.
*/
app.get('/manager/additem', (req, res) => {
    res.render('manager/additem');
});

/**
 * @swagger
 * /manager/removeitem:
 *   get:
 *     summary: Retrieves the manager/removeitem webpage
 *     description: Retrieves the webpage for displaying the removeitem page to the manager.
*/
app.get('/manager/removeitem', (req, res) => {
    res.render('manager/removeitem');
})

/**
 * @swagger
 * /manager/updateitem:
 *   get:
 *     summary: Retrieves the manager/updateitem webpage
 *     description: Retrieves the webpage for displaying the updateitem page to the manager.
*/
app.get('/manager/updateitem', (req, res) => {
    res.render('manager/updateitem');
})

/**
 * @swagger
 * /manager/menusearch:
 *   get:
 *     summary: Retrieves the manager/menusearch webpage
 *     description: Retrieves the webpage for displaying the menusearch page to the manager.
*/
app.get('/manager/menusearch', (req, res) => {
    res.render('manager/menusearch');
})

/**
 * @swagger
 * /manager/additem:
 *   post:
 *     summary: Adds item using the manager/additem webpage
 *     description: Allows manager to add item using additem webpage.
*/
app.post('/manager/additem', (req, res) => {
    ingredientids = req.body.ingredientids.split(',');
    pool
    .query('SELECT COUNT(itemid) FROM item;')
    .then(query_res => {
        itemid = query_res.rows[0].count;
        pool.query("INSERT INTO item(itemid, itemname, price, onmenu) VALUES("+itemid+", '"+req.body.itemname+"', "+req.body.itemprice+", 'Yes');")
        for (let i = 0; i < ingredientids.length; i++) {
            pool.query('INSERT INTO itemingredientids(itemid, ingredientid) VALUES('+itemid+', '+ingredientids[i]+');')
        }
    })
    res.redirect('/manager/menu');
})

/**
 * @swagger
 * /manager/removeitem:
 *   post:
 *     summary: Removes item using the manager/removeitem webpage
 *     description: Allows manager to remove item using removeitem webpage.
*/
app.post('/manager/removeitem', (req, res) => {
    pool.query("UPDATE item SET onmenu='No' WHERE itemid="+req.body.itemid+';');
    res.redirect('/manager/menu');
})

/**
 * @swagger
 * /manager/updateitem:
 *   post:
 *     summary: Updates items using the manager/updateitem webpage
 *     description: Allows manager to update item using updateitem webpage.
*/
app.post('/manager/updateitem', (req, res) => {
    pool.query("UPDATE item SET itemname='"+req.body.itemname+"', price="+req.body.itemprice+", onmenu='"+req.body.onmenu+"' WHERE itemid="+req.body.itemid+";")
    res.redirect('/manager/menu');
})

/**
 * @swagger
 * /manager/menusearch:
 *   post:
 *     summary: Searches through the menu using the manager/menusearch webpage
 *     description: Allows the manager to search through the menu using the menusearch GUI.
*/
app.post('/manager/menusearch', (req, res) => {
    if (req.body.menuattribute == "itemid" || req.body.menuattribute == "price") {
        items = []
        itemingredientids = []
        itemingredients = []
        pool
            .query('SELECT * FROM item WHERE '+req.body.menuattribute+' = '+req.body.menusearch+' ORDER BY itemid ASC;')
            .then(query_res => {
                for (let i = 0; i < query_res.rowCount; i++) {
                    items.push(query_res.rows[i]);
                }
                if (items.length == 0) {
                    res.render('manager/menu');
                    return;
                }
                console.log(items);
                pool
                    .query('SELECT * FROM itemingredientids WHERE itemid >= '+items[0].itemid+' AND itemid <= '+items[items.length-1].itemid+' ORDER BY itemid ASC;')
                    .then(query_res => {
                        let j = 0;
                        itemingredientids1 = []
                        for (let i = 0; i < query_res.rowCount; i++) {
                            if (items[j].itemid == query_res.rows[i].itemid) {
                                itemingredientids1.push(query_res.rows[i]);
                                if (i == query_res.rowCount-1) {
                                    itemingredientids.push(itemingredientids1);
                                }
                            } else {
                                itemingredientids.push(itemingredientids1);
                                itemingredientids1 = []
                                itemingredientids1.push(query_res.rows[i]);
                                j = j+1;
                            }
                        }
                        pool
                            .query('SELECT * FROM ingredient ORDER BY ingredientid ASC;')
                            .then(query_res => {
                                for (let i = 0; i < itemingredientids.length; i++) {
                                    itemingredients1 = []
                                    for (let j = 0; j < itemingredientids[i].length; j++) {
                                        itemingredients1.push(query_res.rows[itemingredientids[i][j].ingredientid]);
                                    }
                                    itemingredients.push(itemingredients1);
                                }
                                const data = {items: items, itemingredients: itemingredients};
                                res.render('manager/menu', data);
                            });
                    });
            });
    } else {
        items = []
        itemingredientids = []
        itemingredients = []
        pool
            .query("SELECT * FROM item WHERE "+req.body.menuattribute+" = '"+req.body.menusearch+"' ORDER BY itemid ASC;")
            .then(query_res => {
                for (let i = 0; i < query_res.rowCount; i++) {
                    items.push(query_res.rows[i]);
                }
                if (items.length == 0) {
                    res.render('manager/menu');
                    return;
                }
                console.log(items);
                pool
                    .query('SELECT * FROM itemingredientids WHERE itemid >= '+items[0].itemid+' AND itemid <= '+items[items.length-1].itemid+' ORDER BY itemid ASC;')
                    .then(query_res => {
                        let j = 0;
                        itemingredientids1 = []
                        for (let i = 0; i < query_res.rowCount; i++) {
                            if (items[j].itemid == query_res.rows[i].itemid) {
                                itemingredientids1.push(query_res.rows[i]);
                                if (i == query_res.rowCount-1) {
                                    itemingredientids.push(itemingredientids1);
                                }
                            } else {
                                itemingredientids.push(itemingredientids1);
                                itemingredientids1 = []
                                itemingredientids1.push(query_res.rows[i]);
                                j = j+1;
                            }
                        }
                        pool
                            .query('SELECT * FROM ingredient ORDER BY ingredientid ASC;')
                            .then(query_res => {
                                for (let i = 0; i < itemingredientids.length; i++) {
                                    itemingredients1 = []
                                    for (let j = 0; j < itemingredientids[i].length; j++) {
                                        itemingredients1.push(query_res.rows[itemingredientids[i][j].ingredientid]);
                                    }
                                    itemingredients.push(itemingredients1);
                                }
                                const data = {items: items, itemingredients: itemingredients};
                                res.render('manager/menu', data);
                            });
                    });
            });
    }
})

/**
 * @swagger
 * /manager/storeorder:
 *   get:
 *     summary: Retrieves the manager/storeorder webpage
 *     description: Retrieves the webpage for displaying the storeorder page to the manager.
*/
app.get('/manager/storeorder', (req, res) => {
    storeorders = []
    storeorderingredientids = []
    storeorderingredients = []
    storeorderingredientamounts = []
    storeorderingredientprices = []
    pool
        .query('SELECT * FROM storeorder ORDER BY orderid DESC;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                storeorders.push(query_res.rows[i]);
            }
            pool
                .query('SELECT * FROM storeorderingredientids ORDER BY orderid DESC;')
                .then(query_res => {
                    let j = 0;
                    storeorderingredientids = []
                    storeorderingredientids1 = []
                    for (let i = 0; i < query_res.rowCount; i++) {
                        if (storeorders[j].orderid == query_res.rows[i].orderid) {
                            storeorderingredientids1.push(query_res.rows[i]);
                            if (i == query_res.rowCount-1) {
                                storeorderingredientids.push(storeorderingredientids1);
                            }
                        } else {
                            storeorderingredientids.push(storeorderingredientids1);
                            storeorderingredientids1 = []
                            storeorderingredientids1.push(query_res.rows[i]);
                            j = j+1;
                        }
                    }
                    pool
                        .query('SELECT * FROM ingredient ORDER BY ingredientid ASC;')
                        .then(query_res => {
                            for (let i = 0; i < storeorderingredientids.length; i++) {
                                storeorderingredients1 = []
                                storeorderingredientamounts1 = []
                                storeorderingredientprices1 = []
                                for (let j = 0; j < storeorderingredientids[i].length; j++) {
                                    storeorderingredients1.push(query_res.rows[storeorderingredientids[i][j].ingredientid]);
                                    storeorderingredientamounts1.push(storeorderingredientids[i][j].amount);
                                    storeorderingredientprices1.push(storeorderingredientids[i][j].price);
                                }
                                storeorderingredients.push(storeorderingredients1);
                                storeorderingredientamounts.push(storeorderingredientamounts1);
                                storeorderingredientprices.push(storeorderingredientprices1);
                            }
                            const data = {storeorders: storeorders, storeorderingredients: storeorderingredients};
                            res.render('manager/storeorder', data);
                        });
                });
        });
});

/**
 * @swagger
 * /manager/addstoreorder:
 *   get:
 *     summary: Retrieves the manager/addstoreorder webpage
 *     description: Retrieves the webpage for displaying the addstoreorder page to the manager.
*/
app.get('/manager/addstoreorder', (req, res) => {
    res.render('manager/addstoreorder');
});

/**
 * @swagger
 * /manager/storeordersearch:
 *   get:
 *     summary: Retrieves the manager/storeordersearch webpage
 *     description: Retrieves the webpage for displaying the storeordersearch page to the manager
*/
app.get('/manager/storeordersearch', (req, res) => {
    res.render('manager/storeordersearch');
})

/**
 * @swagger
 * /manager/addstoreorder:
 *   post:
 *     summary: Adds a storeorder to the manager/storeorder webpage
 *     description: Allows a manager to add a storeorder using the storeorder webpage.
*/
app.post('/manager/addstoreorder', (req, res) => {
    amounts = req.body.amounts.split(',');
    ingredientids = req.body.ingredientids.split(',');
    prices = req.body.prices.split(',');
    pool
    .query('SELECT COUNT(orderid) FROM storeorder;')
    .then(query_res => {
        orderid = query_res.rows[0].count;
        pool.query("INSERT INTO storeorder(orderid, orderplaced, orderreveived, price, employeeid, amount, ingredientid) VALUES("+orderid+", '"+req.body.orderplaced+"', '"+req.body.orderreceived+"', "+req.body.price+", "+req.body.employeeid+", 0, 0);")
        for (let i = 0; i < ingredientids.length; i++) {
            pool.query('INSERT INTO storeorderingredientids(orderid, ingredientid, amount, price) VALUES('+orderid+', '+ingredientids[i]+', '+amounts[i]+', '+prices[i]+');')
            pool
                .query('SELECT * FROM inventory WHERE ingredientid='+ingredientids[i]+';')
                .then(query_res => {
                    stock = parseInt(query_res.rows[0].stock) + parseInt(amounts[i]);
                    pool.query("UPDATE inventory SET stock="+stock+", stockstatus='Stocked' WHERE ingredientid="+ingredientids[i]+";")
                    updateid;
                    stockdate = new Date().toISOString().slice(0, 19).replace('T', ' ');
                    pool
                        .query('SELECT COUNT(updateid) FROM inventoryupdates;')
                        .then(query_res => {
                            updateid = query_res.rows[0].count;
                            pool.query("INSERT INTO inventoryupdates(updateid, ingredientid, stock, stockdate) VALUES("+updateid+", "+ingredientids[i]+", "+stock+", "+stockdate+");")
                        })
                })
        }
    })
    res.redirect('/manager/storeorder');
})

/**
 * @swagger
 * /manager/storeordersearch:
 *   post:
 *     summary: Searches through the manager/storeorder webpage
 *     description: Allows the manager to search for a storeorder using the storeordersearch GUI.
*/
app.post('/manager/storeordersearch', (req, res) => {
    if (req.body.storeorderattribute == "orderplaced" || req.body.storeorderattribute == "orderreceived") {
        storeorders = []
        storeorderingredientids = []
        storeorderingredients = []
        storeorderingredientamounts = []
        storeorderingredientprices = []
        pool
            .query("SELECT * FROM storeorder WHERE "+req.body.storeorderattribute+" = '"+req.body.storeordersearch+"' ORDER BY orderid DESC;")
            .then(query_res => {
                for (let i = 0; i < query_res.rowCount; i++) {
                    storeorders.push(query_res.rows[i]);
                }
                if (storeorders.length == 0) {
                    res.render('manager/storeorder');
                    return;
                }
                pool
                    .query('SELECT * FROM storeorderingredientids WHERE orderid >= '+storeorders[storeorders.length-1].orderid+' AND orderid <= '+storeorders[0].orderid+' ORDER BY orderid DESC;')
                    .then(query_res => {
                        let j = 0;
                        storeorderingredientids = []
                        storeorderingredientids1 = []
                        for (let i = 0; i < query_res.rowCount; i++) {
                            if (storeorders[j].orderid == query_res.rows[i].orderid) {
                                storeorderingredientids1.push(query_res.rows[i]);
                                if (i == query_res.rowCount-1) {
                                    storeorderingredientids.push(storeorderingredientids1);
                                }
                            } else {
                                storeorderingredientids.push(storeorderingredientids1);
                                storeorderingredientids1 = []
                                storeorderingredientids1.push(query_res.rows[i]);
                                j = j+1;
                            }
                        }
                        pool
                            .query('SELECT * FROM ingredient ORDER BY ingredientid ASC;')
                            .then(query_res => {
                                for (let i = 0; i < storeorderingredientids.length; i++) {
                                    storeorderingredients1 = []
                                    storeorderingredientamounts1 = []
                                    storeorderingredientprices1 = []
                                    for (let j = 0; j < storeorderingredientids[i].length; j++) {
                                        storeorderingredients1.push(query_res.rows[storeorderingredientids[i][j].ingredientid]);
                                        storeorderingredientamounts1.push(storeorderingredientids[i][j].amount);
                                        storeorderingredientprices1.push(storeorderingredientids[i][j].price);
                                    }
                                    storeorderingredients.push(storeorderingredients1);
                                    storeorderingredientamounts.push(storeorderingredientamounts1);
                                    storeorderingredientprices.push(storeorderingredientprices1);
                                }
                                const data = {storeorders: storeorders, storeorderingredients: storeorderingredients};
                                res.render('manager/storeorder', data);
                            });
                    });
            });
    } else {
        storeorders = []
        storeorderingredientids = []
        storeorderingredients = []
        storeorderingredientamounts = []
        storeorderingredientprices = []
        pool
            .query('SELECT * FROM storeorder WHERE '+req.body.storeorderattribute+' = '+req.body.storeordersearch+' ORDER BY orderid DESC;')
            .then(query_res => {
                for (let i = 0; i < query_res.rowCount; i++) {
                    storeorders.push(query_res.rows[i]);
                }
                if (storeorders.length == 0) {
                    res.render('manager/storeorder');
                    return;
                }
                pool
                    .query('SELECT * FROM storeorderingredientids WHERE orderid >= '+storeorders[storeorders.length-1].orderid+' AND orderid <= '+storeorders[0].orderid+' ORDER BY orderid DESC;')
                    .then(query_res => {
                        let j = 0;
                        storeorderingredientids = []
                        storeorderingredientids1 = []
                        for (let i = 0; i < query_res.rowCount; i++) {
                            if (storeorders[j].orderid == query_res.rows[i].orderid) {
                                storeorderingredientids1.push(query_res.rows[i]);
                                if (i == query_res.rowCount-1) {
                                    storeorderingredientids.push(storeorderingredientids1);
                                }
                            } else {
                                storeorderingredientids.push(storeorderingredientids1);
                                storeorderingredientids1 = []
                                storeorderingredientids1.push(query_res.rows[i]);
                                j = j+1;
                            }
                        }
                        pool
                            .query('SELECT * FROM ingredient ORDER BY ingredientid ASC;')
                            .then(query_res => {
                                for (let i = 0; i < storeorderingredientids.length; i++) {
                                    storeorderingredients1 = []
                                    storeorderingredientamounts1 = []
                                    storeorderingredientprices1 = []
                                    for (let j = 0; j < storeorderingredientids[i].length; j++) {
                                        storeorderingredients1.push(query_res.rows[storeorderingredientids[i][j].ingredientid]);
                                        storeorderingredientamounts1.push(storeorderingredientids[i][j].amount);
                                        storeorderingredientprices1.push(storeorderingredientids[i][j].price);
                                    }
                                    storeorderingredients.push(storeorderingredients1);
                                    storeorderingredientamounts.push(storeorderingredientamounts1);
                                    storeorderingredientprices.push(storeorderingredientprices1);
                                }
                                const data = {storeorders: storeorders, storeorderingredients: storeorderingredients};
                                res.render('manager/storeorder', data);
                            });
                    });
            });
    }
})

/**
 * @swagger
 * /employee:
 *   get:
 *     summary: Retrieves the main employee webpage
 *     description: Retrieves the webpage for displaying the main employee GUI.
*/
app.get('/employee', (req, res) => {
    itemids = [];
    items = []
    pool
        .query('SELECT * FROM item ORDER BY itemid ASC;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                items.push(query_res.rows[i]);
            }
            const data = {items: items};
            res.render('employee', data);
        });
});

/**
 * @swagger
 * /employee:
 *   post:
 *     summary: Routes to the main employee webpage
 *     description: Routes to the webpage for displaying the main employee GUI.
*/
app.post('/employee', (req, res) => {
    if (req.body.completeorder == 0) {
        ordertimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
        price = 0;
        employeeid = 0;
        itemids2 = [];
        for (let i = 0; i < itemids.length; i++) {
            itemids2.push(itemids[i]);
        }
        pool
            .query('SELECT * FROM item ORDER BY itemid ASC;')
            .then(query_res => {
                for (let i = 0; i < itemids2.length; i++) {
                    price += parseFloat(query_res.rows[itemids2[i]].price);
                }
                pool
                .query('SELECT COUNT(orderid) FROM customerorder;')
                .then(query_res => {
                    orderid = parseInt(query_res.rows[0].count)+1;
                    pool.query("INSERT INTO customerorder(orderid, ordertimestamp, price, employeeid) VALUES("+orderid+", '"+ordertimestamp+"', "+price+", "+employeeid+");")
                    for (let i = 0; i < itemids2.length; i++) {
                        pool
                            .query('SELECT * FROM itemingredientids WHERE itemid='+itemids2[i]+";")
                            .then(query_res => {
                                ingredientids = []
                                for (let j = 0; j < query_res.rowCount; j++) {
                                    ingredientids.push(query_res.rows[j].ingredientid);
                                }
                                for (let j = 0; j < ingredientids.length; j++) {
                                    pool.query('INSERT INTO customerorderingredientids(orderid, itemid, ingredientid) VALUES('+orderid+", "+itemids2[i]+", "+ingredientids[j]+");")
                                    pool
                                        .query('SELECT * FROM inventory WHERE ingredientid='+ingredientids[j]+';')
                                        .then(query_res => {
                                            stock = parseInt(query_res.rows[0].stock) - 1;
                                            pool.query('UPDATE inventory SET stock='+stock+'WHERE ingredientid='+ingredientids[j]+";")
                                            updateid;
                                            pool
                                                .query('SELECT COUNT(updateid) FROM inventoryupdates;')
                                                .then(query_res => {
                                                    updateid = query_res.rows[0].count;
                                                    pool.query("INSERT INTO inventoryupdates(updateid, ingredientid, stock, stockdate) VALUES("+updateid+", "+ingredientids[j]+", "+stock+", "+ordertimestamp+");")
                                                })
                                        })
                                }
                            })
                        pool.query('INSERT INTO customerorderitemids(orderid, itemid) VALUES('+orderid+", "+itemids2[i]+");")
                    }
                })
            })
        itemids = [];
        res.render('employee');
        return;
    } else {
        itemids.push(parseInt(req.body.item));
        const data = {itemids: itemids};
        res.render('employee', data);
    }
})

/**
 * @swagger
 * /manager/salesreport:
 *   get:
 *     summary: Retrieve the manager/salesreport webpage
 *     description: Retrieves the webpage for displaying the sales report to the manager.
*/
app.get('/manager/salesreport', (req, res) => {
    items = []
    pool
        .query("SELECT * FROM item ORDER BY itemid ASC;")
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                items1 = [];
                items1.push(query_res.rows[i].itemid);
                items1.push(query_res.rows[i].itemname);
                items1.push(query_res.rows[i].price);
                items1.push(0);
                items.push(items1);
            }
            pool
                .query('SELECT * FROM customerorderitemids;')
                .then(query_res => {
                    for (let i = 0; i < query_res.rowCount; i++) {
                        items[query_res.rows[i].itemid][3]++;
                    }
                    for (let i = 0; i < items.length; i++) {
                        items[i].push(100*items[i][2]*items[i][3]/100);
                    }
                    const data = {items: items};
                    res.render('manager/salesreport', data);
                })
        })
})

/**
 * @swagger
 * /manager/salesreporttimewindow:
 *   get:
 *     summary: Retrieve the manager/salesreporttimewindow webpage
 *     description: Retrieves the webpage for displaying the sales report time window to the manager.
*/
app.get('/manager/salesreporttimewindow', (req, res) => {
    res.render('manager/salesreporttimewindow');
})

/**
 * @swagger
 * /manager/salesreporttimewindow:
 *   post:
 *     summary: Specify a time to view the sales report from the manager/salesreporttimewindow webpage
 *     description: Allows a manager to specify a time window for them to view the salesreport GUI.
*/
app.post('/manager/salesreporttimewindow', (req, res) => {
    items = []
    pool
        .query("SELECT * FROM item ORDER BY itemid ASC;")
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                items1 = [];
                items1.push(query_res.rows[i].itemid);
                items1.push(query_res.rows[i].itemname);
                items1.push(query_res.rows[i].price);
                items1.push(0);
                items.push(items1);
            }
            orderids = []
            pool
                .query("SELECT * FROM customerorder WHERE ordertimestamp >= '"+req.body.starttime+"' AND ordertimestamp <= '"+req.body.endtime+"';")
                .then(query_res => {
                    for (let i = 0; i < query_res.rowCount; i++) {
                        orderids.push(query_res.rows[i].orderid);
                    }
                    pool
                        .query('SELECT * FROM customerorderitemids WHERE orderid >= '+orderids[0]+' AND orderid <= '+orderids[orderids.length-1]+';')
                        .then(query_res => {
                        for (let i = 0; i < query_res.rowCount; i++) {
                            items[query_res.rows[i].itemid][3]++;
                        }
                        for (let i = 0; i < items.length; i++) {
                            items[i].push(100*items[i][2]*items[i][3]/100);
                        }
                        const data = {items: items};
                        res.render('manager/salesreport', data);
                    })
                })
        })
})

/**
 * @swagger
 * /manager/salestogether:
 *   get:
 *     summary: Retrieve the manager/salestogether webpage
 *     description: Retrieves the webpage for displaying the sales together report to the manager.
*/
app.get('/manager/salestogether', (req, res) => {
    items = []
    items1 = []
    pool
        .query('SELECT * FROM item ORDER BY itemid ASC;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                items1.push(query_res.rows[i]);
            }
            for (let i = 0; i < items1.length; i++) {
                for (let j = i+1; j < items1.length; j++) {
                    items2 = []
                    items2.push(i);
                    items2.push(items1[i].itemname);
                    items2.push(j);
                    items2.push(items1[j].itemname);
                    items2.push(0);
                    orderid = "";
                    items.push(items2);
                }
            }
            for (let i = 0; i < items.length; i++) {
                    pool
                        .query('SELECT * FROM customerorderitemids WHERE itemid = '+items[i][0]+' OR itemid = '+items[i][2]+';')
                        .then(query_res => {
                            for (let k = 0; k < query_res.rowCount-1; k++) {
                                if (query_res.rows[k].orderid == orderid) {
                                    continue;
                                }
                                if (query_res.rows[k].orderid == query_res.rows[k+1].orderid && query_res.rows[k].itemid != query_res.rows[k+1].itemid) {
                                    items[i][4]++;
                                    orderid = query_res.rows[k].orderid;
                                }
                            }
                            if (i == items.length-1) {
                                const data = {items: items};
                                res.render('manager/salestogether', data);
                            }
                        })
            }
        })
})

/**
 * @swagger
 * /manager/salestogethertimewindow:
 *   get:
 *     summary: Retrieve the manager/restockreport webpage
 *     description: Retrieves the webpage for displaying the restock report to the manager.
*/
app.get('/manager/salestogethertimewindow', (req, res) => {
    res.render('manager/salestogethertimewindow');
})

/**
 * @swagger
 * /manager/salestogethertimewindow:
 *   post:
 *     summary: Specify a time to view the sales together from the manager/salestogethertimewindow webpage
 *     description: Allows a manager to specify a time window for them to view the salestogether GUI.
*/
app.post('/manager/salestogethertimewindow', (req, res) => {
    items = []
    items1 = []
    pool
        .query('SELECT * FROM item ORDER BY itemid ASC;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                items1.push(query_res.rows[i]);
            }
            for (let i = 0; i < items1.length; i++) {
                for (let j = i+1; j < items1.length; j++) {
                    items2 = []
                    items2.push(i);
                    items2.push(items1[i].itemname);
                    items2.push(j);
                    items2.push(items1[j].itemname);
                    items2.push(0);
                    orderid = "";
                    items.push(items2);
                }
            }
            orderids = []
            pool
                .query("SELECT * FROM customerorder WHERE ordertimestamp >= '"+req.body.starttime+"' AND ordertimestamp <= '"+req.body.endtime+"';")
                .then(query_res => {
                    for (let i = 0; i < query_res.rowCount; i++) {
                        orderids.push(query_res.rows[i].orderid);
                    }
                    for (let i = 0; i < items.length; i++) {
                        pool
                            .query('SELECT * FROM customerorderitemids WHERE (itemid = '+items[i][0]+' OR itemid = '+items[i][2]+') AND (orderid >= '+orderids[0]+' AND orderid <= '+orderids[orderids.length-1]+');')
                            .then(query_res => {
                                for (let k = 0; k < query_res.rowCount-1; k++) {
                                    if (query_res.rows[k].orderid == orderid) {
                                        continue;
                                    }
                                    if (query_res.rows[k].orderid == query_res.rows[k+1].orderid && query_res.rows[k].itemid != query_res.rows[k+1].itemid) {
                                        items[i][4]++;
                                        orderid = query_res.rows[k].orderid;
                                    }
                                }
                                if (i == items.length-1) {
                                    const data = {items: items};
                                    res.render('manager/salestogether', data);
                                }
                            })
                    }
                })
        })
})

/**
 * @swagger
 * /manager/restockreport:
 *   get:
 *     summary: Retrieve the manager/restockreport webpage
 *     description: Retrieves the webpage for displaying the restock report to the manager.
*/
app.get('/manager/restockreport', (req, res) => {
    inventory = []
    ingredients = []
    pool
        .query("SELECT * FROM inventory WHERE stock < 500;")
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                inventory.push(query_res.rows[i]);
            }
            pool
                .query('SELECT * FROM ingredient ORDER BY ingredientid ASC;')
                .then(query_res => {
                    for (let i = 0; i < query_res.rowCount; i++) {
                        ingredients.push(query_res.rows[i]);
                    }
                    const data = {inventory: inventory, ingredients: ingredients};
                    res.render('manager/restockreport', data);
                })
        })
})

/**
 * @swagger
 * /manager/excessreport:
 *   get:
 *     summary: Retrieve the manager/excessreport webpage
 *     description: Retrieves the webpage for displaying the excess report to the manager.
*/
app.get('/manager/excessreport', (req, res) => {
    ingredients = []
    percents = []
    const data = {ingredients: ingredients, percents: percents};
    res.render('manager/excessreport', data);
})

/**
 * @swagger
 * /manager/excessreporttime:
 *   get:
 *     summary: Retrieve the manager/excessreporttime webpage
 *     description: Retrieves the webpage for displaying the excess report time window to the manager.
*/
app.get('/manager/excessreporttime', (req, res) => {
    res.render('manager/excessreporttime');
})

/**
 * @swagger
 * /manager/excessreporttime:
 *   post:
 *     summary: Specify a time to view the excess report from the manager/excessreporttime webpage
 *     description: Allows a manager to specify a time window for them to view the excessreport GUI.
*/
app.post('/manager/excessreporttime', (req, res) => {
    ingredients = []
    ingredients1 = []
    inventory = []
    percents = []
    pool
        .query('SELECT * FROM ingredient ORDER BY ingredientid ASC;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                ingredients1.push(query_res.rows[i]);
            }
            inventory = []
            pool
                .query("SELECT * FROM inventoryupdates WHERE stockdate >= '"+req.body.time+"' ORDER BY stockdate DESC;")
                .then(query_res => {
                        for (let i = 0; i < query_res.rowCount; i++) {
                            inventory.push(query_res.rows[i]);
                        }
                        for (let i = 0; i < ingredients1.length; i++) {
                            inventory1 = []
                            for (let j = 0; j < inventory.length; j++) {
                                if (inventory[j].ingredientid == i) {
                                    inventory1.push(inventory[j].stock);
                                }
                            }
                            percent = ((inventory1[inventory1.length-1] - inventory1[0]) / inventory1[inventory1.length-1]) * 100;
                            if (percent < 10) {
                                ingredients.push(ingredients1[i]);
                                percents.push(percent);
                            }
                        }
                        const data = {ingredients: ingredients, percents: percents};
                        res.render('manager/excessreport', data);
                    })
        })
})

/**
 * @swagger
 * /customer/kiosk:
 *   get:
 *     summary: Retrieve the customer/kiosk webpage
 *     description: Retrieves the webpage for displaying the ordering kiosk to the customer.
*/
app.get('/customer/kiosk', (req, res) => {
    items1 = [];
    items = []
    pool
        .query('SELECT * FROM item ORDER BY itemid ASC;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                items.push(query_res.rows[i]);
            }
            const data = {items: items};
            res.render('customer/kiosk', data);
        });
})

/**
 * @swagger
 * /customer/kiosk:
 *   post:
 *     summary: Completes an order from the customer/kiosk webpage
 *     description: Allows a customer to complete their order using the kiosk GUI.
*/
app.post('/customer/kiosk', (req, res) => {
    if (req.body.completeorder == 0) {
        ordertimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
        price = 0;
        employeeid = 0;
        items2 = [];
        ingredients1 = []
        for (let i = 0; i < items1.length; i++) {
            items2.push(items1[i][0]);
            ingredients1.push(items1[i][1]);
        }
        pool
            .query('SELECT * FROM item ORDER BY itemid ASC;')
            .then(query_res => {
                for (let i = 0; i < items2.length; i++) {
                    price += parseFloat(query_res.rows[items2[i]].price);
                }
                pool
                    .query('SELECT COUNT(orderid) FROM customerorder;')
                    .then(query_res => {
                        orderid = parseInt(query_res.rows[0].count)+1;
                        pool.query("INSERT INTO customerorder(orderid, ordertimestamp, price, employeeid) VALUES("+orderid+", '"+ordertimestamp+"', "+price+", "+employeeid+");")
                        for (let i = 0; i < items2.length; i++) {
                            pool.query('INSERT INTO customerorderitemids(orderid, itemid) VALUES('+orderid+', '+items2[i]+');')
                            for (let j = 0; j < ingredients1[i].length; j++) {
                                pool.query('INSERT INTO customerorderingredientids(orderid, itemid, ingredientid) VALUES('+orderid+', '+items2[i]+', '+ingredients1[i][j]+');')
                                pool
                                    .query('SELECT * FROM inventory WHERE ingredientid = '+ingredients1[i][j]+';')
                                    .then(query_res => {
                                        stock = parseInt(query_res.rows[0].stock) - 1;
                                        pool.query('UPDATE inventory SET stock='+stock+'WHERE ingredientid='+ingredients1[i][j]+";")
                                        updateid;
                                        pool
                                            .query('SELECT COUNT(updateid) FROM inventoryupdates;')
                                            .then(query_res => {
                                                updateid = query_res.rows[0].count;
                                                pool.query("INSERT INTO inventoryupdates(updateid, ingredientid, stock, stockdate) VALUES("+updateid+", "+ingredients1[i][j]+", "+stock+", "+ordertimestamp+");")
                                            })
                                    })
                            }
                        }
                    })
            })
        items1 = [];
        res.render('customer/kiosk');
        return;
    } else {
        ingredients2 = [];
        for (let i = 0; i < ingredients1.length; i++) {
            if (req.body[i] != undefined) {
                ingredients2.push(ingredients1[i]);
            }
        }
        item.push(ingredients2);
        items1.push(item);
        const data = {items1: items1};
        res.render('customer/kiosk', data);
    }
})

/**
 * @swagger
 * /customer/additem:
 *   post:
 *     summary: Adds an item to the customer/kiosk webpage.
 *     description: Allows a customer to add an item to their order using the additem GUI.
*/
app.post('/customer/additem', (req, res) => {
    item = []
    item.push(parseInt(req.body.item));
    ingredients = []
    ingredients1 = []
    ingredients2 = []
    pool
        .query('SELECT * FROM itemingredientids WHERE itemid = '+req.body.item+' ORDER BY ingredientid ASC;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                ingredients2.push(query_res.rows[i].ingredientid);
            }
            pool
                .query('SELECT * FROM inventory ORDER BY ingredientid ASC;')
                .then(query_res => {
                    for (let i = 0; i < ingredients2.length; i++) {
                        if (query_res.rows[ingredients2[i]].stock > 0) {
                            ingredients1.push(ingredients2[i]);
                        }
                    }
                    pool
                        .query('SELECT * FROM ingredient;')
                        .then(query_res => {
                            for (let i = 0; i < query_res.rowCount; i++) {
                                ingredients.push(query_res.rows[i]);
                            }
                            const data = {ingredients: ingredients, ingredients1: ingredients1};
                            res.render('customer/additem', data);
                        })
            })
                })
})

/**
 * @swagger
 * /customer/menu:
 *   get:
 *     summary: Retrieve the customer/menu webpage
 *     description: Retrieves the webpage for displaying the menu to the customer website.
*/
app.get("/customer/menu", (req, res) => {
    items = []
    itemingredientids = []
    itemingredients = []
    pool
        .query('SELECT * FROM item ORDER BY itemid ASC;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                items.push(query_res.rows[i]);
            }
            pool
                .query('SELECT * FROM itemingredientids ORDER BY itemid ASC;')
                .then(query_res => {
                    let j = 0;
                    itemingredientids1 = []
                    for (let i = 0; i < query_res.rowCount; i++) {
                        if (items[j].itemid == query_res.rows[i].itemid) {
                            itemingredientids1.push(query_res.rows[i]);
                        } else {
                            itemingredientids.push(itemingredientids1);
                            itemingredientids1 = []
                            itemingredientids1.push(query_res.rows[i]);
                            j = j+1;
                        }
                    }
                    pool
                        .query('SELECT * FROM ingredient ORDER BY ingredientid ASC;')
                        .then(query_res => {
                            for (let i = 0; i < itemingredientids.length; i++) {
                                itemingredients1 = []
                                for (let j = 0; j < itemingredientids[i].length; j++) {
                                    itemingredients1.push(query_res.rows[itemingredientids[i][j].ingredientid]);
                                }
                                itemingredients.push(itemingredients1);
                            }
                            const data = {items: items, itemingredients: itemingredients};
                            res.render('customer/menu', data);
                        });
                });
        });
})

/**
 * @swagger
 * /customer/storelocation:
 *   get:
 *     summary: Retrieve the customer/storelocation webpage
 *     description: Retrieves the webpage for displaying the store location to the customer website.
*/
app.get('/customer/storelocation', (req, res) => {
    res.render('customer/storelocation');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});