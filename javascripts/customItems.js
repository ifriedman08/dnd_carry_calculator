$('body').on("click", "button.add-custom-item", function () {
  var name = $("input#customName").val();
  var weight = Number($("input#customWeight").val());
  console.log(name, weight);
  dnd_cc.addItem(name, weight);
  hideModal();
  clearForm();
});

$('body').on('hidden.bs.modal', function () {
  clearForm();
})

var hideModal = function () {
  $('.modal').modal("hide");
};

var clearForm = function () {
  $("input#customName").val('');
  $("input#customWeight").val('');
}
