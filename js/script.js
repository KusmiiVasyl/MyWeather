const key = ''/* your key from https://openweathermap.org/  */

//get elements from document
let blockCurrentWeather = document.getElementById('div_cur_weather');
let blockHourly = document.getElementById('div_hourly_weather');
let blockWeatherForFiveDays = document.getElementById('div_for_five_days');
let blockNearbyPlaces = document.getElementById('div_nearby_places');
let blockLoading = document.getElementById('weather_loading');
let video = document.getElementById("myVideo");
let source = document.getElementById('source');
let main_div_weather = document.getElementById('main_div_weather');
let presentBlock = document.getElementById('div_first');
let btnSearchCity = document.getElementById('btn_searchCity');
let blockCityNotFound = document.getElementById('div_cityNotFound');
let dataFromApi2;
let dataFromApi3;

//window load and set location
window.addEventListener('load', () => {
    let city = 'https://raw.githubusercontent.com/KusmiiVasyl/MY-WEATHER/master/js/city.list.json';
    fetch(city)
        .then(res => {
            return res.json();
        })
        .then(data => {
            let listCities = document.getElementById('listCities');
            for (let i = 0; i < data.length; i++) {
                let opt = document.createElement('option');
                opt.value = data[i].name;
                listCities.appendChild(opt);
            }
        })
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            main_div_weather.style.visibility = 'visible';
            presentBlock.style.visibility = 'hidden';
            fetchApis(pos.coords.longitude, pos.coords.latitude);
        });
    }
});
//enent click for button Search City
btnSearchCity.addEventListener('click', () => {
    let closeBlock = document.getElementById('div_second');
    presentBlock.style.visibility = 'hidden';
    closeBlock.style.visibility = 'visible';
    closeBlock.style.animationPlayState = 'running';
    setTimeout(() => {
        main_div_weather.style.visibility = 'visible';
        searchCity.click();
    }, 4500)
});

//event change for search city block
let searchCity = document.getElementById('searchCity');
let nav_btn = document.getElementById('nav_btn');
searchCity.addEventListener('change', e => {
    const api = `https://api.openweathermap.org/data/2.5/weather?q=${e.target.value}&units=metric&appid=${key}`;
    fetch(api)
        .then(res => {
            if (res.status == 404 || res.status != 200) {
                blockCityNotFound.style.visibility = 'visible';
                blockCityNotFound.children[1].innerHTML = `
                <p>${searchCity.value} could not be found.<br>
                Please enter a different location.</p>`
            }
            else {
                blockCityNotFound.style.visibility = 'hidden';
            }
            return res.json();
        })
        .then(data => {
            if (data.cod == 200) {
                blockCurrentWeather.style.visibility = 'visible';
                blockHourly.style.visibility = 'visible';
                blockWeatherForFiveDays.style.visibility = 'visible';
                blockWeatherForFiveDays.style.visibility = 'visible';
                blockNearbyPlaces.style.visibility = 'visible';
                nav_btn.style.visibility = 'visible';
                rowsTableVisible();
                btnToday.click();
                fetchApis(data.coord.lon, data.coord.lat);
            }
        })
        .catch(error => {
            console.log(error);
        });
});
searchCity.addEventListener('click', () => {
    searchCity.style.zIndex = 10;
    blockCurrentWeather.style.visibility = 'hidden';
    blockHourly.style.visibility = 'hidden';
    blockWeatherForFiveDays.style.visibility = 'hidden';
    blockWeatherForFiveDays.style.visibility = 'hidden';
    blockNearbyPlaces.style.visibility = 'hidden';
    nav_btn.style.visibility = 'hidden';
    {
        source.setAttribute('src', './mp4/Earth.mp4')
        video.load();
    }
    rowsTableHidden();
});


//fetch API
function fetchApis(lon, lat) {
    const api1 = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
    const api2 = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
    const api3 = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
    locationOnMap(lon, lat);
    fetch(api1)
        .then(res => {
            return res.json();
        })
        .then(data => {
            getCurrentWeather(data);
        })

    fetch(api2)
        .then(res => {
            return res.json();
        })
        .then(data => {
            dataFromApi2 = data;
            getHourlyWeather(data);
            getForFiveDaysWeather(data);
            fetch(api3)
                .then(res => {
                    return res.json();
                })
                .then(data2 => {
                    hourlyForEachDay(data2);
                    btnToday.click();
                });
        });
}

//set current weather block
function getCurrentWeather(data) {
    let selectSearchCity = document.getElementById('searchCity');
    let iconCurWeather = document.getElementById('iconCurWeather');
    let mainWeather = document.getElementById('weather_main');
    let cur_temp = document.getElementById('cur_temp');
    let real_feel = document.getElementById('real_feel');
    let sunrise = document.getElementById('sunrise');
    let sunset = document.getElementById('sunset');
    let duration = document.getElementById('duration');
    document.getElementById('cur_data').textContent =
        getCurDate(timeZone(data.dt, data.timezone));
    document.getElementById('city').textContent = data.name;

    selectSearchCity.value = data.name + ', ' + data.sys.country;  //city in search block
    setThemeWeather(data.weather[0].icon); // set theme of our program
    iconCurWeather.src = chooseIcons(data.weather[0].icon);
    mainWeather.textContent = data.weather[0].main;
    cur_temp.textContent = Math.round(data.main.temp) + '°C';
    real_feel.textContent =
        'Real Feel ' + Math.round(data.main.feels_like) + '°';
    //set sunrise, sunset, duration
    let date1 = timeZone(data.sys.sunrise, data.timezone),
        hours1 = date1.getHours(),
        minutes1 = '0' + date1.getMinutes(),
        date2 = timeZone(data.sys.sunset, data.timezone),
        hours2 = date2.getHours(),
        minutes2 = '0' + date2.getMinutes(),
        timeSunSet = hours2 + ':' + minutes2.slice(-2),
        timeSunRise = hours1 + ':' + minutes1.slice(-2);
    sunrise.textContent = 'Sunrise: ' + timeSunRise;
    sunset.textContent = 'Sunset: ' + timeSunSet;
    duration.textContent =
        'Duration: ' + diffSunsetSunrise(data.sys.sunset, data.sys.sunrise) + ' hr';
}

//get current date day.month.year
function getCurDate(date) {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}

//set hourly weather block FOR TODAY
function getHourlyWeather(data) {
    let table = document.getElementsByClassName("table"),
        rowsTable = table[0].rows;
    for (let q = 1; q < rowsTable[0].children.length; q++) {
        rowsTable[0].children[q].style.visibility = 'visible';
        rowsTable[1].children[q].style.visibility = 'visible';
        rowsTable[2].children[q].style.visibility = 'visible';
        rowsTable[3].children[q].style.visibility = 'visible';
        rowsTable[4].children[q].style.visibility = 'visible';
        rowsTable[5].children[q].style.visibility = 'visible';
    }
    for (let j = 1;
        j < rowsTable[0].children.length && j < data.hourly.length;
        j++) {
        //set hour
        let hour = timeZone(data.hourly[j].dt, data.timezone_offset);
        rowsTable[0].children[j].innerText = ('0' + hour.getHours()).slice(-2);
        //set icons
        rowsTable[1].children[j].firstElementChild.attributes[0].value =
            chooseIcons(data.hourly[j].weather[0].icon);
        //set forecast
        rowsTable[2].children[j].innerText = data.hourly[j].weather[0].main;
        //set temp
        rowsTable[3].children[j].innerText = Math.round(data.hourly[j].temp);
        //set real feel
        rowsTable[4].children[j].innerText = Math.round(data.hourly[j].feels_like);
        //set wind
        rowsTable[5].children[j].innerText = (data.hourly[j].wind_speed * 3.6).toFixed(2);
    }
}

//set For Five Days block
function getForFiveDaysWeather(data) {
    const weekday = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]; //for set day
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];//for set month
    let cards = document.getElementById('five_days').children;
    for (let i = 0; i < cards.length && i < data.daily.length; i++) {
        //set day
        let day = timeZone(data.daily[i + 1].dt, data.timezone_offset);
        cards[i].children[0].children[0].innerText =
            weekday[day.getDay()];
        //set month and date
        cards[i].children[1].children[0].innerText =
            months[day.getMonth()] + ' ' + ('0' + day.getDate()).slice(-2);
        //set icons
        cards[i].children[2].attributes[0].nodeValue =
            chooseIcons(data.daily[i + 1].weather[0].icon);
        //set temp
        cards[i].children[3].children[0].innerText =
            Math.round(data.daily[i + 1].temp.min) + ' - ' + Math.round(data.daily[i + 1].temp.max) + ' °C';
        //set discription
        cards[i].children[4].children[0].innerText =
            data.daily[i + 1].weather[0].description;
    }
}

//to use time zone
function timeZone(localTime, timeZone) {
    let date = new Date();
    localTime *= 1000;
    let localOffSet = date.getTimezoneOffset() * 60000;
    let utc = localTime + localOffSet;
    let myDate = utc + (1000 * timeZone);
    return new Date(myDate);
}

//different sunset add sunrise (set duration) FOR CURRENT WEATHER BLOCK
function diffSunsetSunrise(timeSunSet, timeSunRise) {
    let diffMin = Math.round(((timeSunSet - timeSunRise) * 1000) / (1000 * 60)),
        min = diffMin % 60,
        hour = (diffMin - min) / 60,
        timeDiff = ('0' + hour).slice(-2) + ':' + ('0' + min).slice(-2);

    return timeDiff;
}

//set hourly block for each of five days
function hourlyForEachDay(data) {
    let table = document.getElementsByClassName("table"),
        rowsTable = table[0].rows,
        cards = document.getElementById('five_days').children;
    for (let i = 0; i < cards.length; i++) {
        cards[i].addEventListener('click', () => {
            for (let k = 0; k < cards.length; k++) {
                cards[k].style.outline = '';
            }
            cards[i].style.outline = 'solid darkorange';
            cards[i].style.outlineWidth = '10px';
            getDataList(cards[i].children[1].children[0].innerText);
        });
    }
    function getDataList(str) {
        rowsTableVisible();
        let j = 1;
        let isoStrDate;
        for (let i = 0; i < data.list.length; i++) {
            // isoStrDate = new Date(data.list[i].dt * 1000).toISOString();
            isoStrDate = (new Date((data.list[i].dt + data.city.timezone) * 1000)).toISOString();
            if (str === parseStr(isoStrDate) && j < rowsTable[0].children.length) {
                //set hour
                rowsTable[0].children[j].innerText = isoStrDate.substring(11, 13);
                //set icons
                rowsTable[1].children[j].firstElementChild.attributes[0].value =
                    chooseIcons(data.list[i].weather[0].icon);
                //set forecast
                rowsTable[2].children[j].innerText = data.list[i].weather[0].main;
                //set temp
                rowsTable[3].children[j].innerText = Math.round(data.list[i].main.temp);
                //set real feel
                rowsTable[4].children[j].innerText = Math.round(data.list[i].main.feels_like);
                //set wind
                rowsTable[5].children[j].innerText = (data.list[i].wind.speed * 3.6).toFixed(2);
                j++;
            }
        }
        for (; j < rowsTable[0].children.length; j++) {
            rowsTable[0].children[j].style.visibility = 'hidden';
            rowsTable[1].children[j].style.visibility = 'hidden';
            rowsTable[2].children[j].style.visibility = 'hidden';
            rowsTable[3].children[j].style.visibility = 'hidden';
            rowsTable[4].children[j].style.visibility = 'hidden';
            rowsTable[5].children[j].style.visibility = 'hidden';
        }
    }
}
function parseStr(str) {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return months[parseInt(str.substr(5, 6)) - 1] + ' ' + (str.substr(8, 2));
}

//rows of table hidden, visible
function rowsTableVisible() {
    let table = document.getElementsByClassName("table"),
        rowsTable = table[0].rows;
    for (let q = 1; q < rowsTable[0].children.length; q++) {
        rowsTable[0].children[q].style.visibility = 'visible';
        rowsTable[1].children[q].style.visibility = 'visible';
        rowsTable[2].children[q].style.visibility = 'visible';
        rowsTable[3].children[q].style.visibility = 'visible';
        rowsTable[4].children[q].style.visibility = 'visible';
        rowsTable[5].children[q].style.visibility = 'visible';
    }
}
function rowsTableHidden() {
    let table = document.getElementsByClassName("table"),
        rowsTable = table[0].rows;
    for (let q = 1; q < rowsTable[0].children.length; q++) {
        rowsTable[0].children[q].style.visibility = 'hidden';
        rowsTable[1].children[q].style.visibility = 'hidden';
        rowsTable[2].children[q].style.visibility = 'hidden';
        rowsTable[3].children[q].style.visibility = 'hidden';
        rowsTable[4].children[q].style.visibility = 'hidden';
        rowsTable[5].children[q].style.visibility = 'hidden';
    }
}

//select my icons
function chooseIcons(site_icon) {
    let my_icon;

    switch (site_icon) {
        case '01d':  //day, clear sky
            my_icon = './animated/day.svg';
            break;
        case '02d':  //day, few clouds
            my_icon = './animated/cloudy-day-1.svg';
            break;
        case '03d':  //day, scattered clouds
        case '04d':  //day, broken clouds
        case '03n':  //night, scattered clouds
        case '04n':  //night, broken clouds
            my_icon = './animated/cloudy.svg';
            break;
        case '09d':  //day, shower rain
        case '09n':  //night, shower rain
        case '10n':  //night, rain
            my_icon = './animated/rainy-6.svg';
            break;
        case '10d':  //day, rain
            my_icon = './animated/rainy-3.svg';
            break;
        case '11d':  //day, thunderstorm
        case '11n':  //night, thunderstorm
            my_icon = './animated/thunder.svg';
            break;
        case '13d':  //day, snow
        case '13n':  //night, snow
            my_icon = './animated/snowy-6.svg';
            break;
        case '50d':  //day, mist
        case '50n':  //night, mist
            my_icon = './animated/mist.gif';
            break;
        case '01n':  //night, clear sky
            my_icon = './animated/night.svg';
            break;
        case '02n':  //night, few clouds
            my_icon = './animated/cloudy-night-3.svg';
            break;
        default:
            my_icon = './images/loading.gif';
            break;
    }
    return my_icon;
}

//location on the map
function locationOnMap(lon, lat) {
    document.getElementById('map').src =
        `https://openweathermap.org/weathermap?basemap=map&cities=true&layer=temperature&lat=${lat}&lon=${lon}&zoom=800`;
}

//set Theme weather
function setThemeWeather(site_icon) {
    switch (site_icon) {
        case '01d':  //day, clear sky
            source.setAttribute('src', './mp4/01d.mp4');
            break;
        case '02d':  //day, few clouds
            source.setAttribute('src', './mp4/02d.mp4');
            break;
        case '04d':  //day, broken clouds
        case '03d':  //day, scattered clouds
            source.setAttribute('src', './mp4/03d.mp4');
            break;
        case '50d':  //day, mist
        case '09d':  //day, shower rain
            source.setAttribute('src', './mp4/09d.mp4');
            break;
        case '10d':  //day, rain
            source.setAttribute('src', './mp4/10d.mp4');
            break;
        case '11d':  //day, thunderstorm
            source.setAttribute('src', './mp4/11d.mp4');
            break;
        case '13d':  //day, snow
            source.setAttribute('src', './mp4/13d.mp4');
            break;
        case '01n':  //night, clear sky
            source.setAttribute('src', './mp4/01n.mp4');
            break;
        case '02n':  //night, few clouds
            source.setAttribute('src', './mp4/02n.mp4');
            break;
        case '03n':  //night, scattered clouds
        case '50n':  //night, mist
        case '04n':  //night, broken clouds
            source.setAttribute('src', './mp4/04n.mp4');
            break;
        case '09n':  //night, shower rain
            source.setAttribute('src', './mp4/09n.mp4');
            break;
        case '10n':  //night, rain
            source.setAttribute('src', './mp4/10n.mp4');
            break;
        case '11n':  //night, thunderstorm
            source.setAttribute('src', './mp4/11n.mp4');
            break;
        case '13n':  //night, snow
            source.setAttribute('src', './mp4/13n.mp4');
            break;
        default:
            source.setAttribute('src', './mp4/default.mp4');
            break;
    }
    video.load();
}

//clock
let clock = document.getElementById('localTime');
setInterval(function () {
    clock.textContent = new Date().toLocaleTimeString();
}, 1000);

//change event clicks for buttons of navigations
const btnToday = document.getElementById('btn_today');
const btnForFiveDays = document.getElementById('btn_for_five_days');
btnToday.addEventListener('click', () => {
    blockCurrentWeather.hidden = false;
    blockWeatherForFiveDays.hidden = true;
    blockNearbyPlaces.hidden = false;
    getHourlyWeather(dataFromApi2);
    //change styles buttons
    btnToday.style.backgroundColor = 'darkorange';
    btnToday.style.color = 'black';
    btnForFiveDays.style.backgroundColor = 'black';
    btnForFiveDays.style.color = 'darkorange';
});
btnForFiveDays.addEventListener('click', () => {
    blockWeatherForFiveDays.hidden = false;
    blockCurrentWeather.hidden = true;
    blockNearbyPlaces.hidden = true;
    document.getElementById('five_days').children[0].click();
    //change styles buttons
    btnToday.style.backgroundColor = 'black';
    btnToday.style.color = 'darkorange';
    btnForFiveDays.style.backgroundColor = 'darkorange';
    btnForFiveDays.style.color = 'black';
});

