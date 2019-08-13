<h1>DrawChart</h1>
<ul>
    <li>Bar chart, Line chart, Pie chart를 구현할 수 있는 JavaScript library</li>
    <li><a href="http://oky5710.dothome.co.kr/">chart editor</a> 제공</li>
</ul>
<h2>1. 사용 방법</h2>
<p>먼저 <a href="http://oky5710.dothome.co.kr/js/d3.v4.min.js">d3.v4.min.js</a>와 <a href="http://oky5710.dothome.co.kr/js/okyChart.js">okyChart.js</a>, <a href="http://oky5710.dothome.co.kr/css/okyChart.css">okyChart.css</a>(툴팁용 CSS)를 다운(<a href="http://oky5710.dothome.co.kr/drawChart.zip">전체 download</a>) 받아 사이트에 추가한다.</p>
<pre><link rel="stylesheet" href="/css/okyChart.css">
<script src="/js/d3.v4.min.js"></script> 
<script src="/js/okyChart.js"></script></pre>
<p>차트를 추가할 위치에 div를 아래와 같이 추가한다.</p>
<pre>&lt;div id="divId"&gt;&lt;/div&gt;</pre>
<p>아래 예시와 같이 OkyChart.draw(option)으로 차트 그리기를 실행한다. option의 세부 내용은 <a href="#chartOptions">Chart options</a>을 참고하여 작성하거나 <a href="http://oky5710.dothome.co.kr/index.html">차트 만들기</a>에서 필요한 옵션을 선택한 후 소스를 복사하여 사용한다.</p>
<pre>
OkyChart.draw({
    "container": "divId",
    "dataProvider": [{"year": 2018, "value": 286}...],
    "categoryField": "year",
    "chartWidth": 800,
    "chartHeight": 500,
    "backgroundColor": "#ffffff",
    "padding": {
        "left": 30,
        "bottom": 30
    },
    "graphs": [{
        "type": "bar",
        "valueField": "value",
        "barWidth": 0.5,
        "fill": "#228be6",
        "barIndex": 0
    }],
    "valueAxis": {
        "axisColor": "#868e96",
        "axisThickness": 1,
        "color": "#212529",
    },
    "categoryAxis": {
        "axisColor": "#868e96",
        "axisThickness": 1,
        "color": "#212529",
    }
})  
</pre>  
    <h2 id="chartOptions">2. Chart options</h2>
    <table>
        <thead>
            <tr>
                <th scope="row" colspan="2">속성</th>
                <th scope="row">유형</th>
                <th scope="row">기본값</th>
                <th scope="row">설명</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td colspan="2">container</td>
                <td>String</td>
                <td>-</td>
                <td>차트가 들어가는 tag의 id</td>
            </tr>
            <tr>
                <td colspan="2">dataProvider</td>
                <td>Array</td>
                <td>-</td>
                <td>입력할 데이터 배열<br>
                    예) [{ year: 2018, income: 6589 }, { year: 2019, income: 45111}]
                </td>
            </tr>
            <tr>
                <td colspan="2">categoryField</td>
                <td>String</td>
                <td>-</td>
                <td>X축의 필드값</td>
            </tr>
            <tr>
                <td colspan="2">chartWidth</td>
                <td>Number</td>
                <td>-</td>
                <td>차트의 전체 넓이</td>
            </tr>
            <tr>
                <td colspan="2">chartHeight</td>
                <td>Number</td>
                <td>-</td>
                <td>차트의 전체 높이</td>
            </tr>
            <tr>
                <td colspan="2">backgroundColor</td>
                <td>Color</td>
                <td>#ffffff</td>
                <td>차트 바탕색</td>
            </tr>
            <tr>
                <td rowspan="2">graphs</td>
                <td>type</td>
                <td>String</td>
                <td>-</td>
                <td>차트 유형 bar, line, pie</td>
            </tr>
            <tr>
                <td>valueField</td>
                <td>String</td>
                <td>-</td>
                <td>Y축의 필드값</td>
            </tr>
            <tr>
                <td class="gray" rowspan="2">바차트</td>
                <td>fill</td>
                <td>Color</td>
                <td>#228be6</td>
                <td>바의 색, 라인/파이차트 채우기 색</td>
            </tr>
            <tr>
                <td>barWidth</td>
                <td>Number</td>
                <td>0.5</td>
                <td>바의 비율 0~1 사이</td>
            </tr>
            <tr>
                <td class="gray" rowspan="4">라인차트</td>
                <td>lineColor</td>
                <td>Color</td>
                <td>#228be6</td>
                <td>라인 차트의 선 색</td>
            </tr>
            <tr>
                <td>lineWidth</td>
                <td>Number</td>
                <td>2</td>
                <td>라인 차트의 선 두께</td>
            </tr>
            <tr>
                <td>bullet</td>
                <td>String</td>
                <td>none</td>
                <td>값 표시 블릿 모양</td>
            </tr>
            <tr>
                <td>bulletSize</td>
                <td>Number</td>
                <td>8</td>
                <td>블릿의 크기</td>
            </tr>
            <tr>
                <td class="gray" rowspan="2">파이차트</td>
                <td>innerRadius</td>
                <td>Number</td>
                <td>0.5</td>
                <td>내부 반지름</td>
            </tr>
            <tr>
                <td>pieGap</td>
                <td>Number</td>
                <td>0</td>
                <td>조각 사이의 간격</td>
            </tr>
            <tr>
                <td rowspan="3">dataLabel</td>
                <td>useLabel</td>
                <td>Boolean</td>
                <td>false</td>
                <td>true 면 데이터 값 표시</td>
            </tr>
            <tr>
                <td>fontSize</td>
                <td>Number</td>
                <td>12</td>
                <td>데이터 라벨의 글자 크기</td>
            </tr>
            <tr>
                <td>color</td>
                <td>Color</td>
                <td>#212529</td>
                <td>데이터 라벨 글자 색</td>
            </tr>
            <tr>
                <td rowspan="4">padding</td>
                <td>top</td>
                <td>Number</td>
                <td>-</td>
                <td>상단 여백</td>
            </tr>
            <tr>
                <td>bottom</td>
                <td>Number</td>
                <td>-</td>
                <td>하단 여백</td>
            </tr>
            <tr>
                <td>left</td>
                <td>Number</td>
                <td>-</td>
                <td>좌측 여백</td>
            </tr>
            <tr>
                <td>right</td>
                <td>Number</td>
                <td>-</td>
                <td>우측 여백</td>
            </tr>
            <tr>
                <td rowspan="4">categoryAxis</td>
                <td>axisColor</td>
                <td>Color</td>
                <td>#212529</td>
                <td>X축의 선 색</td>
            </tr>
            <tr>
                <td>axisThickness</td>
                <td>Number</td>
                <td>2</td>
                <td>X축의 선 두께</td>
            </tr>
            <tr>
                <td>color</td>
                <td>Color</td>
                <td>#212529</td>
                <td>X축 라벨 글자색</td>
            </tr>
            <tr>
                <td>fontSize</td>
                <td>Number</td>
                <td>12</td>
                <td>X축 라벨 글자 크기</td>
            </tr>
            <tr>
                <td rowspan="7">valueAxis</td>
                <td>axisColor</td>
                <td>Color</td>
                <td>#212529</td>
                <td>Y축의 선 색</td>
            </tr>
            <tr>
                <td>axisThickness</td>
                <td>Number</td>
                <td>2</td>
                <td>Y축의 선 두께</td>
            </tr>
            <tr>
                <td>color</td>
                <td>Color</td>
                <td>#212529</td>
                <td>Y축 라벨 글자색</td>
            </tr>
            <tr>
                <td>fontSize</td>
                <td>Number</td>
                <td>12</td>
                <td>Y축 라벨 글자 크기</td>
            </tr>
            <tr>
                <td>grid</td>
                <td>Boolean</td>
                <td>true</td>
                <td>grid 사용 여부</td>
            </tr>
            <tr>
                <td>gridThickness</td>
                <td>Number</td>
                <td>1</td>
                <td>grid의 선 두께</td>
            </tr>
            <tr>
                <td>gridColor</td>
                <td>Color</td>
                <td>#ced4da</td>
                <td>grid의 선 색</td>
            </tr>
            <tr>
                <td rowspan="5">balloon</td>
                <td>useBalloon</td>
                <td>Boolean</td>
                <td>false</td>
                <td>balloon의 추가 여부</td>
            </tr>
            <tr>
                <td>lineWidth</td>
                <td>Number</td>
                <td>2</td>
                <td>balloon 테두리 선 두께</td>
            </tr>
            <tr>
                <td>fontSize</td>
                <td>Number</td>
                <td>12</td>
                <td>balloon 글씨 크기</td>
            </tr>
            <tr>
                <td>color</td>
                <td>Color</td>
                <td>#212529</td>
                <td>balloon 글씨 색</td>
            </tr>
            <tr>
                <td>ballonColor</td>
                <td>String</td>
                <td>line</td>
                <td>background : 바탕색이 graphs, line: 테두리 선 색이 graphs 색</td>
            </tr>
            <tr>
                <td>legend</td>
                <td>useLegend</td>
                <td>Boolean</td>
                <td>false</td>
                <td>범례 사용 여부 선택</td>
            </tr>
        </tbody>
    </table>
    
<h2>3. 사용 예</h2>
<ul>
    <li><a href="https://codepen.io/oky5710/pen/BXwrJp" target="_blank">Bar chart</a></li>
    <li><a href="https://codepen.io/oky5710/pen/xvXWQo" target="_blank">Line chart</a></li>
    <li><a href="https://codepen.io/oky5710/pen/dxVmaY" target="_blank">Bar & Line chart</a></li>
    <li><a href="https://codepen.io/oky5710/pen/JgrLzP" target="_blank">Pie chart</a></li>
</ul>
