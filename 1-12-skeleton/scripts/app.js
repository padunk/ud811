
(function() {
  'use strict';

  var injectedForecast = {
    key: 'new york',
    label: 'New York, NY',
    list: [{
      dt: 1515585600,
      weather: [{ main: 'Clear', description: 'sky is clear' }],
      temp: {day: 3, min: 3, max: 6},
      rain: 0.20,
      humidity: 0.77,
      deg: 125,
      speed: 1.52
    },
    {
      temp: { day: 7., min: 7, max: 17.12 },
      weather: [{ main: 'Rain' }]
    },
    {
      temp: { day: 7., min: 7, max: 17.12 },
      weather: [{ main: 'Clear' }]
    },
    {
      temp: { day: 7., min: 7, max: 17.12 },
      weather: [{ main: 'Snow' }]
    },
    {
      temp: { day: 7., min: 7, max: 17.12 },
      weather: [{ main: 'Clouds' }]
    },
    {
      temp: { day: 7., min: 7, max: 17.12 },
      weather: [{ main: 'Mist' }]
    },
    {
      temp: { day: 7., min: 7, max: 17.12 },
      weather: [{ main: 'Rain' }]
    },
    {
      temp: { day: 7., min: 7, max: 17.12 },
      weather: [{ main: 'Mist' }]
    },
    {
      temp: { day: 7., min: 7, max: 17.12 },
      weather: [{ main: 'Thunderstorm' }]
    }
    ]
  };

  var weatherAPIUrlBase = 'http://api.openweathermap.org/data/2.5/forecast/daily?q=';
  var dayCount = '&cnt=8&units=metric';
  var appId = '&appid=';

  var app = {
    isLoading: true,
    visibleCards: {},
    selectedCities: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  /* Event listener for refresh button */
  document.getElementById('butRefresh').addEventListener('click', function() {
    app.updateForecasts();
  });

  /* Event listener for add new city button */
  document.getElementById('butAdd').addEventListener('click', function() {
    // Open/show the add new city dialog
    app.toggleAddDialog(true);
  });

  /* Event listener for add city button in add city dialog */
  document.getElementById('butAddCity').addEventListener('click', function() {
    var select = document.getElementById('selectCityToAdd');
    var selected = select.options[select.selectedIndex];
    var key = selected.value;
    var label = selected.textContent;
    app.getForecast(key, label);
    app.selectedCities.push({key: key, label: label});
    app.toggleAddDialog(false);
  });

  /* Event listener for cancel button in add city dialog */
  document.getElementById('butAddCancel').addEventListener('click', function() {
    app.toggleAddDialog(false);
  });


  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Toggles the visibility of the add new city dialog.
  app.toggleAddDialog = function(visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  // Updates a weather card with the latest weather forecast. If the card
  // doesn't already exist, it's cloned from the template.
  app.updateForecastCard = function(data) {
    var card = app.visibleCards[data.key];
    if (!card) {
      card = app.cardTemplate.cloneNode(true);
      card.classList.remove('cardTemplate');
      card.querySelector('.location').textContent = data.label;
      card.removeAttribute('hidden');
      app.container.appendChild(card);
      app.visibleCards[data.key] = card;
    }
    card.querySelector('.description').textContent = data.list[0].weather[0].description;
    card.querySelector('.date').textContent =
      new Date(data.list[0].dt * 1000);
    card.querySelector('.current .icon').classList.add(data.list[0].weather[0].main.toLowerCase());
    card.querySelector('.current .temperature .value').textContent =
      Math.round(data.list[0].temp.day);
    card.querySelector('.current .feels-like .value').textContent =
      Math.round((data.list[0].temp.max + data.list[0].temp.min) / 2);
    card.querySelector('.current .precip').textContent =
      data.list[0].rain ? data.list[0].rain + '%' : '';
    card.querySelector('.current .humidity').textContent =
      data.list[0].humidity + '%';
    card.querySelector('.current .wind .value').textContent =
      Math.round(data.list[0].speed);
    card.querySelector('.current .wind .direction').textContent =
      data.list[0].deg;

    var nextDays = card.querySelectorAll('.future .oneday');
    var today = new Date();
    today = today.getDay();

    for (var i = 1; i < 9; i++) {
      var nextDay = nextDays[i-1];
      var iconClass = data.list[i].weather[0].main.toLowerCase();
      
      if (nextDay) {
        nextDay.querySelector('.date').textContent =
          app.daysOfWeek[(i-1 + today) % 7];
        nextDay.querySelector('.icon').classList.add(iconClass);
        nextDay.querySelector('.temp-high .value').textContent =
          Math.round(data.list[i].temp.max);
        nextDay.querySelector('.temp-low .value').textContent =
        Math.round(data.list[i].temp.min);
      }
    }
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };


  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/

  // Gets a forecast for a specific city and update the card with the data
  app.getForecast = function(key, label) {
    var url = weatherAPIUrlBase + key + dayCount + appId;
    // Make the XHR to get the data, then update the card
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          response.key = key;
          response.label = label;
          app.updateForecastCard(response);
        }
      }
    };
    request.open('GET', url);
    request.send();
  };

  // Iterate all of the cards and attempt to get the latest forecast data
  app.updateForecasts = function() {
    var keys = Object.keys(app.visibleCards);
    keys.forEach(function(key) {
      app.getForecast(key);
    });
  };

  app.updateForecastCard(injectedForecast);

})();
