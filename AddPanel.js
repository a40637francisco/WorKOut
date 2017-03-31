function ImageInput() {
  function imagePicker() {
    var img = document.getElementById("ex-img");
  }
  var img = $("<img/>");
  img.attr({
    "id": "exercise-img",
    "alt": "Add Image",
    "onclick": "imagePicker()"
  });
  return img;
}

function ExerciseInput() {
  function fillExerciseDataList(exercises) {
      var datalist = document.getElementById("exerciseList");
      for (var i = 0; i < exercises.length; ++i) {
        var op1 = document.createElement("option");
        op1.value = exercises[i];
        op1.innerHTML = exercises[i];
        datalist.appendChild(op1);
      }
    }
  fillExerciseDataList(this.props.exercises);  
  var outer = $("<div></div>");
  var name = $("<div></div>");
  name.append($("<input></input>").attr({
    "type":"text", "placeholder": "Exercise",
    "list":"exerciseList", "class": "exerciseInput"
  }));
  var notes = $("<div></div>");
  notes.append($("<input></input>").attr({
    "type":"text", "placeholder": "Notes",
    "class": "notesInput"
  }));
  outer.append(name, notes);
  return outer;
}

function AddButton() {
  var div = $("<div></div>");
  div.append($("<button>+</button>").attr({
    "class":"add", "id":"add"
  }));
  return div;
}

function TimeInput() {
  var div = $("<div></div>");
  div.append($("<input></input>").attr({
    "type":"number","placeholder":"Time in seconds",                "class":"notesInput", "min":"1"
  }));
  return div;     
}

function AddPanel() {
  $("add-panel").append(
    ImageInput(),
    ExerciseInput(),
    TimeInput(),
    AddButton()
  );
}
