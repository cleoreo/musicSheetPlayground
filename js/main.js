const {Stave, StaveNote, Beam, Formatter, Renderer} = Vex;


function Measure(x, y, width, clef = "treble") {
  this.notes = [];
  this.beams = [];
  this.keys = [];
  this.measure = new Stave(x, y, width);
  this.clef = clef;

  this.addClefToMeasure = () => {
    this.measure.addClef(this.clef);
  }

  this.addNotes = (notes, indexOfMeasure = 0) => {
    let notesArr = notes.map((note, index) => {
      const staveNote = new StaveNote({keys: note.noteName.map(k => k + '/' + note.octave), duration: note.duration});
      staveNote.setAttribute('id', indexOfMeasure + "_" + index);
      staveNote.setAttribute('class', indexOfMeasure + "_" + index);
      // staveNote.onclick = selectNote(indexOfMeasure, index);
      staveNote.setAttribute("onclick", "selectNote(" + indexOfMeasure + ", " + index + ")");
      return staveNote;
    })

    // notes = [
    //   new StaveNote({keys: ["c/4"], duration: "8"}),
    //   new StaveNote({keys: ["e/4"], duration: "8"}),
    //   new StaveNote({keys: ["c/4"], duration: "8"}),
    //   new StaveNote({keys: ["e/4"], duration: "8"}),
    // ];
    // this.beams = this.beams.push(new Beam(notesArr));
    this.notes = notesArr;
  }
  this.updateNotes = () => {

  }

  this.getClef = () => this.clef;

  this.render = (context) => {
    this.measure.setContext(context).draw();
    if (this.notes.length) {
      Formatter.FormatAndDraw(context, this.measure, this.notes);
    }
    if (this.beams.length) {
      this.beams.forEach(b => {
        b.setContext(context).draw();
      })
    }
  }
}

function MusicSheet(musicSheetObj) {
  this.measureList = [];
  this.svgWidth = 1000
  this.svgHeight = 1000;
  this.measuresPerRow = 4;
  this.measureHeight = 200;
  this.svgElementID = "output";
  this.musicSheetObj = {};

  this.addMeasure = (measureData, idx) => {
    let position = this.getNextMeasurePosition();

    const staveMeasure = new Measure(position.x, position.y, this.getMeasureWidth());
    if (measureData !== undefined && measureData?.notesArray?.length > 0) {
      staveMeasure.addNotes(measureData.notesArray, idx);
      this.measureList[idx] = staveMeasure;
    } else {
      this.measureList.push(staveMeasure);
    }
  }

  this.getMeasureWidth = () => {
    return this.svgWidth / this.measuresPerRow - 1;
  }

  this.getNextMeasurePosition = () => {
    let noOfMeasure = this.measureList.length;
    const initX = this.measuresPerRow / 2;
    const initY = 10;
    let x = noOfMeasure % this.measuresPerRow * this.getMeasureWidth() + initX;
    let y = (Math.ceil((noOfMeasure + 1) / this.measuresPerRow) - 1) * this.measureHeight + initY;

    return {x, y}
  }

  this.setMusicSheet = (musicSheetObj) => {
    // this.musicSheetObj = musicSheetObj;
    const measures = musicSheetObj.measuresArray ? musicSheetObj.measuresArray : [];
    this.measureList = [];
    measures.forEach((m, idx) => {
      this.addMeasure(m, idx);
    })
  }

  this.render = async () => {
    await this.resetCanvas();
    const svgDiv = document.getElementById(this.svgElementID);
    const renderer = new Renderer(svgDiv, Renderer.Backends.SVG);
    renderer.resize(this.svgWidth, this.svgHeight);
    const context = renderer.getContext();

    await this.measureList.forEach((m, index) => {
      if (index % this.measuresPerRow === 0) {
        m.addClefToMeasure();
      }
      m.render(context);
    });

    const noteElements = document.querySelectorAll(".vf-stavenote");
    noteElements.forEach((el) => {
      const id = el.getAttribute("id");
      const [measureId, noteId] = id.split("-")[1].split('_');
      console.log("noteOnClick(" + measureId + ", " + noteId + ")");
      el.setAttribute('onclick', "noteOnClick(" + measureId + ", " + noteId + ")");
    });
  }

  this.resetCanvas = () => {
    const div = document.getElementById(this.svgElementID);
    const newDiv = document.createElement("div");
    newDiv.setAttribute("id", this.svgElementID);
    div.replaceWith(newDiv);
  }
};
