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
  
    edgeInputs.forEach(edgeDiv => {
      const startVertex = parseInt(edgeDiv.querySelector('input[name="startVertex"]').value);
      const endVertex = parseInt(edgeDiv.querySelector('input[name="endVertex"]').value);
      const weight = parseInt(edgeDiv.querySelector('input[name="weight"]').value);
      edges.push({ start: startVertex, end: endVertex, weight });
    });
  
    const results = runJohnsonsAlgorithm(numVertices, edges);
    displayResults(results);
  });
  
  function runJohnsonsAlgorithm(numVertices, edges) {
    const h = new Array(numVertices + 1).fill(Infinity);
    h[numVertices] = 0;
  
    const extendedEdges = edges.slice();
    for (let i = 0; i < numVertices; i++) {
      extendedEdges.push({ start: numVertices, end: i, weight: 0 });
    }
  
    for (let i = 0; i <= numVertices; i++) {
      for (const edge of extendedEdges) {
        if (h[edge.start] + edge.weight < h[edge.end]) {
          h[edge.end] = h[edge.start] + edge.weight;
        }
      }
    }
  
    const reweightedEdges = edges.map(edge => ({
      start: edge.start,
      end: edge.end,
      weight: edge.weight + h[edge.start] - h[edge.end]
    }));
  
    function dijkstra(startVertex) {
      const distances = new Array(numVertices).fill(Infinity);
      distances[startVertex] = 0;
      const priorityQueue = new MinPriorityQueue();
  
      priorityQueue.enqueue(startVertex, 0);
  
      while (!priorityQueue.isEmpty()) {
        const { element: currentVertex, priority: currentDistance } = priorityQueue.dequeue();
  
        for (const edge of reweightedEdges) {
          if (edge.start === currentVertex) {
            const distance = currentDistance + edge.weight;
  
            if (distance < distances[edge.end]) {
              distances[edge.end] = distance;
              priorityQueue.enqueue(edge.end, distance);
            }
          }
        }
      }
  
      return distances;
    }
  
    const shortestPaths = [];
    for (let i = 0; i < numVertices; i++) {
      shortestPaths.push(dijkstra(i).map((dist, j) => dist + h[j] - h[i]));
    }
  
    return shortestPaths;
  }
  
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
  
  function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    
    results.forEach((result, index) => {
      const resultElement = document.createElement('p');
      resultElement.textContent = `Кратчайшие пути из вершины ${index}: ${result.join(', ')}`;
      resultsDiv.appendChild(resultElement);
    });
  }
  