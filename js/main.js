const {Stave, StaveNote, Beam, Formatter, Renderer} = Vex;


function Measure(x, y, width, id = 0, clef = "treble") {
  this.notes = [];
  this.beams = [];
  this.keys = [];
  this.measure = new Stave(x, y, width);
  this.clef = clef;
  this.indexOfMeasure = id;

  this.addClefToMeasure = () => {
    this.measure.addClef(this.clef);
  }

  this.addNotes = (notes) => {
    let notesArr = notes.map((note, index) => {
      const staveNote = new StaveNote({keys: note.noteName.map(k => k + '/' + note.octave), duration: note.duration});
      staveNote.setAttribute('id', this.indexOfMeasure + "_" + index);
      return staveNote;
    })

    this.beams = Beam.generateBeams(notesArr);
    this.notes = notesArr;
  }

  this.addNote = (note = {noteName: "", octave: 4, duration: 4}, noteID) => {
    if (noteID >= 0) {
      const keys = this.notes[noteID].keys;
      keys.push(note.noteName + '/' + note.octave);
      this.notes[noteID] = new StaveNote({keys, duration: this.notes[noteID].duration});
    } else {
      const staveNote = new StaveNote({keys: [note.noteName + '/' + note.octave], duration: note.duration});
      staveNote.setAttribute('id', this.indexOfMeasure + "_" + this.notes.length);
      this.notes.push(staveNote);
    }
  }

  this.getNotePosition = () => {
    return this.notes[0].getBoundingBox();
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
  // this.musicSheetObj = musicSheetObj;

  this.addMeasure = (measureData, idx) => {
    let position = this.getNextMeasurePosition();
    let measureIdx;
    (idx >= 0) ? measureIdx = idx : measureIdx = this.measureList.length;
    const staveMeasure = new Measure(position.x, position.y, this.getMeasureWidth(), measureIdx);
    if (measureData !== undefined && measureData?.notesArray?.length > 0) {
      staveMeasure.addNotes(measureData.notesArray, measureIdx);
      this.measureList[idx] = staveMeasure;
    } else {
      this.measureList.push(staveMeasure);
    }
  }

  this.addNoteToMeasure = (measureId, note, noteID) => {
    this.measureList[measureId].addNote(note, noteID);
  }

  this.deleteNote = (measureId, noteId) => {
    if (this.measureList[measureId]) {
      if (noteId >= 0 && noteId < this.measureList[measureId].notes.length) {
        this.measureList[measureId].notes.splice(noteId, 1);
      }
    }
  };

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

      // move stem element in svg in to note group
      this.moveStemIntoNoteGroup(id + '-stem', id);

      // add listener to notes
      const [measureId, noteId] = id.split("-")[1].split('_');
      // el.setAttribute('onclick', "noteOnClick(" + measureId + ", " + noteId + ")");
      // el.setAttribute('onmouseover', "noteOnClick(" + measureId + ", " + noteId + ")");
      el.setAttribute('draggable', "true");
      el.setAttribute('pointer-event', "bounding-box")
    });

    // const staveElements = document.querySelectorAll(".vf-stave");
    // staveElements.forEach((stave) => {
    //
    // })

    console.log(this.measureList[0].getNotePosition());
  }

  this.moveStemIntoNoteGroup = (stemId, noteGroupId) => {
    const stemElement = document.getElementById(stemId);
    const noteGroupElement = document.getElementById(noteGroupId).querySelector('.vf-note');

    if (stemElement && noteGroupElement) {
      noteGroupElement.appendChild(stemElement);
    }
  }

  this.resetCanvas = () => {
    const div = document.getElementById(this.svgElementID);
    const newDiv = document.createElement("div");
    newDiv.setAttribute("id", this.svgElementID);
    div.replaceWith(newDiv);
  }
};
