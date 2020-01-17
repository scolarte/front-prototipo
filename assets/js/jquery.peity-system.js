    

        /**  Init Bars in card-counter  **/ 
        $(".bar.peity-bar-secondary").peity("bar", {
            fill: ["#E9ECEF"],
            width: 200,
            height: 60
        }),
        
        /**  Init Table / Memory / Primary   **/ 
        
            (function() {
            /* dynamic example */
            var dynamicChart = $("#peityPrimary").peity("line", {
                width: 150,
                fill: 'rgba(46, 165, 246, 0.1)',
                stroke: '#1EB7FF',
                strokeWidth: 1,
                height: 33
            });

            setInterval(function() {
                var random = Math.round(Math.random() * 10);
                var values = dynamicChart.text().split(",");
                values.shift();
                values.push(random);

                dynamicChart
                    .text(values.join(","))
                    .change();
                }, 1000);
            })();
        
            (function() {
            /* dynamic example */
            var dynamicChart = $("#peityPrimary2").peity("line", {
                width: 150,
                fill: 'rgba(46, 165, 246, 0.1)',
                stroke: '#1EB7FF',
                strokeWidth: 1,
                height: 33
            });

            setInterval(function() {
                var random = Math.round(Math.random() * 10);
                var values = dynamicChart.text().split(",");
                values.shift();
                values.push(random);

                dynamicChart
                    .text(values.join(","))
                    .change();
                }, 1000);
            })();
        
        
            (function() {
            /* dynamic example */
            var dynamicChart = $("#peityPrimary3").peity("line", {
                width: 150,
                fill: 'rgba(46, 165, 246, 0.1)',
                stroke: '#1EB7FF',
                strokeWidth: 1,
                height: 33
            });

            setInterval(function() {
                var random = Math.round(Math.random() * 10);
                var values = dynamicChart.text().split(",");
                values.shift();
                values.push(random);

                dynamicChart
                    .text(values.join(","))
                    .change();
                }, 1000);
            })();
        
        
            (function() {
            /* dynamic example */
            var dynamicChart = $("#peityPrimary4").peity("line", {
                width: 150,
                fill: 'rgba(46, 165, 246, 0.1)',
                stroke: '#1EB7FF',
                strokeWidth: 1,
                height: 33
            });

            setInterval(function() {
                var random = Math.round(Math.random() * 10);
                var values = dynamicChart.text().split(",");
                values.shift();
                values.push(random);

                dynamicChart
                    .text(values.join(","))
                    .change();
                }, 1000);
            })();
        
        /**  Init Table / CPU / Purple   **/ 
        
            (function() {
            /* dynamic example */
            var dynamicChart = $("#peityPurple").peity("line", {
                width: 150,
                fill: 'rgba(111, 66, 193, 0.1)',
                stroke: '#CA8EFF',
                strokeWidth: 1,
                height: 33
            });

            setInterval(function() {
                var random = Math.round(Math.random() * 10);
                var values = dynamicChart.text().split(",");
                values.shift();
                values.push(random);

                dynamicChart
                    .text(values.join(","))
                    .change();
                }, 1000);
            })();
        
        
            (function() {
            /* dynamic example */
            var dynamicChart = $("#peityPurple2").peity("line", {
                width: 150,
                fill: 'rgba(111, 66, 193, 0.1)',
                stroke: '#CA8EFF',
                strokeWidth: 1,
                height: 33
            });

            setInterval(function() {
                var random = Math.round(Math.random() * 10);
                var values = dynamicChart.text().split(",");
                values.shift();
                values.push(random);

                dynamicChart
                    .text(values.join(","))
                    .change();
                }, 1000);
            })();
        
        
            (function() {
            /* dynamic example */
            var dynamicChart = $("#peityPurple3").peity("line", {
                width: 150,
                fill: 'rgba(111, 66, 193, 0.1)',
                stroke: '#CA8EFF',
                strokeWidth: 1,
                height: 33
            });

            setInterval(function() {
                var random = Math.round(Math.random() * 10);
                var values = dynamicChart.text().split(",");
                values.shift();
                values.push(random);

                dynamicChart
                    .text(values.join(","))
                    .change();
                }, 1000);
            })();
        
        
            (function() {
            /* dynamic example */
            var dynamicChart = $("#peityPurple4").peity("line", {
                width: 150,
                fill: 'rgba(111, 66, 193, 0.1)',
                stroke: '#CA8EFF',
                strokeWidth: 1,
                height: 33
            });

            setInterval(function() {
                var random = Math.round(Math.random() * 10);
                var values = dynamicChart.text().split(",");
                values.shift();
                values.push(random);

                dynamicChart
                    .text(values.join(","))
                    .change();
                }, 1000);
            })();
        
        /**  Init Table / Traffic / Success   **/ 
        
            (function() {
            /* dynamic example */
            var dynamicChart = $("#peitySuccess").peity("line", {
                width: 150,
                fill: 'rgba(41, 183, 60, 0.1)',
                stroke: '#1BB934',
                strokeWidth: 1,
                height: 33
            });

            setInterval(function() {
                var random = Math.round(Math.random() * 10);
                var values = dynamicChart.text().split(",");
                values.shift();
                values.push(random);

                dynamicChart
                    .text(values.join(","))
                    .change();
                }, 1000);
            })();
        
        
            (function() {
            /* dynamic example */
            var dynamicChart = $("#peitySuccess2").peity("line", {
                width: 150,
                fill: 'rgba(41, 183, 60, 0.1)',
                stroke: '#1BB934',
                strokeWidth: 1,
                height: 33
            });

            setInterval(function() {
                var random = Math.round(Math.random() * 10);
                var values = dynamicChart.text().split(",");
                values.shift();
                values.push(random);

                dynamicChart
                    .text(values.join(","))
                    .change();
                }, 1000);
            })();
        
        
            (function() {
            /* dynamic example */
            var dynamicChart = $("#peitySuccess3").peity("line", {
                width: 150,
                fill: 'rgba(41, 183, 60, 0.1)',
                stroke: '#1BB934',
                strokeWidth: 1,
                height: 33
            });

            setInterval(function() {
                var random = Math.round(Math.random() * 10);
                var values = dynamicChart.text().split(",");
                values.shift();
                values.push(random);

                dynamicChart
                    .text(values.join(","))
                    .change();
                }, 1000);
            })();
        
        
            (function() {
            /* dynamic example */
            var dynamicChart = $("#peitySuccess4").peity("line", {
                width: 150,
                fill: 'rgba(41, 183, 60, 0.1)',
                stroke: '#1BB934',
                strokeWidth: 1,
                height: 33
            });

            setInterval(function() {
                var random = Math.round(Math.random() * 10);
                var values = dynamicChart.text().split(",");
                values.shift();
                values.push(random);

                dynamicChart
                    .text(values.join(","))
                    .change();
                }, 1000);
            })();
        
        /**  Init Table / Disk I/O / Yellow   **/ 
        
            (function() {
            /* dynamic example */
            var dynamicChart = $("#peityYellow").peity("line", {
                width: 150,
                fill: 'rgba(255, 198, 59, 0.1)',
                stroke: '#F7BF47',
                strokeWidth: 1,
                height: 33
            });

            setInterval(function() {
                var random = Math.round(Math.random() * 10);
                var values = dynamicChart.text().split(",");
                values.shift();
                values.push(random);

                dynamicChart
                    .text(values.join(","))
                    .change();
                }, 1000);
            })();
        
        
            (function() {
            /* dynamic example */
            var dynamicChart = $("#peityYellow2").peity("line", {
                width: 150,
                fill: 'rgba(255, 198, 59, 0.1)',
                stroke: '#F7BF47',
                strokeWidth: 1,
                height: 33
            });

            setInterval(function() {
                var random = Math.round(Math.random() * 10);
                var values = dynamicChart.text().split(",");
                values.shift();
                values.push(random);

                dynamicChart
                    .text(values.join(","))
                    .change();
                }, 1000);
            })();
        
        
            (function() {
            /* dynamic example */
            var dynamicChart = $("#peityYellow3").peity("line", {
                width: 150,
                fill: 'rgba(255, 198, 59, 0.1)',
                stroke: '#F7BF47',
                strokeWidth: 1,
                height: 33
            });

            setInterval(function() {
                var random = Math.round(Math.random() * 10);
                var values = dynamicChart.text().split(",");
                values.shift();
                values.push(random);

                dynamicChart
                    .text(values.join(","))
                    .change();
                }, 1000);
            })();
        
        
            (function() {
            /* dynamic example */
            var dynamicChart = $("#peityYellow4").peity("line", {
                width: 150,
                fill: 'rgba(255, 198, 59, 0.1)',
                stroke: '#F7BF47',
                strokeWidth: 1,
                height: 33
            });

            setInterval(function() {
                var random = Math.round(Math.random() * 10);
                var values = dynamicChart.text().split(",");
                values.shift();
                values.push(random);

                dynamicChart
                    .text(values.join(","))
                    .change();
                }, 1000);
            })();
        