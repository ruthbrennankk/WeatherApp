//  Requirements
const express = require("express")
const path = require("path")
const fetch = require("node-fetch")
//  Run the express app
const app = express()

//  Constants
const apiKey = "3e2d927d4f28b456c6bc662f34350957";  // from lecture slides
const port = process.env.PORT || 8080

//
let publicPath = path.resolve(__dirname, "public")
app.use(express.static(publicPath))
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/index.html"))
})
app.get("/weather/:location", getWeather)

//  Log port information
app.listen(port, function () {
    console.log("Weather app listening on port 8080!")
})

//  Get data from API and then format data to display on webpage
async function getWeather(req, res) {
    //  Craft URL
    var city = req.params.location
    const url = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=metric" + "&appid="+ apiKey
    //  Make request to weather api
    var response = await fetch(url)
    let data = await response.json()    //  Jsonify response
    //  Set up array to store summary and the packing information
    var myArray = {
        umbrella : '',
        packFor : '',
        summary :[]
    }
    var cold=0, warm=0, hot=0;
    //  Loop through the data that was retrieved
    for(var i = 0; i < data.cnt; i++)
    {
        var weather =data.list[i].weather[0].main;
        var rainfall = ''
        if(weather == 'Rain'){
            myArray.umbrella = 'You should bring an umbrella'
            rainfall = data.list[i].rain['3h'];
        }
        var temp = data.list[i].main.temp;
        if(temp > -10 && temp < 10){
            cold++
        } else if (temp < 20) {
            warm++
        } else {
            hot++
        }
        //  Format Data
        console.log(data.list[i])
        var desc = data.list[i].weather[0].description;
        var windSpeed =data.list[i].wind.speed;
        var dt = data.list[i].dt_txt;
        myArray.summary.push(
            {
                City: city,
                Description: desc,
                Temp: temp,
                Windspeed: windSpeed,
                Rainfall: rainfall,
                Date: dt
            }
        )
    }
    //  Check if no data was retrieved
    if (myArray.summary.length == 0) {
        myArray.packFor = 'There is no information for that city'
    } else {
        //  Cold (temp range -10..+10), Warm (+10-+20) or Hot (20+)
        if(cold > warm && cold > hot){
            myArray.packFor = 'Pack for cold weather'
        } else if (warm > hot) {
            myArray.packFor = 'Pack for warm weather'
        } else {
            myArray.packFor = 'Pack for hot weather'
        }
    }
    //  Jsonify the array
    res.json(myArray)
}
