import express from "express"
import db from "./db.js"
import ejs from "ejs"
const App = express()
App.use(express.urlencoded({ extended: true }))
App.set("view engine","ejs")
App.listen(3000,()=>{
    console.log('ta andando')
})

App.get("/",async (req,res)=>{
    try {
        console.log("lol")
    } catch (error) {
        console.log(error)
    }
    res.sendFile("login.html",{root:"./"})
})

App.post("/",async (req,res)=>{
    //Renderizado completo de la página
    const cookie = req.headers.cookie ? JSON.parse(decodeURIComponent(req.headers.cookie.split("=")[1]).slice(2,-7)) : false;
    let info = {}
    cookie.Database = req.body.Database
    console.log('hola man',cookie)
    if (req.body.session == "logout"){
        res.clearCookie("user")
    }
    try{
        const resp = await db(cookie ? cookie : req.body)
        //Crear la información necesaria para el renderizado
        const query = await resp.query(`SELECT TABLE_NAME,TABLE_SCHEMA FROM INFORMATION_SCHEMA.TABLES`  )
        const map = []
        await query[0].map((el)=>{
            const indice = map.findIndex((e) => e.database == el.TABLE_SCHEMA);
            if (indice == -1){
                map.push({
                    "database":el.TABLE_SCHEMA,
                    "tables":[`${el.TABLE_NAME}`]
                })   
            }else{
                map[indice].tables.push(el.TABLE_NAME)
            }})
        info.dbs = map

        //Crear Cookie Si No Existe
        if (!cookie){
            console.log("no hay cookie")
            const session = {
                user: req.body.user,
                password: req.body.password,
            }
            res.cookie("user",session)
        }
        //----------------------
        //Si existe una consulta realizarla
        if (req.body.query){
            await resp.query(`USE \`${req.body.Database || "sys"}\` `)
            const result = await resp.query(req.body.query)
            info.result = result
        }
        //Mostrar todas las bases de datos existentes

        
    }catch(error){
        console.log("error",error)
        if (error.errorno == 1045){
            res.clearCookie("user")
        }
        res.render("login.ejs",{
            title:"login",
            info:info
        })
    }


    res.render("home.ejs",{
        title:"home",
        info:info,
        session:cookie
    })
})

App.post("/:db",async (req,res)=>{
    console.log(req.params.db)
    //Renderizado completo de la página
    const cookie = req.headers.cookie ? JSON.parse(decodeURIComponent(req.headers.cookie.split("=")[1]).slice(2,-7)) : false;
    let info = {}
    if (req.body.session == "logout"){
        res.clearCookie("user")
    }
    try{
        const resp = await db(cookie ? cookie : req.body)
        //Crear la información necesaria para el renderizado
        const query = await resp.query(`SELECT TABLE_NAME,TABLE_SCHEMA FROM INFORMATION_SCHEMA.TABLES`  )
        const map = []
        await query[0].map((el)=>{
            const indice = map.findIndex((e) => e.database == el.TABLE_SCHEMA);
            if (indice == -1){
                map.push({
                    "database":el.TABLE_SCHEMA,
                    "tables":[`${el.TABLE_NAME}`]
                })   
            }else{
                map[indice].tables.push(el.TABLE_NAME)
            }})
        info.dbs = map

        //Crear Cookie Si No Existe
        if (!cookie){
            console.log("no hay cookie")
            const session = {
                user: req.body.user,
                password: req.body.password,
                database: req.body.database
            }
            res.cookie("user",session)
        }
        //----------------------
        //Si existe una consulta realizarla
        if (req.body.query){
            await resp.query('USE ?', 'sys')
            const result = await resp.query(req.body.query)
            info.result = result
        }
        //Mostrar todas las bases de datos existentes

        
    }catch(error){
        console.log("error",error)
        if (error.errorno == 1045){
            res.clearCookie("user")
        }
        res.sendFile("icons",{root:"./"})
        res.render("login.ejs",{
            title:"login",
            info:info
        })
    }


    res.render("home.ejs",{
        title:"home",
        info:info
    })
})