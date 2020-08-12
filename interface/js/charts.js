var chart, config;

$(document).ready(function () {
    $('.btn').change(function () {

        var myRadio = $('input[name=options]');
        var checkedValue = myRadio.filter(':checked').val();

        switch (checkedValue) {
            case 'temp':
                doTemp();
                break;
            case 'dailytemp':
                doDailyTemp();
                break;
            case 'press':
                doPress();
                break;
            case 'wind':
                doWind();
                break;
            case 'windDir':
                doWindDir();
                break;
            case 'rain':
                doRain();
                break;
            case 'dailyrain':
                doDailyRain();
                break;
            case 'humidity':
                doHum();
                break;
            case 'solar':
                doSolar();
                break;
            case 'sunhours':
                doSunHours();
                break;
        }
    });

    $.ajax({url: "api/settings/version.json", dataType: "json", success: function (result) {
            $('#Version').text(result.Version);
            $('#Build').text(result.Build);
        }});

    $.ajax({url: "api/graphdata/graphconfig.json", success: function (result) {
            config = result;
            doTemp();
        }});
});


var doTemp = function () {
    var freezing = config.temp.units === 'C' ? 0 : 32;
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'Temperature'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b',
                week: '%e %b %y',
                month: '%b %y',
                year: '%Y'
            }
        },
        yAxis: [{
                // left
                title: {text: 'Temperature (°' + config.temp.units + ')'},
                opposite: false,
                labels: {
                    align: 'right',
                    x: -5,
                    formatter: function () {
                        return '<span style="fill: ' + (this.value <= freezing ? 'blue' : 'red') + ';">' + this.value + '</span>';
                    }
                },
                plotLines: [{
                        // freezing line
                        value: freezing,
                        color: 'rgb(0, 0, 180)',
                        width: 1,
                        zIndex: 2
                    }]
            }, {
                // right
                gridLineWidth: 0,
                opposite: true,
                linkedTo: 0,
                labels: {
                    align: 'left',
                    x: 5,
                    formatter: function () {
                        return '<span style="fill: ' + (this.value <= 0 ? 'blue' : 'red') + ';">' + this.value + '</span>';
                    }
                }
            }],
        legend: {enabled: true},
        plotOptions: {
            series: {
                dataGrouping: {
                    enabled: false
                },
                states: {
                    hover: {
                        halo: {
                            size: 5,
                            opacity: 0.25
                        }

                    }
                },
                cursor: 'pointer',
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            radius: 0.1
                        }
                    }
                }
            },
            line: {lineWidth: 2}
        },
        tooltip: {
            shared: true,
            split: false,
            valueSuffix: '°' + config.temp.units,
            valueDecimals: config.temp.decimals,
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [],
        rangeSelector: {
            buttons: [{
                    count: 6,
                    type: 'hour',
                    text: '6h'
                }, {
                    count: 12,
                    type: 'hour',
                    text: '12h'
                }, {
                    type: 'all',
                    text: 'All'
                }],
            inputEnabled: false
        }
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: 'api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
           var titles = {
               'temp'     : 'Temperature',
               'dew'      : 'Dew Point',
               'apptemp'  : 'Apparent',
               'feelslike': 'Feels Like',
               'wchill'   : 'Wind Chill',
               'heatindex': 'Heat Index',
               'humidex'  : 'Humidex',
               'intemp'   : 'Inside'
            };
            var idxs = ['temp', 'dew', 'apptemp', 'feelslike', 'wchill', 'heatindex', 'humidex', 'intemp'];
            var cnt = 0;
            idxs.forEach(function(idx) {
                if (idx in resp) {
                    chart.addSeries({
                        name: titles[idx],
                        data: resp[idx]
                    }, false);

                    if (idx === 'humidex') {
                        chart.series[cnt].tooltipOptions.valueSuffix = '';
                        // Link Humidex and temp scales if using Celsius
                        // For fahrenheit use separate scales
                        if (config.temp.units = 'C') {
                            chart.yAxis[1].options.title.text = '';
                        } else {
                            chart.yAxis[1].options.linkedTo = null;
                            chart.series[cnt].yAxis = 1;
                        }
                    }

                    if (idx === 'temp') {
                        chart.series[cnt].options.zIndex = 99;
                    }
                    cnt++;
                }
            });
            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doPress = function () {
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
			alignTicks: false
        },
        title: {text: 'Pressure'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b',
                week: '%e %b %y',
                month: '%b %y',
                year: '%Y'
            }
        },
        yAxis: [{
                // left
                title: {text: 'Pressure (' + config.press.units + ')'},
                opposite: false,
                labels: {
                    align: 'right',
                    x: -5
                }
            }, {
                // right
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                title: {text: null},
                labels: {
                    align: 'left',
                    x: 5
                }
            }],
        legend: {enabled: true},
        plotOptions: {
            series: {
                dataGrouping: {
                    enabled: false
                },
                states: {
                    hover: {
                        halo: {
                            size: 5,
                            opacity: 0.25
                        }

                    }
                },
                cursor: 'pointer',
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            radius: 0.1
                        }
                    }
                }
            },
            line: {lineWidth: 2}
        },
        tooltip: {
            shared: true,
            split: false,
            valueSuffix: config.press.units,
            valueDecimals: config.press.decimals,
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [{
                name: 'Pressure'
            }],
        rangeSelector: {
            buttons: [{
                    count: 6,
                    type: 'hour',
                    text: '6h'
                }, {
                    count: 12,
                    type: 'hour',
                    text: '12h'
                }, {
                    type: 'all',
                    text: 'All'
                }],
            inputEnabled: false
        }
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: 'api/graphdata/pressdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.series[0].setData(resp.press);
        }
    });
};

var compassP = function (deg) {
    var a = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return a[Math.floor((deg + 22.5) / 45) % 8];
};

var doWindDir = function () {
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'scatter',
            alignTicks: false
        },
        title: {text: 'Wind Direction'},
        credits: {enabled: true},
        boost: {
            useGPUTranslations: false,
            usePreAllocated: true
        },
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b',
                week: '%e %b %y',
                month: '%b %y',
                year: '%Y'
            }
        },
        yAxis: [{
                // left
                title: {text: 'Bearing'},
                opposite: false,
                min: 0,
                max: 360,
                tickInterval: 45,
                labels: {
                    align: 'right',
                    x: -5,
                    formatter: function () {
                        return compassP(this.value);
                    }
                }
            }, {
                // right
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                title: {text: null},
                min: 0,
                max: 360,
                tickInterval: 45,
                labels: {
                    align: 'left',
                    x: 5,
                    formatter: function () {
                        return compassP(this.value);
                    }
                }
            }],
        legend: {enabled: true},
        plotOptions: {
            scatter: {
                animationLimit: 1,
                cursor: 'pointer',
                enableMouseTracking: false,
                boostThreshold: 200,
                marker: {
                    states: {
                        hover: {enabled: false},
                        select: {enabled: false},
                        normal: {enabled: false}
                    }
                },
                shadow: false,
                label: {enabled: false}
            }

        },
        tooltip: {
            enabled: false
        },
        series: [{
                name: 'Bearing',
                type: 'scatter',
                marker: {
                    symbol: 'circle',
                    radius: 2
                }
            }, {
                name: 'Avg Bearing',
                type: 'scatter',
                color: 'red',
                marker: {
                    symbol: 'circle',
                    radius: 2
                }
            }
        ],
        rangeSelector: {
            buttons: [{
                    count: 6,
                    type: 'hour',
                    text: '6h'
                }, {
                    count: 12,
                    type: 'hour',
                    text: '12h'
                }, {
                    type: 'all',
                    text: 'All'
                }],
            inputEnabled: false
        }
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: 'api/graphdata/wdirdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.series[0].setData(resp.bearing);
            chart.series[1].setData(resp.avgbearing);
        }
    });
};


var doWind = function () {
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'Wind Speed'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b',
                week: '%e %b %y',
                month: '%b %y',
                year: '%Y'
            }
        },
        yAxis: [{
                // left
                title: {text: 'Wind Speed (' + config.wind.units + ')'},
                opposite: false,
                min: 0,
                labels: {
                    align: 'right',
                    x: -5
                }
            }, {
                // right
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                min: 0,
                title: {text: null},
                labels: {
                    align: 'left',
                    x: 5
                }
            }],
        legend: {enabled: true},
        plotOptions: {
            series: {
                dataGrouping: {
                    enabled: false
                },
                states: {
                    hover: {
                        halo: {
                            size: 5,
                            opacity: 0.25
                        }

                    }
                },
                cursor: 'pointer',
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            radius: 0.1
                        }
                    }
                }
            },
            line: {lineWidth: 2}
        },
        tooltip: {
            shared: true,
            split: false,
            valueSuffix: config.wind.units,
            valueDecimals: config.wind.decimals,
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [{
                name: 'Wind Speed'
            }, {
                name: 'Wind Gust'
            }],
        rangeSelector: {
            buttons: [{
                    count: 6,
                    type: 'hour',
                    text: '6h'
                }, {
                    count: 12,
                    type: 'hour',
                    text: '12h'
                }, {
                    type: 'all',
                    text: 'All'
                }],
            inputEnabled: false
        }
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: 'api/graphdata/winddata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.series[0].setData(resp.wspeed);
            chart.series[1].setData(resp.wgust);
        }
    });
};

var doRain = function () {
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: true
        },
        title: {text: 'Rainfall'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b',
                week: '%e %b %y',
                month: '%b %y',
                year: '%Y'
            }
        },
        yAxis: [{
                // left
                title: {text: 'Rainfall rate (' + config.rain.units + '/hr)'},
                min: 0,
                opposite: false,
                labels: {
                    align: 'right',
                    x: -5
                }
            }, {
                // right
                opposite: true,
                title: {text: 'Rainfall (' + config.rain.units + ')'},
                min: 0,
                labels: {
                    align: 'left',
                    x: 5
                }
            }],
        legend: {enabled: true},
        plotOptions: {
            series: {
                dataGrouping: {
                    enabled: false
                },
                states: {
                    hover: {
                        halo: {
                            size: 5,
                            opacity: 0.25
                        }

                    }
                },
                cursor: 'pointer',
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            radius: 0.1
                        }
                    }
                }
            },
            line: {lineWidth: 2}
        },
        tooltip: {
            shared: true,
            split: false,
            valueDecimals: config.rain.decimals,
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [{
                name: 'Rain rate',
                type: 'line',
                yAxis: 0,
                tooltip: {valueSuffix: config.rain.units + '/hr'}
            }, {
                name: 'Daily rain',
                type: 'area',
                yAxis: 1,
                tooltip: {valueSuffix: config.rain.units}
            }],
        rangeSelector: {
            buttons: [{
                    count: 6,
                    type: 'hour',
                    text: '6h'
                }, {
                    count: 12,
                    type: 'hour',
                    text: '12h'
                }, {
                    type: 'all',
                    text: 'All'
                }],
            inputEnabled: false
        }
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: 'api/graphdata/raindata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.series[0].setData(resp.rrate);
            chart.series[1].setData(resp.rfall);
        }
    });
};

var doHum = function () {
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'Relative Humidity'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b',
                week: '%e %b %y',
                month: '%b %y',
                year: '%Y'
            }
        },
        yAxis: [{
                // left
                title: {text: 'Humidity (%)'},
                opposite: false,
                min: 0,
                max: 100,
                labels: {
                    align: 'right',
                    x: -5
                }
            }, {
                // right
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                min: 0,
                max: 100,
                title: {text: null},
                labels: {
                    align: 'left',
                    x: 5
                }
            }],
        legend: {enabled: true},
        plotOptions: {
            series: {
                dataGrouping: {
                    enabled: false
                },
                states: {
                    hover: {
                        halo: {
                            size: 5,
                            opacity: 0.25
                        }

                    }
                },
                cursor: 'pointer',
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            radius: 0.1
                        }
                    }
                }
            },
            line: {lineWidth: 2}
        },
        tooltip: {
            shared: true,
            split: false,
            valueSuffix: '%',
            valueDecimals: config.hum.decimals,
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [],
        rangeSelector: {
            buttons: [{
                    count: 6,
                    type: 'hour',
                    text: '6h'
                }, {
                    count: 12,
                    type: 'hour',
                    text: '12h'
                }, {
                    type: 'all',
                    text: 'All'
                }],
            inputEnabled: false
        }
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: 'api/graphdata/humdata.json',
        dataType: 'json',
        success: function (resp) {
            var titles = {
                'hum'  : 'Outdoor Humidity',
                'inhum': 'Indoor Humidity'
             }
             var idxs = ['hum', 'inhum'];
             var cnt = 0;
             idxs.forEach(function(idx) {
                 if (idx in resp) {
                     chart.addSeries({
                         name: titles[idx],
                         data: resp[idx]
                     }, false);

                     cnt++;
                 }
             });

            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doSolar = function () {
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: true
        },
        title: {text: 'Solar'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b',
                week: '%e %b %y',
                month: '%b %y',
                year: '%Y'
            }
        },
        yAxis: [{
                // left
                title: {text: 'Solar Radiation (W/m\u00B2)'},
                min: 0,
                opposite: false,
                labels: {
                    align: 'right',
                    x: -5
                }
            }, {
                // right
                opposite: true,
                linkedTo: 0,
                min: 0,
                labels: {
                    align: 'left',
                    x: 5
                }
            }],
        legend: {enabled: true},
        plotOptions: {
            series: {
                dataGrouping: {
                    enabled: false
                },
                states: {
                    hover: {
                        halo: {
                            size: 5,
                            opacity: 0.25
                        }

                    }
                },
                cursor: 'pointer',
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            radius: 0.1
                        }
                    }
                }
            },
            line: {lineWidth: 2}
        },
        tooltip: {
            shared: true,
            split: false,
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [],
        rangeSelector: {
            buttons: [{
                    count: 6,
                    type: 'hour',
                    text: '6h'
                }, {
                    count: 12,
                    type: 'hour',
                    text: '12h'
                }, {
                    type: 'all',
                    text: 'All'
                }],
            inputEnabled: false
        }
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: 'api/graphdata/solardata.json',
        dataType: 'json',
        success: function (resp) {
            var titles = {
                SolarRad       : 'Solar Radiation',
                CurrentSolarMax: 'Theoretical Max',
                UV: 'UV Index'
            };
            var types = {
                SolarRad: 'area',
                CurrentSolarMax: 'area',
                UV: 'line'
            };
            var yAxes = {
                SolarRad: 0,
                CurrentSolarMax: 0,
                UV: "UV"
            };
            var tooltips = {
                SolarRad: {
                    valueSuffix: 'W/m\u00B2',
                    valueDecimals: 0
                },
                CurrentSolarMax: {
                    valueSuffix: 'W/m\u00B2',
                    valueDecimals: 0
                },
                UV: {
                    valueSuffix: '',
                    valueDecimals: config.uv.decimals
                }
            };
            var idxs = ['SolarRad', 'CurrentSolarMax', 'UV'];
            var cnt = 0;
            idxs.forEach(function(idx) {
                if (idx in resp) {
                    if (idx === 'UV') {
                        chart.yAxis[1].remove();
                        chart.addAxis({
                            id: 'UV',
                            title:{text: 'UV Index'},
                            opposite: true,
                            min: 0,
                            labels: {
                                align: 'left'
                            }
                        });
                    }

                    chart.addSeries({
                        name: titles[idx],
                        type: types[idx],
                        yAxis: yAxes[idx],
                        tooltip: tooltips[idx],
                        data: resp[idx]
                    }, false);

                    cnt++;
                }
            });

            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doSunHours = function () {
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'column',
            alignTicks: false
        },
        title: {text: 'Sunshine Hours'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b',
                week: '%e %b %y',
                month: '%b %y',
                year: '%Y'
            }
        },
        yAxis: [{
                // left
                title: {text: 'Sunshine Hours'},
                min: 0,
                opposite: false,
                labels: {
                    align: 'right',
                    x: -12
                }
            }, {
                // right
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                title: {text: null},
                labels: {
                    align: 'left',
                    x: 12
                }
            }],
        legend: {enabled: true},
        plotOptions: {
            series: {
                dataGrouping: {
                    enabled: false
                },
                states: {
                    hover: {
                        halo: {
                            size: 5,
                            opacity: 0.25
                        }

                    }
                },
                cursor: 'pointer',
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            radius: 0.1
                        }
                    }
                }
            }
        },
        tooltip: {
            shared: true,
            split: false,
            xDateFormat: "%A, %b %e"
        },
        series: [{
                name: 'Sunshine Hours',
                type: 'column',
                color: 'gold',
                yAxis: 0,
                valueDecimals: 1,
                tooltip: {valueSuffix: 'Hrs'}
            }]
    };

    chart = new Highcharts.Chart(options);
    chart.showLoading();

    $.ajax({
        url: 'api/graphdata/sunhours.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.series[0].setData(resp.sunhours);
        }
    });
};

var doDailyRain = function () {
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'column',
            alignTicks: false
        },
        title: {text: 'Daily Rainfall'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b',
                week: '%e %b %y',
                month: '%b %y',
                year: '%Y'
            }
        },
        yAxis: [{
                // left
                title: {text: 'Daily Rainfall'},
                min: 0,
                opposite: false,
                labels: {
                    align: 'right',
                    x: -12
                }
            }, {
                // right
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                title: {text: null},
                labels: {
                    align: 'left',
                    x: 12
                }
            }],
        legend: {enabled: true},
        plotOptions: {
            series: {
                dataGrouping: {
                    enabled: false
                },
                states: {
                    hover: {
                        halo: {
                            size: 5,
                            opacity: 0.25
                        }

                    }
                },
                cursor: 'pointer',
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            radius: 0.1
                        }
                    }
                }
            }
        },
        tooltip: {
            shared: true,
            split: false,
            xDateFormat: "%A, %b %e"
        },
        series: [{
                name: 'Daily Rainfall',
                type: 'column',
                color: 'blue',
                yAxis: 0,
                valueDecimals: config.rain.decimals,
                tooltip: {valueSuffix: config.rain.units}
            }]
    };

    chart = new Highcharts.Chart(options);
    chart.showLoading();

    $.ajax({
        url: 'api/graphdata/dailyrain.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.series[0].setData(resp.dailyrain);
        }
    });
};

var doDailyTemp = function () {
    var freezing = config.temp.units === 'C' ? 0 : 32;
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'Daily Temperature'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b',
                week: '%e %b %y',
                month: '%b %y',
                year: '%Y'
            }
        },
        yAxis: [{
                // left
                title: {text: 'Daily Temperature (°' + config.temp.units + ')'},
                opposite: false,
                labels: {
                    align: 'right',
                    x: -5,
                    formatter: function () {
                        return '<span style="fill: ' + (this.value <= 0 ? 'blue' : 'red') + ';">' + this.value + '</span>';
                    }
                },
                plotLines: [{
                        // freezing line
                        value: freezing,
                        color: 'rgb(0, 0, 180)',
                        width: 1,
                        zIndex: 2
                    }]
            }, {
                // right
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                title: {text: null},
                labels: {
                    align: 'left',
                    x: 5,
                    formatter: function () {
                        return '<span style="fill: ' + (this.value <= 0 ? 'blue' : 'red') + ';">' + this.value + '</span>';
                    }
                }
            }],
        legend: {enabled: true},
        plotOptions: {
            series: {
                dataGrouping: {
                    enabled: false
                },
                states: {
                    hover: {
                        halo: {
                            size: 5,
                            opacity: 0.25
                        }

                    }
                },
                cursor: 'pointer',
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            radius: 0.1
                        }
                    }
                }
            },
            line: {lineWidth: 2}
        },
        tooltip: {
            shared: true,
            split: false,
            valueSuffix: '°' + config.temp.units,
            valueDecimals: config.temp.decimals,
            xDateFormat: "%A, %b %e"
        },
        rangeSelector: {
            enabled: false
        },
        series: [{
                name: 'Avg Temp',
                color: 'green'
            }, {
                name: 'Min Temp',
                color: 'blue'
            }, {
                name: 'Max Temp',
                color: 'red'
            }]
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: 'api/graphdata/dailytemp.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.series[0].setData(resp.avgtemp);
            chart.series[1].setData(resp.mintemp);
            chart.series[2].setData(resp.maxtemp);
        }
    });
};

