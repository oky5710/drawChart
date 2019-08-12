function propertyValue (object, property, val){
    if(object.hasOwnProperty(property)){
        return object[property];
    } else {
        return val;
    }
}
function getColor (index) {
    var colorPallette = ['#1dd1d1', '#ff4676', '#9c01fe', '#5f61f7', '#167ffc', '#4cd1ee', '#53d86a', '#ffcb2f', '#fe9526', '#ee5252', '#228be6','#22b8cf','#E8743B','#19A979','#ED4A7B','#945ECF','#13A4B4','#525DF4','#BF399E','#6C8893','#5899DA'];
    return colorPallette[index % colorPallette.length];
}
var formatComma = d3.format(',');
function OkyChart() {}
OkyChart.draw = function(option){
    var oh = new ohChart(option);
    return oh;
}

function ohChart(option) {
    this.option = option;
    this.init();
}
ohChart.prototype = {
    init: function(){
        var _this = this;
        this.containerId = _this.option.container;
        this.container = d3.select('#' + this.containerId);
        this.container
            .style('width', _this.option.chartWidth + 'px')
            .style('height', _this.option.chartHeight + 'px');
        this.dataset = _this.option.dataProvider;
        this.categoryField = _this.option.categoryField;
        this.backgroundColor = propertyValue(_this.option, 'backgroundColor', '#ffffff');
        this.graphs = _this.option.graphs;
        this.categoryAxis = _this.option.categoryAxis;
        this.valueAxis = _this.option.valueAxis;
        this.padding = propertyValue(_this.option, 'padding', {top:20, left:20, bottom:20, right:20});
        this.balloon = propertyValue(_this.option, 'balloon', {useBalloon:false});
        this.dataLabel = propertyValue(_this.option, 'dataLabel', {useLabel:false});
        this.legend = propertyValue(_this.option, 'legend', {useLegend:false});
        this.black = '#212529';
        
        if(this.legend.useLegend) {
            this.legend.width = 200;
            this.padding.right += this.legend.width; 
        }
        
        if(this.dataLabel.useLabel){
            this.dataLabel.color = propertyValue (this.dataLabel, 'color', _this.black);
            this.dataLabel.fontSize = propertyValue (this.dataLabel, 'fontSize', 12);
        }
        
        this.width = _this.option.chartWidth - this.padding.left - this.padding.right;
        this.height = _this.option.chartHeight - this.padding.top - this.padding.bottom;
        this.cellWidth = _this.width / _this.dataset.length;
        this.container.selectAll('svg, div').remove();
        this.svg = this.container
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .style('background-color', _this.backgroundColor)
            .attr('version', 1.1)
            .attr('xmlns', 'http://www.w3.org/2000/svg')
        if(this.legend.useLegend) _this.drawLegend();
        if(_this.graphs[0].type !== 'pie'){
            this.xScale = d3.scaleBand()
                .domain(_this.dataset.map(function(d){
                    return d[_this.categoryField];
                }))
                .rangeRound([_this.padding.left, _this.width + _this.padding.left]);
            var yMax = 0;
            this.dataset.forEach(function(data) {
                _this.graphs.forEach(function(graph) {
                   if(yMax < data[graph.valueField]) yMax = Math.ceil(data[graph.valueField]);
                })
            });
            var num = Math.pow(10, yMax.toString().length-1);
            var adjMax = Math.round(yMax/num) * num;
            if(adjMax < yMax) adjMax = adjMax + num/2
            this.yScale = d3.scaleLinear()
                .domain([0, adjMax])
                .range([_this.height + _this.padding.top, _this.padding.top]);
            this.drawCategoryAxis();
            this.drawValueAxis();
        }
        this.isLine = false;
        this.barCount = 0;
        _this.graphs.forEach(function(option){
            if(option.type === 'bar') {
                if(_this.barCount === 0) {
                    _this.multiBarWidth = option.barWidth;
                }
                option.barIndex = _this.barCount;
                _this.barCount++;
            }
        });
        this.graphs.forEach(function(graph,i) {
            if(propertyValue (_this.dataset[0], graph.valueField, false)){
                graph.index = i;
                switch(graph.type){
                    case 'bar':
                        _this.drawBarchart(graph);
                        break;
                    case 'line':
                        _this.isLine = true;
                        _this.drawLineChart(graph);
                        break;
                    case 'pie':
                        _this.drawPieChart(graph);
                }
            } else {
                alert('y축 필드값이 일치하는 데이터가 없습니다. y축 필드값을 수정하거나 추가해주세요.');
                return false;
            }
        });
        this.container.style('position','relative');
        this.updateDownloadURL(document.getElementById('download'));
        if(_this.balloon.useBalloon){
            var graphFill, white;
            if(_this.balloon.ballonColor === 'line') {
                graphFill = 'before';
                white = 'after';
            } else {
                graphFill = 'after';
                white = 'before';
            }
            var addCss = (function (style) {
                var sheet = document.head.appendChild(style).sheet;
                return function (selector, css) {
                    var propText = typeof css === 'string' ? css : Object.keys(css).map(function (p) {
                        return p + ':' + (p === 'content' ? "'" + css[p] + "'" : css[p]);
                    }).join(';');
                    sheet.insertRule(selector + "{" + propText + "}", sheet.cssRules.length);
                };
            })(document.createElement('style'));
            if(_this.graphs[0].type === 'pie'){
                for(var i=0;i<_this.dataset.length;i++){ 
                    addCss('#' + _this.containerId + ' .okychart-balloon.bottom[data-graph-idx="' + i + '"]:' + graphFill, {
                        'border-top': '10px solid ' + getColor(i)
                    });
                    addCss('#' + _this.containerId + ' .okychart-balloon.bottom[data-graph-idx="' + i + '"]:' + white, {
                        'border-top': '10px solid #fff'
                    });
                }
            } else {
                _this.graphs.forEach(function(graph, idx){
                    var balloonColor = (graph.type === 'bar') ? graph.fill : graph.lineColor;
                    addCss('#' + _this.containerId + ' .okychart-balloon.left[data-graph-idx="' + idx + '"]:' + graphFill, {
                        'border-right': '10px solid ' + balloonColor
                    });
                    addCss('#' + _this.containerId + ' .okychart-balloon.right[data-graph-idx="' + idx + '"]:' + graphFill, {
                        'border-left': '10px solid ' + balloonColor
                    });
                    addCss('#' + _this.containerId + ' .okychart-balloon.left[data-graph-idx="' + idx + '"]:' + white, {
                        'border-right': '10px solid #fff'
                    });
                    addCss('#' + _this.containerId + ' .okychart-balloon.right[data-graph-idx="' + idx + '"]:' + white, {
                        'border-left': '10px solid #fff'
                    });
                });
            }
            
            this.svg
                .on('mouseleave',function(){
                    d3.selectAll('.okychart-balloon').remove();
                });
            
            if(_this.isLine){
                this.svg
                    .on('mousemove', function(){
                        var posX = d3.mouse(this)[0];
                        if(posX > _this.padding.left && posX < _this.padding.left + _this.width) _this.moveBalloon(posX);
                    });
            }
        }
    },
    drawCategoryAxis : function(){
        var _this = this;
        var xAxis = d3.axisBottom()
            .scale(_this.xScale)
            .ticks(_this.dataset.length);
        if(propertyValue(_this.categoryAxis, 'dateFormat', false)) {
            _this.timeItv = _this.dataset[1][_this.categoryField].getTime() - _this.dataset[0][_this.categoryField].getTime();
            var xTimeFormat;
            if (_this.timeItv < 60000) { // 초
                xTimeFormat =  d3.timeFormat('%H:%M:%S');
            } else if (_this.timeItv < 3600000) { // 분
                xTimeFormat =  d3.timeFormat('%H:%M');
            } else { // 시간
                xTimeFormat =  d3.timeFormat('%m-%d');
            }
            xAxis.tickFormat(xTimeFormat);
        }
        var gX = _this.svg.append('g')
            .attr('class', 'x axis')
            .attr('transform','translate(0,' + (_this.height + _this.valueAxis.axisThickness/2 + _this.padding.top) + ')')
            .call(xAxis);
        gX.select('path')
            .style('stroke-width', _this.categoryAxis.axisThickness)
            .style('stroke', _this.categoryAxis.axisColor);
        gX.selectAll('line')
            .style('stroke', _this.categoryAxis.axisColor);
        gX.selectAll('text')
            .style('fill', _this.categoryAxis.color)
            .style('font-size', _this.categoryAxis.fontSize);
    },
    drawLegend : function() {
        var _this = this;
        var legendHeight = 16;
        var legendWidth = 20;
        var lineMargin = 10;
        var legendFontSize = 12;
        var legend = _this.svg.append('g')
            .classed('legend', true)
            .attr('transform', 'translate(' + (_this.width + _this.padding.left + 20) + ' ' + _this.padding.top + ')');
        if(_this.graphs[0].type === 'pie') {
            _this.dataset.forEach(function(data, idx){
                var legendText = data[_this.categoryField];
                legend.append('rect')
                    .attr('width', legendWidth)
                    .attr('height', legendHeight)
                    .attr('y', idx * (legendHeight + lineMargin))
                    .style('fill', getColor(idx))
                legend.append('text')
                    .text(legendText)
                    .attr('x', legendWidth + lineMargin)
                    .attr('y', idx * (legendHeight + lineMargin) + legendHeight/2)
                    .style('fill', _this.black)
                    .attr('dy', '.35em')
            });
        } else {
            _this.graphs.forEach(function(graph, idx){
                if(graph.type === 'bar'){
                    legend.append('rect')
                        .attr('width', legendWidth)
                        .attr('height', legendHeight)
                        .attr('y', idx * (legendHeight + lineMargin))
                        .style('fill', graph.fill)
                } else if(graph.type === 'line') {
                    legend.append('line')
                        .attr('x1', 0)
                        .attr('x2', legendWidth)
                        .attr('y1', idx * (legendHeight + lineMargin) + legendHeight/2)
                        .attr('y2', idx * (legendHeight + lineMargin) + legendHeight/2)
                        .style('stroke', graph.lineColor)
                        .style('stroke-width', graph.lineWidth)
                    switch(graph.bullet){
                        case 'circle':
                            legend.append('circle')
                                .attr('cx', legendWidth/2)
                                .attr('cy', idx * (legendHeight + lineMargin) + legendHeight/2)
                                .attr('r', graph.bulletSize/2)
                                .style('fill', graph.lineColor)
                            break;
                        case 'square':
                            legend.append('rect')
                                .attr('width', graph.bulletSize)
                                .attr('height', graph.bulletSize)
                                .attr('x', legendWidth/2 - graph.bulletSize/2)
                                .attr('y', idx * (legendHeight + lineMargin) + legendHeight/2 - graph.bulletSize/2)
                                .style('fill', graph.lineColor)
                            break;
                        case 'triangle':
                            legend.append('path')
                                .attr('d', _this.polarToCartesian(legendWidth/2, idx * (legendHeight + lineMargin) + legendHeight/2, graph.bulletSize*0.8, 3))
                                .style('fill', graph.lineColor);
                            break;
                        case 'diamond':
                            legend.append('path')
                                .attr('d', _this.polarToCartesian(legendWidth/2, idx * (legendHeight + lineMargin) + legendHeight/2, graph.bulletSize*0.8, 4))
                                .style('fill', graph.lineColor);    
                            break;
                    }
                }
                legend.append('text')
                    .text(graph.title)
                    .attr('x', legendWidth + 10)
                    .attr('y', idx * (legendHeight + lineMargin) + legendHeight/2)
                    .style('fill', _this.black)
                    .attr('dy', '.35em')
            });
            
        }
    },
    drawValueAxis : function(){
        var _this = this;
        if(_this.valueAxis.grid){
            var grid = d3.axisLeft(_this.yScale)
                .ticks()
            _this.svg.append('g')			
                .attr('class', 'y-grid')
                .call(grid
                  .tickSize(-_this.width)
                  .tickFormat('')
                );
            _this.svg.select('.y-grid')
                .attr('transform','translate('+_this.padding.left+',0)')
            _this.svg.selectAll('.y-grid .domain, .y-grid g:first-of-type')
                .attr('opacity',0);
            _this.svg.selectAll('.y-grid .tick line')
                .style('stroke', _this.valueAxis.gridColor)
                .style('stroke-width', _this.valueAxis.gridThickness);
        }
        var yAxis = d3.axisLeft()
            .scale(_this.yScale);
        var gY = _this.svg.append('g')
            .attr('class', 'y axis')
            .attr('transform','translate(' + (_this.padding.left) + ',0)')
            .call(yAxis);
        gY.select('path')
            .style('stroke-width', _this.valueAxis.axisThickness)
            .style('stroke', _this.valueAxis.axisColor);
        gY.selectAll('line')
            .style('stroke', _this.valueAxis.axisColor);
        gY.selectAll('text')
            .style('fill', _this.valueAxis.color)
            .style('font-size', _this.valueAxis.fontSize);
    },
    moveBalloon : function(posX){
        var _this = this;        
        var index = Math.floor((posX - _this.padding.left)/(_this.width/_this.dataset.length));
        var data = _this.dataset[index];
        var balloons = [];
        var balloonHeight = _this.balloon.fontSize * 1.3  + 12;
        _this.graphs.forEach(function(graph){
            var balloonTxt = formatComma(data[graph.valueField]);
            balloons.push({
                index: graph.index,
                top: _this.yScale(data[graph.valueField]) - balloonHeight/2
            });
            if(graph.title) balloonTxt = graph.title + ': ' + balloonTxt;
            var balloon;
            if(_this.container.select('.balloon-'+graph.valueField).size()){
                balloon = _this.container.select('.balloon-'+graph.valueField);
            } else {
                balloon = _this.container.append('div').classed('balloon-'+graph.valueField, true);
            }
            balloon
                .attr('data-graph-idx', graph.index)
                .text(balloonTxt)
                .classed('balloon-'+graph.valueField, true)
                .classed('okychart-balloon', true)
                .style('font-size',_this.balloon.fontSize + 'px')
                .style('color', _this.balloon.color);
            var balloonColor = (graph.type === 'bar')? graph.fill : graph.lineColor;
            if(_this.balloon.ballonColor === 'background') {
                balloon
                   .style('border', '1px solid #fff')
                   .style('background-color', balloonColor);
            } else {
                balloon
                   .style('border', '1px' + ' solid ' + balloonColor)
                   .style('background-color','#fff');
            }
            
            var left = _this.xScale(data[_this.categoryField]) + _this.cellWidth/2;
            var barWidth = 1;
            if(graph.type === 'bar' && _this.barCount > 1){
                barWidth = _this.cellWidth * _this.multiBarWidth / _this.barCount;
                left = _this.xScale(data[_this.categoryField]) + _this.cellWidth*(1 - _this.multiBarWidth)/2 + barWidth * graph.barIndex + barWidth/2; 
            }
            
            
            if(index > _this.dataset.length/2){
                balloon
                    .classed('right', true)
                    .classed('left', false)
                    .style('right', (_this.width + _this.padding.left + _this.padding.right - left) + 'px')
                    .style('left', 'auto');
            } else {
                balloon
                    .classed('left', true)
                    .classed('right', false)
                    .style('left', left + 'px')
                    .style('right', 'auto');
            }
        });
        balloons.sort(function (a, b) { 
            return a.top < b.top ? -1 : a.top > b.top ? 1 : 0;
        });
        balloons.forEach(function(balloonObj, i) {
            var top;
            var valueField = _this.graphs[balloonObj.index].valueField;
            if(i > 0 && balloonObj.top - balloons[i - 1].top < balloonHeight) {
                top = balloons[i - 1].top + balloonHeight;
                balloonObj.top = top;
            } else {
                top = _this.yScale(data[valueField]) - balloonHeight/2;
            }
            _this.container.select('.balloon-' + valueField)
                .style('top', top + 'px');
        });

    },
    overBalloon : function(data,graph,index){
        var _this = this;
        if(!_this.container.select('.okychart-balloon').size()){
            _this.container
                .append('div')
                .classed('okychart-balloon', true);
        }
        var balloon = _this.container.select('.okychart-balloon');
        var balloonTxt = formatComma(data[graph.valueField]);
        if(graph.title) balloonTxt = graph.title + ': ' + balloonTxt;
        balloon
            .html(balloonTxt)
            .attr('data-graph-idx', graph.index)
            .style('top', (_this.yScale(data[graph.valueField]/2) - (_this.balloon.fontSize * 1.3 / 2 + 5)) + 'px')
            .style('font-size', _this.balloon.fontSize + 'px')
            .style('color', _this.balloon.color);
        if(_this.balloon.ballonColor === 'background') {
            balloon
               .style('border', '1px solid #fff')
               .style('background-color', graph.fill);
        } else {
            balloon
               .style('border', '1px' + ' solid ' + graph.fill)
               .style('background-color','#fff');
        }
    
        var left;
        var barWidth = 1;
        if(_this.barCount > 1){
            barWidth = _this.cellWidth * _this.multiBarWidth / _this.barCount;
            left = _this.xScale(data[_this.categoryField]) + _this.cellWidth*(1-_this.multiBarWidth)/2 + barWidth * graph.index + barWidth/2;
        } else {
            barWidth = _this.cellWidth * graph.barWidth;
            left = _this.xScale(data[_this.categoryField]) + _this.cellWidth/2;
        }
        if(index > _this.dataset.length/2){
            balloon
                .classed('right', true)
                .classed('left', false)
                .style('right', (_this.width + _this.padding.left + _this.padding.right - left) + 'px')
                .style('left', 'auto');
        } else {
            balloon
                .classed('left', true)
                .classed('right', false)
                .style('left', left + 'px')
                .style('right', 'auto');
        }   
    },
    addDataLabel: function (graph, chart){
        var _this = this;
        var barWidth = 1;
        if(_this.barCount > 1){
            barWidth = _this.cellWidth * _this.multiBarWidth / _this.barCount;
        } else {
            barWidth = _this.cellWidth * graph.barWidth;
        }
        chart.selectAll('text')
            .data(_this.dataset)
            .enter() 
            .append('text')
            .text(function(d,i){
                return formatComma(d[graph.valueField]);
            })
            .attr('x', function(d,i){
                if(graph.type === 'bar' && _this.barCount > 1) {
                    return _this.xScale(d[_this.categoryField]) + _this.cellWidth*(1-_this.multiBarWidth)/2 + barWidth * graph.barIndex + barWidth/2;
                } else {
                    return _this.xScale(d[_this.categoryField]) + _this.cellWidth/2;
                }
            })
            .attr('y', function(d,i){
                var y = _this.yScale(d[graph.valueField]);
                if(graph.type === 'bar') y -= 8;
                else if (graph.type === 'line' && propertyValue (graph, 'bulletSize', false)) y -= graph.bulletSize;
                return  y;
            })
            .style('text-anchor','middle')
            .style('font-size', _this.dataLabel.fontSize)
            .style('fill', _this.dataLabel.color)
    },
    drawPieChart : function(graph){
        var _this = this;
        var radius = Math.min(_this.width, _this.height)/2;
        var arc = d3.arc()
            .outerRadius(radius)
            .innerRadius(radius * graph.innerRadius);

        var pie = d3.pie()
            .sort(null)
            .value(function(d) { return d[graph.valueField]; });
        
        var g = _this.svg.selectAll('.arc')
            .data(pie(_this.dataset))
            .enter().append('g')
            .attr('class', 'arc')
            .attr('transform', 'translate(' + (_this.width/2 + _this.padding.left) + ',' + (_this.height/2 + _this.padding.top) + ')');
        var piece = g.append('path')
            .attr('d', arc)
            .style('fill', function(d,i) { return getColor(i); });
        
        if(_this.balloon.useBalloon){
            piece.on('mouseover', function(d,i){
                if(!_this.container.select('.okychart-balloon').size()){
                    _this.container
                        .append('div')
                        .classed('okychart-balloon', true)
                        .classed('bottom', true);
                }
                var balloon = _this.container.select('.okychart-balloon').attr('data-graph-idx', i);
                balloon
                    .html(d.data[_this.categoryField] + ': <strong>' + formatComma(d.data[graph.valueField]) + '</strong>' )
                    .style('font-size', _this.balloon.fontSize + 'px')
                    .style('color', _this.balloon.color);
                var balloonHeight = _this.balloon.fontSize * 1.3  + 12;   
                var balloonWidth = document.querySelector('.okychart-balloon').offsetWidth;
                balloon
                    .style('top', (arc.centroid(d)[1] + _this.height/2 + _this.padding.top - balloonHeight - 10)  + 'px')
                    .style('left', (arc.centroid(d)[0] + _this.width/2 + _this.padding.left - balloonWidth/2) + 'px')        
                if(_this.balloon.ballonColor === 'background') {
                    balloon
                       .style('border', '1px solid #fff')
                       .style('background-color', getColor(i));
                } else {
                    balloon
                       .style('border', '1px' + ' solid ' + getColor(i))
                       .style('background-color','#fff');
                }
            })
            .on('mouseout', function(){
                _this.container.select('.okychart-balloon').remove();
            });
        }

        if(graph.pieGap > 0){
            piece
                .attr('stroke-width', graph.pieGap)
                .attr('stroke',_this.backgroundColor);
        }
        if(_this.dataLabel.useLabel){
            var dataLabels = _this.svg.append('g')
                .classed('.data-label', true)
                .attr('transform', 'translate(' + (_this.width/2 + _this.padding.left) + ',' + (_this.height/2 + _this.padding.top) + ')');
            dataLabels
                .selectAll('text')
                .data(pie(_this.dataset))
                .enter().append('text')
                .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; })
                .attr('dy', '.35em')
                .text(function(d) { return d.data[_this.categoryField] + ': ' + formatComma(d.data[graph.valueField]); })
                .attr('text-anchor', 'middle')
                .style('fill', _this.dataLabel.color)
                .style('font-size', _this.dataLabel.fontSize);
        }
    },
    drawBarchart : function(graph){
        var _this = this;
        var bar = _this.svg.insert('g', '.oky-line-area').classed('oky-bar-area',true);
        var barWidth = 1;
        if(_this.barCount > 1){
            barWidth = _this.cellWidth * _this.graphs[0].barWidth / _this.barCount;
        } else {
            barWidth = _this.cellWidth * graph.barWidth;
        }

        bar.selectAll('rect')
            .data(_this.dataset)
            .enter()
            .append('rect')
            .attr('width', barWidth)
            .attr('height', function(d,i){
                return _this.height - _this.yScale(d[graph.valueField]) + _this.padding.top;
            })
            .attr('x', function(d,i){
                if(_this.barCount === 1) {
                    return _this.xScale(d[_this.categoryField]) + _this.cellWidth * (1 - graph.barWidth)/2;
                } else {
                    return _this.xScale(d[_this.categoryField]) + _this.cellWidth * (1 - _this.graphs[0].barWidth)/2 + barWidth * graph.barIndex ;
                }
            })
            .attr('y', function(d,i){return _this.yScale(d[graph.valueField])})
            .style('fill', graph.fill)
            .on('mouseover', function(d,i){
                if(_this.balloon.useBalloon && !_this.isLine) _this.overBalloon(d,graph,i);
            });
        if(_this.dataLabel.useLabel) _this.addDataLabel(graph, bar);
    },
    drawLineChart: function (graph) {
        var _this = this;
        var cellWidth = _this.width/_this.dataset.length;
        var valueline = d3.line()
		    .x(function(d) { return _this.xScale(d[_this.categoryField]) + cellWidth/2; })
		    .y(function(d) { return _this.yScale(d[graph.valueField]); });
        var line = _this.svg.append('g').classed('oky-line-area', true);
        
		line.append('path')
			.datum(_this.dataset)
		    .attr('d', valueline)
		    .attr('fill', 'none')
		    .attr('stroke', graph.lineColor)
		    .attr('stroke-width', graph.lineWidth)
       
		if(propertyValue(graph, 'bullet', false) && graph.bullet !== 'none'){
             var bulletG = line.append('g').classed('bullet-' + graph.bullet, true)
            graph.bulletSize = propertyValue(graph, 'bulletSize', 8);
            switch(graph.bullet){
                case 'circle':
                    bulletG.selectAll('circle')
                        .data(_this.dataset)
                        .enter()
                        .append('circle')
                        .attr('cx', function(d) { return _this.xScale(d[_this.categoryField]) + cellWidth/2; })
                        .attr('cy', function(d) { return _this.yScale(d[graph.valueField]); })
                        .attr('r', graph.bulletSize/2)
                        .style('fill', graph.lineColor);
                    break;
                case 'square':
                    bulletG.selectAll('rect')
                        .data(_this.dataset)
                        .enter()
                        .append('rect')
                        .attr('x', function(d) { return _this.xScale(d[_this.categoryField]) + cellWidth/2 - graph.bulletSize/2; })
                        .attr('y', function(d) { return _this.yScale(d[graph.valueField]) - graph.bulletSize/2; })
                        .attr('width', graph.bulletSize)
                        .attr('height', graph.bulletSize)
                        .style('fill', graph.lineColor);
                    if (graph.bullet === 'diamond') {
                        bulletG.selectAll('rect')
                            .style('transform', 'rotate(45deg)')
                            //.style('transform-origin','0 0');
                    }
                    break;
                case 'triangle':
                    bulletG.selectAll('path')
                        .data(_this.dataset)
                        .enter()
                        .append('path')
                        .attr('d', function(d) { 
                            return _this.polarToCartesian(_this.xScale(d[_this.categoryField]) + cellWidth/2,_this.yScale(d[graph.valueField]), graph.bulletSize*0.8, 3);
                        })
                        .style('fill', graph.lineColor);
                    break;
                case 'diamond':
                    bulletG.selectAll('path')
                        .data(_this.dataset)
                        .enter()
                        .append('path')
                        .attr('d', function(d) {
                            return _this.polarToCartesian(_this.xScale(d[_this.categoryField]) + cellWidth/2,_this.yScale(d[graph.valueField]), graph.bulletSize*0.8, 4); 
                        })
                        .style('fill', graph.lineColor);
                    break;
            }
        }
        if(_this.dataLabel.useLabel) _this.addDataLabel(graph, line);
    },
    polarToCartesian : function (centerX, centerY, radius, cnt) {
        var angle = 360/cnt;
        var path;
        for(var i=0; i < 360; i += angle){
            var angleInRadians = ((i - 90) * Math.PI) / 180.0;
            if(i === 0) path = 'M';
            else path += ' L';
            path += (centerX + (radius * Math.cos(angleInRadians))) + ' ' + (centerY + (radius * Math.sin(angleInRadians)));
        }
        path += ' Z';
		return path;
	},
    getDownloadURL: function (callback) {
        var _this = this;
        var svg = document.getElementById(_this.containerId).querySelector('svg');
        var canvas;
        var source = svg.parentNode.innerHTML;
        var imgWidth = _this.width + _this.padding.left + _this.padding.right;
        var imgHeight = _this.height + _this.padding.top + _this.padding.bottom;
        var image = d3.select('body').append('img')
            .style('display', 'none')
            .attr('width', imgWidth)
            .attr('height', imgHeight)
            .node();

        image.onerror = function() {
            callback(new Error('An error occurred while attempting to load SVG'));
        };
        image.onload = function() {
            canvas = d3.select('body').append('canvas')
                .style('display', 'none')
                .attr('width', imgWidth)
                .attr('height', imgHeight)
                .node();

            var ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            var url = canvas.toDataURL('image/png');

            d3.selectAll([ canvas, image ]).remove();

            callback(null, url);
        };
        image.src = 'data:image/svg+xml,' + encodeURIComponent(source);
    },
    updateDownloadURL: function (link) {
        this.getDownloadURL(function(error, url) {
            if (error) {
                console.error(error);
            } else {
                link.href = url;
            }
        });
    }
};