window.dnd_cc = typeof window.dnd_cc === "undefined" ? {} : window.dnd_cc;

var merge = function (obj1, obj2) {
  var result = {};
  [obj1, obj2].forEach(function (obj) {
    Object.keys(obj).forEach(function (key){
      result[key] = obj[key];
    });
  });
  return result;
};

Number.prototype.truncate2 = function () {
  return Math.floor(this * 100) / 100;
};

dnd_cc.getAllItems = function () {
  return merge(dnd_cc.state.inventory, dnd_cc.state.customItems);
}

dnd_cc.initialize = function () {
  console.log("initializing");
  dnd_cc.state = typeof window.localStorage.dnd_cc_state === "undefined" ? {} : JSON.parse(window.localStorage.dnd_cc_state);
  if (typeof dnd_cc.state.inventory === "undefined") {
    dnd_cc.state.inventory = {};
  }
  if (typeof dnd_cc.state.customItems === "undefined") {
    dnd_cc.state.customItems = {};
  }
  console.log("initialized:", dnd_cc.state);
};

dnd_cc.updateCharInfo = function () {
  console.log("updating char info:", dnd_cc.state);
  $("td#charName").html(dnd_cc.state.charName);
  $("td#charStrength").html(dnd_cc.state.strengthScore);
};

dnd_cc.save = function () {
  window.localStorage.dnd_cc_state = JSON.stringify(dnd_cc.state);
  console.log("saved to localStorage:", JSON.parse(window.localStorage.dnd_cc_state));
};

dnd_cc.clearTypeahead = function(){
  $('input.form-control').typeahead('val', '');
};

dnd_cc.addItem = function (name, weight) {
  console.log("adding", name);
  if (typeof dnd_cc.state.inventory[name] === "undefined") {
    dnd_cc.state.inventory[name] = {
      weight   : weight,
      quantity : 1
    };
  } else {
    dnd_cc.state.inventory[name].quantity += 1;
  };
  console.log("updated global object's state", window.dnd_cc.state);
  dnd_cc.save();
  console.log("saved to localStorage:", JSON.parse(window.localStorage.dnd_cc_state));
  dnd_cc.renderTable();
};

dnd_cc.renderTable = function (custom) {
  $("table.inventory-table").find("tr:gt(0)").remove();
  console.log("rendering table: ", dnd_cc.state.inventory);
  Object.keys(dnd_cc.getAllItems()).forEach(function (key) {
    var itemRow = $("<tr class='" + key.replace(/\ /g,'_' ).replace(/\'/, '7') + "'>");
    var itemCell = $("<td class='item''>");
    var quantityCell = $("<td class='quantity text-center'>");
    var weightCell = $("<td class='weight text-center'>");
    var removeOneCell = $("<td class='removeOne'>");
    var removeButton = $('<button type="button" class="btn btn-danger removeOne">');
    var addOneCell = $("<td class='addOne'>");
    var addButton = $('<button type="button" class="btn btn-success addOne">');
    removeButton.html("-");
    addButton.html("+");
    removeOneCell.append(removeButton);
    addOneCell.append(addButton);
    itemCell.html(key);
    quantityCell.html(dnd_cc.state.inventory[key].quantity);
    weightCell.html((dnd_cc.state.inventory[key].weight * dnd_cc.state.inventory[key].quantity).truncate2());
    itemRow.append(itemCell, quantityCell, weightCell, removeOneCell, addOneCell);
    $("table.inventory-table").append(itemRow);
  });
  dnd_cc.updateBar();
};

dnd_cc.increaseItem = function (name, custom) {
  dnd_cc.state.inventory[name].quantity += 1;
  dnd_cc.save();
  dnd_cc.renderTable();
};

dnd_cc.decreaseItem = function (name, custom) {
  dnd_cc.state.inventory[name].quantity -= 1;
  if (dnd_cc.state.inventory[name].quantity === 0) {
    console.log("item at 0:", name);
    delete dnd_cc.state.inventory[name];
  };
  dnd_cc.save();
  dnd_cc.renderTable();
};

dnd_cc.getCurrentCapacity = function () {
  var total = 0;
  Object.keys(dnd_cc.state.inventory).forEach(function (item) {
    var q = dnd_cc.state.inventory[item].quantity;
    var w = dnd_cc.state.inventory[item].weight;
    total += q * w;
  });
  return total;
};

dnd_cc.getMaxCapacity = function () {
  return dnd_cc.state.strengthScore * 15;
};

dnd_cc.ensureCharacterData = function () {
  if (typeof dnd_cc.state.strengthScore === "undefined") {
    var strengthScore = Number(prompt("You have not entered your character's Strength Score. This is the large number associated to your strength, no + or -. Please enter it below:"));
    dnd_cc.state.strengthScore = strengthScore;
    console.log("saved strength score to gobal state:", strengthScore);
    dnd_cc.save();
  };

  if (typeof dnd_cc.state.charName === "undefined") {
    var charName = prompt("You have not entered your character's name. Please enter it below:");
    dnd_cc.state.charName = charName;
    console.log("saved character's name to gobal state:", charName);
    dnd_cc.save();
  };
}

dnd_cc.updateBar = function () {
  var ratio = (dnd_cc.getCurrentCapacity() / dnd_cc.getMaxCapacity()) * 100;
  $("div.progress-bar").css({"width" : ratio+"%"});
  $("h3.carry-status").html(dnd_cc.getCurrentCapacity() + " / " + dnd_cc.getMaxCapacity());
  if (dnd_cc.getCurrentCapacity() >= dnd_cc.getMaxCapacity()) {
    //too much
    $("div.progress-bar").addClass("active");
    $("h3.warning").css({"visibility" : "visible" , "height": "1em" });
  } else {
    //good 2 go
    $("div.progress-bar").removeClass("active");
    $("h3.warning").css({"visibility" : "hidden" , "height" : "0"});
  };
};

$('body').on('click', 'button.addOne', function (event) {
  console.log("this", this);
  console.log("event", event);
  var newClass = this.parentElement.parentElement.classList[0].replace(/\_/, " ").replace(/7/, "\'");
  dnd_cc.increaseItem(newClass);
});

$('body').on('click', 'button.removeOne', function (event) {
  console.log("this", this);
  console.log("event", event);
  var newClass = this.parentElement.parentElement.classList[0].replace(/\_/, " ").replace(/7/, "\'");
  dnd_cc.decreaseItem(newClass);
});

$('body').on('click', 'button.addOne.custom', function (event) {
  console.log("this", this);
  console.log("event", event);
  var newClass = this.parentElement.parentElement.classList[0].replace(/\_/, " ").replace(/7/, "\'");
  dnd_cc.increaseItem(newClass, true);
});

$('body').on('click', 'button.removeOne.custom', function (event) {
  console.log("this", this);
  console.log("event", event);
  var newClass = this.parentElement.parentElement.classList[0].replace(/\_/, " ").replace(/7/, "\'");
  dnd_cc.decreaseItem(newClass, true);
});

dnd_cc.sync = function () {
  dnd_cc.initialize();
  dnd_cc.ensureCharacterData();
  dnd_cc.updateCharInfo();
  dnd_cc.renderTable();
};

dnd_cc.sync();
