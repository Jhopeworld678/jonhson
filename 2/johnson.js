var graph = [];
var INF = Infinity;

// Функция для создания ввода графа
function createGraph() {
    var numVertices = parseInt(document.getElementById("numVertices").value);
    var numEdges = parseInt(document.getElementById("numEdges").value);

    var graphInputDiv = document.getElementById("graphInput");
    graphInputDiv.innerHTML = "<h3>Введите рёбра:</h3>";

    // Создание полей ввода для рёбер
    for (var i = 0; i < numEdges; i++) {
        var inputEdge = document.createElement("div");
        inputEdge.innerHTML = "Ребро " + (i + 1) + ": <input type='number' class='start' placeholder='Начальная вершина'> в <input type='number' class='end' placeholder='Конечная вершина'> с весом <input type='number' class='weight' placeholder='Вес'>";
        graphInputDiv.appendChild(inputEdge);
    }
}

// Функция для запуска алгоритма Джонсона
function runJohnson() {
    var startVertices = document.querySelectorAll(".start");
    var endVertices = document.querySelectorAll(".end");
    var weights = document.querySelectorAll(".weight");

    graph = [];
    var edgeSet = new Set();
    var errorDiv = document.getElementById("error");
    errorDiv.innerText = "";

    // Сбор данных о рёбрах из полей ввода
    for (var i = 0; i < startVertices.length; i++) {
        var start = parseInt(startVertices[i].value);
        var end = parseInt(endVertices[i].value);
        var weight = parseInt(weights[i].value);

        if (!isNaN(start) && !isNaN(end) && !isNaN(weight)) {
            var edge = start + "-" + end;
            var reverseEdge = end + "-" + start;

            // Проверка на наличие обратных рёбер
            if (edgeSet.has(reverseEdge)) {
                errorDiv.innerText = "Ошибка: Найдено обратное ребро для " + reverseEdge + ". Пожалуйста, удалите обратные рёбра.";
                return;
            }

            edgeSet.add(edge);
            graph.push({ start: start, end: end, weight: weight });
        }
    }

    var numVertices = parseInt(document.getElementById("numVertices").value);

    // Запуск алгоритма Джонсона
    var result = johnsonAlgorithm(graph, numVertices);

    // Отображение матрицы кратчайших путей
    displayMatrix(result);
}

// Алгоритм Джонсона
function johnsonAlgorithm(graph, numVertices) {
    // Шаг 1: Добавить новую вершину с нулевыми рёбрами ко всем другим вершинам
    var newVertex = numVertices + 1;
    var newEdges = [];
    for (var i = 1; i <= numVertices; i++) {
        newEdges.push({ start: newVertex, end: i, weight: 0 });
    }
    graph = graph.concat(newEdges);

    // Шаг 2: Запустить алгоритм Беллмана-Форда для поиска кратчайших путей от новой вершины
    var distances = bellmanFord(graph, newVertex, numVertices + 1);

    // Проверка на наличие отрицательных циклов
    if (distances === null) {
        document.getElementById("error").innerText = "Ошибка: Обнаружен отрицательный цикл.";
        return null;
    }

    // Шаг 3: Переназначить веса рёбер
    for (var i = 0; i < graph.length; i++) {
        graph[i].weight = graph[i].weight + distances[graph[i].start - 1] - distances[graph[i].end - 1];
    }

    // Удалить добавленные рёбра
    graph = graph.filter(edge => edge.start !== newVertex);

    // Шаг 4: Запустить алгоритм Дейкстры для всех вершин
    var result = [];
    for (var i = 1; i <= numVertices; i++) {
        var shortestPaths = dijkstra(graph, i, numVertices);
        result.push(shortestPaths.map((distance, j) => distance + distances[j] - distances[i - 1]));
    }

    return result;
}

// Алгоритм Беллмана-Форда
function bellmanFord(graph, startVertex, numVertices) {
    var distances = Array(numVertices).fill(INF);
    distances[startVertex - 1] = 0;

    // Релаксация рёбер
    for (var i = 0; i < numVertices - 1; i++) {
        for (var j = 0; j < graph.length; j++) {
            var edge = graph[j];
            if (distances[edge.start - 1] + edge.weight < distances[edge.end - 1]) {
                distances[edge.end - 1] = distances[edge.start - 1] + edge.weight;
            }
        }
    }
    // Проверка на наличие отрицательных циклов
    for (var i = 0; i < numVertices - 1; i++) {
        for (var j = 0; j < graph.length; j++) {
            var edge = graph[j];
            if (distances[edge.start - 1] + edge.weight < distances[edge.end -1]) {
                return null; // Обнаружен отрицательный цикл
            }
        }
    }

    return distances;
}

// Алгоритм Дейкстры
function dijkstra(graph, startVertex, numVertices) {
    var distances = Array(numVertices).fill(INF);
    var visited = Array(numVertices).fill(false);
    distances[startVertex - 1] = 0;

    for (var i = 0; i < numVertices; i++) {
        var minDistance = INF;
        var minIndex = -1;

        // Найти вершину с минимальным расстоянием
        for (var j = 0; j < numVertices; j++) {
            if (!visited[j] && distances[j] < minDistance) {
                minDistance = distances[j];
                minIndex = j;
            }
        }

        if (minIndex === -1) break; // Все вершины посещены

        // Отметить вершину как посещённую
        visited[minIndex] = true;

        // Обновить расстояния для смежных вершин
        for (var k = 0; k < graph.length; k++) {
            var edge = graph[k];
            if (edge.start - 1 === minIndex) {
                var newDistance = distances[minIndex] + edge.weight;
                if (newDistance < distances[edge.end - 1]) {
                    distances[edge.end - 1] = newDistance;
                }
            }
        }
    }

    return distances;
}

// Функция для отображения матрицы кратчайших путей
function displayMatrix(result) {
    if (!result) return;

    var outputDiv = document.getElementById("output");
    outputDiv.innerHTML = "<h2>Матрица кратчайших путей:</h2>";
    var table = "<table border='1'>";

    // Заголовок строки с номерами вершин
    table += "<tr><th></th>";
    for (var i = 0; i < result.length; i++) {
        table += "<th>" + (i + 1) + "</th>";
    }
    table += "</tr>";

    // Тело матрицы
    for (var i = 0; i < result.length; i++) {
        table += "<tr><th>" + (i + 1) + "</th>"; // Заголовок строки с номером вершины
        for (var j = 0; j < result[i].length; j++) {
            table += "<td>" + (result[i][j] === INF ? "INF" : result[i][j]) + "</td>";
        }
        table += "</tr>";
    }
    table += "</table>";
    outputDiv.innerHTML += table;
}