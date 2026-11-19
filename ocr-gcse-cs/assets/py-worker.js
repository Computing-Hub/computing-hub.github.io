/* Python runner — runs inside a Web Worker so the page never freezes.
   The page can terminate this worker at any time (Stop button), even in an infinite loop.
   input() blocks the worker with Atomics.wait on a SharedArrayBuffer until the page posts
   the user's answer. Requires cross-origin isolation (see coi-serviceworker.js). */
var PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
var py = null, ready = null;

function boot() {
  if (!ready) {
    postMessage({ type: 'status', text: 'Loading Python (about 10 MB, first time only)…' });
    importScripts(PYODIDE_URL);
    ready = loadPyodide({ indexURL: PYODIDE_URL.replace('pyodide.js', '') }).then(function (p) { py = p; return p; });
  }
  return ready;
}

var inputSab = null, inputFlag = null, inputBytes = null;

function askInput(prompt) {
  // tell the page we need input, then sleep until it answers
  Atomics.store(inputFlag, 0, 0);
  postMessage({ type: 'input', prompt: String(prompt == null ? '' : prompt) });
  Atomics.wait(inputFlag, 0, 0);
  var len = Atomics.load(inputFlag, 1);
  var text = new TextDecoder().decode(inputBytes.slice(0, len));
  return text;
}

onmessage = function (e) {
  var m = e.data;
  if (m.type !== 'run') return;
  inputSab = m.sab; inputFlag = new Int32Array(inputSab, 0, 2); inputBytes = new Uint8Array(inputSab, 8);
  boot().then(function (p) {
    postMessage({ type: 'status', text: 'Running…' });
    p.setStdout({ batched: function (s) { postMessage({ type: 'out', text: s }); } });
    p.setStderr({ batched: function (s) { postMessage({ type: 'out', text: s }); } });
    p.globals.set('__prompt', function (msg) { var v = askInput(msg); postMessage({ type: 'out', text: (msg || '') + v }); return v; });
    if (m.files) {
      Object.keys(m.files).forEach(function (name) {
        if (m.resetFiles || !p.FS.analyzePath(name).exists) p.FS.writeFile(name, m.files[name]);
      });
    }
    try {
      p.runPython('import builtins, random\nbuiltins.input = lambda msg="": __prompt(str(msg))\n');
      p.runPython(m.code);
      var files = {};
      if (m.files) Object.keys(m.files).forEach(function (name) { try { files[name] = p.FS.readFile(name, { encoding: 'utf8' }); } catch (e) {} });
      postMessage({ type: 'done', files: files });
    } catch (err) {
      var msg = String(err.message || err);
      var i = msg.indexOf('File "<exec>"'); if (i > 0) msg = 'Traceback (most recent call last):\n  ' + msg.slice(i);
      postMessage({ type: 'error', text: msg });
    }
  }).catch(function (err) {
    postMessage({ type: 'fatal', text: 'Could not load Python: ' + (err.message || err) });
  });
};
