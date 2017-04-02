//!!! FIREBASE DB !!!
var db = function() {
  var config = {
    apiKey: "AIzaSyDKem3E0-tqTyUpscBJC6J8Z6iC9pyQPcA",
    authDomain: "workout-336f2.firebaseapp.com",
    databaseURL: "https://workout-336f2.firebaseio.com",
    projectId: "workout-336f2",
    storageBucket: "workout-336f2.appspot.com",
    messagingSenderId: "466196710512"
  };
  firebase.initializeApp(config);
  var database = firebase.database();
  
  function findData(data){ 
    updateWodSearchList(data.val());
  }
   
  function findErr(data) {
     console.log("err: " + data.val());
  }
  var cb;
  return {
    addWod: function(obj) {
      var wodsDb = database.ref("wods");
      //wodsDb.push(obj);
      wodsDb.child(obj.name).set(obj);
    },
    findWod: function(name) {
      var wodIdRef = database.ref("wods/" + name);
      wodIdRef.on("value", findData, findErr);
    }
  };
}();

// !!! DATAAAA !!!!
var Exercises = [ // TODOOOOOOOOOO ir buscar à db
  "Burpee", "Abs", "Push-ups", "Lunges"
];

var store = {
  state: {
    wod: {
      name: "",
      break: 0,
      sets: 1,
      image: "",
      exercises: []
    }
  },
  actions: {
    "ADD-EXERCISE": [],
    "RUN-WOD": [],
    "RUN-EXERCISE": [],
    "RUN-BREAK": [],
    "END-WOD": [],
    "LOAD-WOD": []
  },
  subscribe: function(action, cb) {
    this.actions[action].push(cb);
  },
  emit: function(action, obj) {
    this.actions[action].forEach(function(cb) {
      cb(obj);
    });
  }
};


// !!!!! NAVBAR !!!!!!!!!!!
var nav = false;

function sideNavBar() {
  function w3_open() {
    document.getElementById("main").style.marginLeft = "25%";
    document.getElementById("mySidebar").style.width = "25%";
    document.getElementById("mySidebar").style.display = "block";
    document.getElementById("openNav").style.display = 'none';
  }

  function w3_close() {
    document.getElementById("main").style.marginLeft = "0%";
    document.getElementById("mySidebar").style.display = "none";
    document.getElementById("openNav").style.display = "inline-block";
  }
  nav = !nav;
  if (nav) {
    w3_open();
  } else {
    w3_close();
  }
}

$("#findWod").click(function(){
  db.findWod($("#wodSearchInput").val());
});

function updateWodSearchList(obj){
  if(obj === null) return;
  $(".wodSearchList").empty();
  var div = $("<div></div>").addClass("w3-button w3-bar-item");
  div.click(function(){
    store.emit("LOAD-WOD", obj);
    sideNavBar();
  });
  var listImg =  $("<img></img>").attr({
    "class": "wodListImg",
    "src": obj.image,
    "alt": "Wod image"
  });
  var h4Name = $("<h2></h2>").text(obj.name);
  h4Name.addClass("wodListName");
  div.append(listImg, h4Name);
  
  $(".wodSearchList").append(div);
}

// !!!!! DISPLAY PANEL !!!!!
var dispTime = $("#displayTime");
var breakTimer, exerciseTimer;

store.subscribe("END-WOD", function() {
  clearInterval(breakTimer);
  clearInterval(exerciseTimer);
  dispTime.text("--");
  $("#displayExercise").text("Over"); // load again, same wod?
  $("#displayImg").attr("src", "over");
});

store.subscribe("RUN-EXERCISE", runExercise);

store.subscribe("RUN-WOD", function(obj) {
  var currentEx = clone(obj.exercises[0]);
  currentEx.index = 0;
  currentEx.set = 1;
  store.emit("RUN-EXERCISE", currentEx);
});

store.subscribe("RUN-BREAK", function(obj) {
  if (obj.time <= 0) {
    if (obj.next >= store.state.wod.exercises.length) {
      store.emit("END-WOD");
      return;
    }
    store.emit("RUN-EXERCISE", clone(store.state.wod.exercises[obj.next]));
    return;
  }
  $("#displayExercise").text("Break");
  $("#displayImg").attr("src", "break");
  breakTimer = setInterval(function() {
    dispTime.text(obj.time--);
    if (obj.time === 0 || obj.time === 1) {
      beep("break");
    }
    if (obj.time < 0) {
      clearInterval(breakTimer);
      beep("finalBreak");
      var ex = clone(store.state.wod.exercises[0]);
      ex.index = 0;
      ex.set = obj.next;
      store.emit("RUN-EXERCISE", ex);
    }
  }, 1000);
});

function runExercise(obj) {
  $("#displayExercise").text(obj.name);
  $("#displayImg").attr("src", obj.imageURL);

  exerciseTimer = setInterval(timer, 1000);

  function timer() {
    dispTime.text(obj.time--);
    if (obj.time === 0 || obj.time === 1) {
      beep();
    }
    if (obj.time < 0) {
      clearInterval(exerciseTimer);
      beep("final");
      var i = obj.index + 1;
      if (i >= store.state.wod.exercises.length) {
        console.log("last exercise");
        if (obj.set === store.state.wod.sets) {
          store.emit("END-WOD");
          return;
        }
        console.log("run break");
        store.emit("RUN-BREAK", {
          name: "Break",
          time: store.state.wod.break,
          next: obj.set + 1
        });
        return;
      }
      var ex = clone(store.state.wod.exercises[i]);
      ex.index = i;
      ex.set = obj.set;
      store.emit("RUN-EXERCISE", ex);
    }
  }

}

// !!!!! CONTROLS PANEL !!!!!

$("#play").click(function() {
  $("#add").attr("disabled", true);
  if(store.state.wod.exercises.length === 0) {
    alert("Load a wod first"); 
    return; 
  }
  store.emit("RUN-WOD", store.state.wod);
});

$("#pause").click(function() {
  //todooo
});

$("#stop").click(function() {
  $("#add").attr("disabled", false);
  store.emit("END-WOD");
});

// !!!!! WOD PANEL !!!!!
function WODPANEL() {
  function exercisesDiv(exercise) {
    var div = $("<div></div>").attr({
      "class": "list-group-item",
      "id": exercise.id
    });
    var h = $("<h3></h3>").attr("class", "exercise");
    h.append($("<span></span>").attr({
      "aria-hidden": "true"
    }).addClass("glyphicon glyphicon-move"));
    h.append(exercise.name + " " + exercise.time + " seconds");
    div.append(h);
    return div;
  }

  function exerciseHolder(obj) {
    var div = $("#editable");
    obj.forEach(function(e) {
      div.append(exercisesDiv(e));
    });
    return div;
  }

  store.subscribe("LOAD-WOD", function(obj) {
    store.state.wod = clone(obj);
    exerciseHolder(store.state.wod.exercises);
    $("#displayImg").attr("src", store.state.wod.image);
    $("#displayExercise").text(store.state.wod.name);
  });
  
  store.subscribe("ADD-EXERCISE", function(obj) {
    var div = $("#editable");
    div.append(exercisesDiv(obj));
    obj.id = store.state.wod.exercises.length + 1;
    store.state.wod.exercises.push(obj);
  });
}
WODPANEL();

// !!!!!! ADD PANEL !!!!!!!!!!!!!
var type;
//!!! Modal !!!
function imagePickerAdd() {
  var modal = document.getElementById('myModal');
  modal.style.display = "block";
  $("#imageURLInput").val("");
  type = "add";
}

$(".closeModal").click(function() {
  var modal = document.getElementById('myModal');
  modal.style.display = "none";
});

$(".addImgUrl").click(function() {
  var modal = document.getElementById('myModal');
  modal.style.display = "none";
  if (type === "add") {
    var img = document.getElementById("exercise-img");
    img.src = $("#imageURLInput").val();
  } else if (type === "save") {
    var imgg = document.getElementById("wod-img");
    imgg.src = $("#imageURLInput").val();
  }
});

$("#clearUrl").click(function() {
  $("#imageURLInput").val("");
});

//!!! Exercise Input
function fillExerciseDataList(exercises) {
  var datalist = document.getElementById("exerciseList");
  for (var i = 0; i < exercises.length; ++i) {
    var op1 = document.createElement("option");
    op1.value = exercises[i];
    op1.innerHTML = exercises[i];
    datalist.appendChild(op1);
  }
}
fillExerciseDataList(Exercises);

//!!! ADD button
$("#add").click(function() {
  var ex = {
    name: $(".exerciseInput").val(),
    notes: $(".notesInput").val(),
    time: $(".timeInput").val(),
    imageURL: $("#exercise-img").attr("src"),
  };
  store.emit("ADD-EXERCISE", ex);
});

// !!! SAVE WOD PANEL !!!

function imagePickerSave() {
  var modal = document.getElementById('myModal');
  modal.style.display = "block";
  $("#imageURLInput").val("");
  type = "save";
}

function saveWodClick() {
  //if loaded have the id!
  //add
  //default imageurl
  store.state.wod.name = $(".wodInput").val();
  store.state.wod.sets = $(".setsInput").val();
  store.state.wod.break = $(".breakInput").val();
  store.state.wod.image = $("#imageURLInput").val();
  //console.log(store.state.wod);
  db.addWod(store.state.wod);
}

// ++++++++++ EDITABLE JS LIST ++++++++++++++++
var editableList = Sortable.create(editable, {
  handle: '.glyphicon-move',
  animation: 100,
  filter: '.js-remove',
  onFilter: function(evt) {
      var item = evt.item,
        ctrl = evt.target;
      if (Sortable.utils.is(ctrl, ".js-remove")) { // Click on remove button
        item.parentNode.removeChild(item); // remove sortable item   
        //iftList(item.id.split("id")[1]);
        //running = false;
      }
    }
    /*onEnd: function(evt) {
    if (evt.newIndex === undefined || evt.newIndex === evt.oldIndex) return;
    console.log(evt.item);
    console.log(evt.clone);
    var neww = parseInt(evt.oldIndex);
    var old = parseInt(evt.newIndex);
    var li1 = document.getElementById("id" + (old + 1));
    li1.id = "ida";

    var li2 = document.getElementById("id" + (neww + 1));
    li2.id = "id" + (old + 1);

    li1.id = "id" + (neww + 1);
   
    var temp = currentWod.list[old + 1];
    currentWod.list[old + 1] = currentWod.list[neww + 1];
    currentWod.list[neww + 1] = temp;
    
  }*/
});

function shiftList(index) {
  currentWod.list[index] = undefined;
  for (var i = parseInt(index); i < currentWod.size; ++i) {
    currentWod.list[i] = currentWod.list[i + 1];
    var li = document.getElementById("id" + (i + 1));
    li.id = "id" + i;
    delete currentWod.list[i + 1];
  }
  currentWod.size -= 1;
}

function clone(obj) {
  var ret = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      ret[key] = obj[key];
    }
  }
  return ret;
}

function beep(last) {
  var f = last ? "final" : "";
  console.log("beep" + f);
}
