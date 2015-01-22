// updates code snippets from remote repo
var snippets = JSON.parse(localStorage.scriptSnippets);
console.log('I have', snippets.length, 'code snippets');
console.table(snippets);

// read code snippets from this repo
var repo = 'https://rawgit.com/bahmutov/code-snippets/master/';

function fetch(url) {
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        resolve(request.responseText);
      } else {
        reject(request.responseText);
      }
    };

    request.onerror = function (err) {
      reject(err);
    };

    request.send();
  });
}

var updated = [];

function updateSnippet(k, id, filename) {
  return fetch(repo + filename)
    .then(function (source) {
      console.log('fetched new source for', id, filename);
      // console.log(source);
      updated.push({
        index: k,
        id: id,
        content: source,
        name: filename
      });
    }, function () {
      console.error('cannot find remote for', filename);
    });
}

function chainSnippet(chain, snippet, k) {
  return chain.then(function () {
    return updateSnippet(k, snippet.id, snippet.name);
  });
}

var allChecked = snippets.reduce(chainSnippet, Promise.resolve());
allChecked.then(function () {
  console.log('fetched', updated.length, 'snippets');
  updated.forEach(function (update) {
    var snippet = snippets[update.index];
    console.assert(update.name === snippet.name,
      'name mismatch for update', update, snippet);
    snippet.content = update.content;
  });
  if (updated.length) {
    localStorage.scriptSnippets = JSON.stringify(snippets);
  }
  console.table(updated);
});
