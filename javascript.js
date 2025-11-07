const $ = id => document.getElementById(id);

let arr = [], history = [], stateIndex = -1, autoTimer = null;

// Generate a sorted random array
function genArray(n) {
  let out = [], x = Math.floor(Math.random() * 5) + 1;
  for (let i = 0; i < n; i++) {
    x += Math.floor(Math.random() * 6) + 1;
    out.push(x);
  }
  return out;
}

// Render array in the UI
function renderArray() {
  const cont = $('arrayViz');
  cont.innerHTML = '';
  arr.forEach((v, idx) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.textContent = v;
    cell.dataset.index = idx;
    cont.appendChild(cell);
  });
  applyState();
}

// Apply the current state in the history
function applyState() {
  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('active', 'checked', 'found');
  });
  if (stateIndex < 0) return;

  const s = history[stateIndex];
  $('log').innerHTML = '';
  history.slice(0, stateIndex + 1).forEach((h, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${h.action}</td><td>${h.i!==null?h.i:'-'}</td><td>${h.comment}</td>`;
    if (h.found) { tr.style.fontWeight="bold"; tr.style.color="#F77F00"; }
    $('log').appendChild(tr);
  });

  if (s.i !== null) {
    const el = document.querySelector(`.cell[data-index='${s.i}']`);
    if (el) el.classList.add('active');
  }
  if (s.checkedIndex !== undefined) {
    const elc = document.querySelector(`.cell[data-index='${s.checkedIndex}']`);
    if (elc) elc.classList.add(s.found ? 'found' : 'checked');
  }
}

// Run Fibonacci Search and record steps
function runFibonacciSearchSteps(array, key) {
  const n = array.length;
  let fibMMm2 = 0, fibMMm1 = 1, fibM = fibMMm2 + fibMMm1;
  while (fibM < n) {
    fibMMm2 = fibMMm1;
    fibMMm1 = fibM;
    fibM = fibMMm2 + fibMMm1;
  }

  let offset = -1;
  const log = [];
  log.push({action:'init', i:null, offset, fibM, fibMMm1, fibMMm2, comment:'Initialized Fibonacci numbers'});

  while (fibM > 1) {
    const i = Math.min(offset + fibMMm2, n - 1);
    log.push({action:'probe', i, offset, fibM, fibMMm1, fibMMm2, checkedIndex:i, comment:`Compare arr[${i}]=${array[i]} with ${key}`});

    if (array[i] < key) {
      fibM = fibMMm1;
      fibMMm1 = fibMMm2;
      fibMMm2 = fibM - fibMMm1;
      offset = i;
      log.push({action:'move-right', i, offset, fibM, fibMMm1, fibMMm2, comment:'Move offset to right'});
    } else if (array[i] > key) {
      fibM = fibMMm2;
      fibMMm1 = fibMMm1 - fibMMm2;
      fibMMm2 = fibM - fibMMm1;
      log.push({action:'move-left', i, offset, fibM, fibMMm1, fibMMm2, comment:'Move left'});
    } else {
      log.push({action:'found', i, offset, fibM, fibMMm1, fibMMm2, checkedIndex:i, found:true, comment:'Element found'});
      return log;
    }
  }

  if (fibMMm1 && offset + 1 < n && array[offset+1] === key) {
    log.push({action:'found-last', i: offset+1, offset, fibM, fibMMm1, fibMMm2, checkedIndex: offset+1, found:true, comment:'Found at offset+1'});
  } else {
    log.push({action:'not-found', i:null, offset, fibM, fibMMm1, fibMMm2, comment:'Element not found'});
  }

  return log;
}

// Event Listeners
$('genBtn').addEventListener('click', () => {
  const n = parseInt($('arrSize').value) || 11;
  arr = genArray(n);
  renderArray();
  $('searchKey').value = '';
  history = [];
  stateIndex = -1;
  $('log').innerHTML = '';
});

$('startBtn').addEventListener('click', () => {
  if (!arr.length) { alert('Generate an array first'); return; }
  const key = parseInt($('searchKey').value);
  if (isNaN(key)) { alert('Enter numeric key'); return; }

  history = runFibonacciSearchSteps(arr, key);
  stateIndex = 0;
  applyState();
});

// Auto-play functionality
$('autoBtn')?.addEventListener('click', () => {
  if (!history.length) return;
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
    $('autoBtn').textContent = 'Auto';
    return;
  }
  $('autoBtn').textContent = 'Stop';
  autoTimer = setInterval(() => {
    if (stateIndex < history.length - 1) {
      stateIndex++;
      applyState();
    } else {
      clearInterval(autoTimer);
      autoTimer = null;
      $('autoBtn').textContent = 'Auto';
    }
  }, 700);
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  arr = genArray(11);
  renderArray();
});
