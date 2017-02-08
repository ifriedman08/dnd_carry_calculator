var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};
var itemNames = [];
Object.keys(window.dnd_cc.MANIFEST).forEach(function (item) {
  itemNames.push(item);
});

$('input.form-control.search').typeahead({
  hint: false,
  highlight: false,
  minLength: 1
},
{
  name: 'states',
  source: substringMatcher(itemNames)
});


$('body').on('click', '.tt-selectable', function() {
  console.log('selectable clicked:', this);
  var name = this.innerHTML;
  var weight = window.dnd_cc.MANIFEST[name];
  window.dnd_cc.addItem(name, weight);
  window.dnd_cc.clearTypeahead();
});

$('body').on('click', 'button.clear-confirm', function () {
  localStorage.clear();
  window.location.reload();
});

// $('body').on('click', 'button.custom-item', function () {
//   console.log("opening custom items");
//   dnd_cc.openCustomModal();
// });
