document.getElementById('initialForm').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const numVertices = parseInt(document.getElementById('numVertices').value);
  const numEdges = parseInt(document.getElementById('numEdges').value);
  const edgesContainer = document.getElementById('edgesContainer');
  
  // Очищаем контейнер для рёбер
  edgesContainer.innerHTML = '';
  
  for (let i = 0; i < numEdges; i++) {
    const edgeDiv = document.createElement('div');
    edgeDiv.className = 'edge-input';
    edgeDiv.innerHTML = `
      <label>Ребро ${i + 1}:</label>
      <input type="number" name="startVertex" placeholder="Начальная вершина" min="0" max="${numVertices - 1}" required>
      <input type="number" name="endVertex" placeholder="Конечная вершина" min="0" max="${numVertices - 1}" required>
      <input type="number" name="weight" placeholder="Вес" required>
    `;
    edgesContainer.appendChild(edgeDiv);
  }
  
  document.getElementById('initialForm').style.display = 'none';
  document.getElementById('edgesForm').style.display = 'block';
});

document.getElementById('edgesForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const numVertices = parseInt(document.getElementById('numVertices').value);
  const edgeInputs = document.querySelectorAll('.edge-input');
  const edges = [];

  // Получаем значения из всех полей ввода для рёбер и добавляем их в массив рёбер
  edgeInputs.forEach((edgeDiv, index) => {
    const startVertex = parseInt(edgeDiv.querySelector('input[name="startVertex"]').value);
    const endVertex = parseInt(edgeDiv.querySelector('input[name="endVertex"]').value);
    const weight = parseInt(edgeDiv.querySelector('input[name="weight"]').value);
    edges.push({ start: startVertex, end: endVertex, weight });
    console.log(`Ребро ${index + 1}: Начальная вершина: ${startVertex}, Конечная вершина: ${endVertex}, Вес: ${weight}`);
  });

  // Запускаем алгоритм Джонсона и отображаем результаты
  const results = runJohnsonsAlgorithm(numVertices, edges);
  displayResults(results);
});




function runJohnsonsAlgorithm(numVertices, edges) {
  // Инициализация расстояний
  
  const dist = Array(numVertices + 1).fill(Infinity);
  dist[numVertices] = 0;
  var messages = [];
  var counter_bf = 0;
  var counter_d = 0;
  // Добавляем дополнительную вершину (numVertices) и соединяем её с каждой другой вершиной с весом 0
  for (let i = 0; i < numVertices; i++) {
    edges.push({ start: numVertices, end: i, weight: 0 });
  }

  // Запускаем Bellman-Ford из дополнительной вершины, чтобы обнаружить отрицательные циклы
  for (let i = 0; i <= numVertices; i++) {
    for (let j = 0; j < edges.length; j++) {
      counter_bf++;
      const { start, end, weight } = edges[j];
      if (dist[start] + weight < dist[end]) {
        dist[end] = dist[start] + weight;
      } 
    } 
    //messages.push(`Шаг ${i + 1} алгоритма Беллмана-Форда: ${dist}`)
    console.log(`Шаг ${i + 1} алгоритма Беллмана-Форда: ${dist}`);
  }

  // Проверяем на отрицательные циклы
  for (let j = 0; j < edges.length; j++) {
    const { start, end, weight } = edges[j];
    if (dist[start] + weight < dist[end]) {
      console.log("Граф содержит отрицательные циклы");
      messages.push("Граф содержит отрицательные циклы");
      return { message: messages, matrix: null };
    }
  }

  // Удаляем дополнительную вершину и её рёбра
  edges = edges.slice(0, edges.length - numVertices);

  // Пересчитываем веса рёбер
  const h = dist.slice(0, numVertices);
  for (let i = 0; i < edges.length; i++) {
    const { start, end, weight } = edges[i];
    edges[i].weight = weight + h[start] - h[end];
  }
  console.log("Пересчитанные веса рёбер:", edges);

  // Инициализация матрицы результатов
  const result = Array.from({ length: numVertices }, () => Array(numVertices).fill(Infinity));

  // Запускаем алгоритм Дейкстры для каждой вершины
  for (let u = 0; u <numVertices; u++) {
    const dist = Array(numVertices).fill(Infinity);
    dist[u] = 0;
    const pq = new MinPriorityQueue({ priority: x => x.dist });
    pq.enqueue({ vertex: u, dist: 0 });

    while (!pq.isEmpty()) {
      const { element: { vertex, dist: d } } = pq.dequeue();

      if (d > dist[vertex]) continue;

      for (const { start, end, weight } of edges) {
        counter_d++;
        if (start === vertex && dist[end] > dist[start] + weight) {
          dist[end] = dist[start] + weight;
          pq.enqueue({ vertex: end, dist: dist[end] });
        }
      }
      console.log(`Алгоритм Дейкстры для вершины ${u}: ${dist}`);
    }
    // Записываем результаты с учетом пересчитанных весов
    for (let v = 0; v < numVertices; v++) {
      if (dist[v] < Infinity) {
        result[u][v] = dist[v] - h[u] + h[v];
      }
    }
  }
  console.log("Счетчик циклов БФ: ", counter_bf);
  console.log("Счетчик циклов Дейкстры: ", counter_d);
  console.log("Результаты:", result);

  messages.push("Кратчайшие пути рассчитаны успешно:");
  return { message: messages, matrix: result };
}

// Класс для приоритетной очереди (минимальная приоритетная очередь)
class MinPriorityQueue {
  constructor() {
    this.heap = [];
  }
 
  enqueue(element, priority) {
    this.heap.push({ element, priority });
    this.heapifyUp();
  }
 
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }

    const item = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.heapifyDown();
    }

    return item;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  heapifyUp() {
    let index = this.heap.length - 1;
    const element = this.heap[index];

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];

      if (element.priority >= parent.priority) break;

      this.heap[index] = parent;
      index = parentIndex;
    }

    this.heap[index] = element;
  }

  heapifyDown() {
    let index = 0;
    const length = this.heap.length;
    const element = this.heap[index];

    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let leftChild, rightChild;
      let swapIndex = null;

      if (leftChildIndex < length) {
        leftChild = this.heap[leftChildIndex];
        if (leftChild.priority < element.priority) {
          swapIndex = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        rightChild = this.heap[rightChildIndex];
        if (
          (swapIndex === null && rightChild.priority < element.priority) ||
          (swapIndex !== null && rightChild.priority < leftChild.priority)
        ) {
          swapIndex = rightChildIndex;
        }
      }
 
      if (swapIndex === null) break;

      this.heap[index] = this.heap[swapIndex];
      index = swapIndex;
    }

    this.heap[index] = element;
  }
}

// Функция для отображения результатов
function displayResults(results) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (Array.isArray(results.message)) {
    results.message.forEach(msg => {
      const messageParagraph = document.createElement('p');
      messageParagraph.textContent = msg;
      resultsDiv.appendChild(messageParagraph);
    });
  } else {
    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = results.message;
    resultsDiv.appendChild(messageParagraph);
  }

  if (results.matrix) {
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const headerCell = document.createElement('th');
    headerCell.textContent = 'Вершина';
    headerRow.appendChild(headerCell);

    for (let i = 0; i < results.matrix.length; i++) {
      const headerCell = document.createElement('th');
      headerCell.textContent = `В ${i}`;
      headerRow.appendChild(headerCell);
    }
    table.appendChild(headerRow);

    results.matrix.forEach((result, index) => {
      const row = document.createElement('tr');
      const rowHeader = document.createElement('td');
      rowHeader.textContent = `Из ${index}`;
      row.appendChild(rowHeader); 

      result.forEach(dist => {
        const cell = document.createElement('td');
        cell.textContent = dist === Infinity ? 'INF' : dist;
        row.appendChild(cell);
      });

      table.appendChild(row);
    });

    resultsDiv.appendChild(table);
  }
}
