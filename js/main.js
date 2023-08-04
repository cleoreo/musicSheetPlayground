const {Stave, StaveNote, Beam, Formatter, Renderer, Dot, Accidental} = Vex;


function Measure(x, y, width, id = 0, measureObj = {
  clef: "treble",
  beatsPerMeasure: 4,
  beatValue: 4,
  keySignature: ""
}) {
  this.notes = [];
  this.beams = [];
  this.keys = [];
  this.measure = new Stave(x, y, width);
  this.clef = measureObj.clef;
  this.indexOfMeasure = id;
  this.hasClef = false;
  this.beatsPerMeasure = measureObj.beatsPerMeasure;
  this.beatValue = measureObj.beatValue;
  this.hasTimeSignature = false;
  this.hasKeySignature = false;
  this.keySignature = measureObj.keySignature;

  this.addClefToMeasure = () => {
    if (!this.hasClef) {
      this.measure.addClef(this.clef);
      this.hasClef = true;
    }
  }
  this.addTimeSignature = () => {
    if (!this.hasTimeSignature) {
      this.measure.addTimeSignature(this.beatsPerMeasure + "/" + this.beatValue);
      this.hasTimeSignature = true;
    }
  }

  this.addKeySignature = () => {
    if (!this.hasKeySignature) {
      this.measure.addKeySignature(this.keySignature);
      this.hasKeySignature = true;
    }
  }

  this.addNotes = (notes) => {
    let notesArr = notes.map((note, index) => {
      return this.createNote({...note, keys: note.noteName.map(k => k + '/' + note.octave)}, index);
    })
    this.notes = notesArr;
    this.generateBeams();
  }

  this.createNote = (note = {keys: [], octave: 4, duration: 4, dot: false}, index = false) => {
    let staveNote = new StaveNote({keys: note.keys, duration: note.duration});
    note.keys.forEach((k, index) => {
      let accidental = "";
      const keyStr = k.split("/")[0];
      if (keyStr.length > 1) {
        accidental = keyStr.slice(1);
      }
      if (accidental.length > 0) {
        staveNote.addModifier(new Accidental(accidental), index);
      }
    })

    if (note.dot) {
      staveNote = this.dotted(staveNote);
    }
    if (index >= 0) {
      staveNote.setAttribute('id', this.indexOfMeasure + "_" + index);
    }
    return staveNote;
  }

  this.reassignIdToNotes = () => {
    this.notes.forEach((note, index) => {
      note.setAttribute('id', this.indexOfMeasure + "_" + index);
    })
  }

  this.changeStemId = () => {
    this.beams.forEach((bObj, bIndex) => {
      bObj.notes.forEach((noteObj, nIndex) => {
        const noteId = noteObj.attrs.id;
        noteObj.children.forEach((beamEl, cIndex) => {
          if (beamEl.attrs.type === "Stem") {
            this.beams[bIndex].notes[nIndex].children[cIndex].attrs.id = "stem_" + noteId;
          }
        })
      })
    })
  }

  this.addNote = (noteValue = {}, noteID, add = true) => {
    note = {noteName: "", octave: 4, duration: 4, dot: false, ...noteValue};
    if (noteID >= 0) {
      if (add) {
        this.notes = [
          ...this.notes.slice(0, noteID),
          this.createNote({...note, keys: [note.noteName + '/' + note.octave]}, noteID),
          ...this.notes.slice(noteID)
        ]
        this.reassignIdToNotes();
      } else {
        const keys = this.notes[noteID].keys;
        keys.push(note.noteName + '/' + note.octave);
        this.notes[noteID] = this.createNote({...note, keys}, noteID);
      }
    } else {
      const staveNote = this.createNote({...note, keys: [note.noteName + '/' + note.octave]}, this.notes.length);
      this.notes.push(staveNote);
    }
    this.generateBeams();
  }

  this.deleteNote = (noteId) => {
    if (noteId >= 0 && noteId < this.notes.length) {
      this.notes.splice(noteId, 1);
      this.reassignIdToNotes();
      this.generateBeams();
    }
  }
  this.dotted = (staveNote, noteIndex = -1) => {
    if (noteIndex < 0) {
      Dot.buildAndAttach([staveNote], {
        all: true,
      });
    } else {
      Dot.buildAndAttach([staveNote], {
        index: noteIndex,
      });
    }
    return staveNote;
  }

  this.generateBeams = () => {
    this.beams = Beam.generateBeams(this.notes);
    this.changeStemId();
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
  this.svgWidth = 1200
  this.svgHeight = 1000;
  this.measuresPerRow = 4;
  this.measureHeight = 200;
  this.svgElementID = "output";
  this.keySignature = "C";
  this.bpm = 120;
  // this.musicSheetObj = musicSheetObj;

  this.addMeasure = (measureData, idx = false) => {
    let position = this.getNextMeasurePosition();
    let measureIdx;
    (idx !== false) ? measureIdx = idx : measureIdx = this.measureList.length;

    const beatsPerMeasure = (measureData && measureData.beatsPerMeasure) ? measureData.beatsPerMeasure : 4;
    const beatValue = (measureData && measureData.beatValue) ? measureData.beatValue : 4;
    const clef = (measureData && measureData.clef) ? measureData.clef : "treble";
    const staveMeasure = new Measure(position.x, position.y, this.getMeasureWidth(), measureIdx, {
      clef,
      beatsPerMeasure,
      beatValue,
      keySignature: this.keySignature
    });
    staveMeasure.measure.attrs.id = "stave_" + measureIdx;
    if (measureData !== undefined && measureData?.notesArray?.length > 0) {
      staveMeasure.addNotes(measureData.notesArray, measureIdx);
      this.measureList[idx] = staveMeasure;
    } else {
      this.measureList.push(staveMeasure);
    }

  }

  this.addNoteToMeasure = (measureId, note, noteID, add = true) => {
    this.measureList[measureId].addNote(note, noteID, add);
  }

  this.deleteNoteFromMeasure = (measureId, noteId) => {
    this.measureList[measureId].deleteNote(noteId);
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
    const measures = musicSheetObj.measuresArray ? musicSheetObj.measuresArray : [];
    this.keySignature = musicSheetObj.keySignature;
    this.bpm = musicSheetObj.bpm;
    this.measureList = [];
    measures.forEach((m, idx) => {
      this.addMeasure(m, idx);
    })
  }

  this.updateMusicSheetSetting = (musicSheetObj) => {
    // musicSheetObj = {
    //   clef: "treble",
    //   beatsPerMeasure: 4,
    //   beatValue: 4,
    //   bpm: 120,
    //   keySignature: "C"
    // }
    this.keySignature = musicSheetObj.keySignature;
    this.bpm = musicSheetObj.bpm;

    const musicSheet = {...this.getMusicSheetJson(), ...musicSheetObj};
    musicSheet.measuresArray.forEach(m => {
      m.clef = musicSheetObj.clef;
      m.beatsPerMeasure = musicSheetObj.beatsPerMeasure;
      m.beatValue = musicSheetObj.beatValue;
    })
    this.setMusicSheet(musicSheet);
  }

  this.getMusicSheetJson = () => {
    const measuresArray = this.measureList.map((measure) => {
      const clef = measure.getClef();
      const notesArray = measure.notes.map(this.extractNoteData);

      return {
        clef,
        beatsPerMeasure: measure.beatsPerMeasure,
        beatValue: measure.beatValue,
        keySignature: this.keySignature,
        notesArray,
      };
    });

    return {
      type: "single",
      bpm: this.bpm,
      measuresArray,
      keySignature: this.keySignature,
    };
  };

  this.extractNoteData = (note) => {
    const keys = note.getKeys().map((key) => key.split('/')[0]);
    const octave = note.getKeys().map((key) => parseInt(key.split('/')[1]));
    const duration = note.getDuration();
    const dot = note.isDotted();
    return {noteName: keys, octave: octave[0], duration, dot};
  };

  this.render = async () => {
    await this.resetCanvas();
    const svgDiv = document.getElementById(this.svgElementID);
    const renderer = new Renderer(svgDiv, Renderer.Backends.SVG);
    let svgHeight = Math.ceil(100 * this.measureList.length / this.measuresPerRow);
    svgHeight = svgHeight > this.svgHeight ? svgHeight : this.svgHeight;
    renderer.resize(this.svgWidth, svgHeight);
    const context = renderer.getContext();

    await this.measureList.forEach((m, index) => {
      if (index % this.measuresPerRow === 0) {
        m.addClefToMeasure();
        m.addTimeSignature();
        m.addKeySignature();
      }
      m.render(context);
    });
    const measureElements = document.querySelectorAll(".vf-stave");
    measureElements.forEach((el) => {
      const id = el.getAttribute("id");
      const measureId = id.split("_")[1];
      el.setAttribute('ondragenter', "measureOnDragOver(event, " + measureId + ")");
      // el.setAttribute('ondragleave', "measureOnDragLeave(event, " + measureId + ")");

    })
    const noteElements = document.querySelectorAll(".vf-stavenote");
    noteElements.forEach((el) => {
      const id = el.getAttribute("id");

      // move stem element in svg in to note group
      this.moveStemIntoNoteGroup(id);

      // add listener to notes
      const [measureId, noteId] = id.split("-")[1].split('_');
      el.setAttribute('onclick', "noteOnClick(" + measureId + ", " + noteId + ")");
      el.setAttribute('ondragenter', "noteOnDragOver(event, " + measureId + ", " + noteId + ")");
      el.setAttribute("ondragleave", "noteOnDragLeave(event, " + measureId + ", " + noteId + ")")
    });

    // const staveElements = document.querySelectorAll(".vf-stave");
    // staveElements.forEach((stave) => {
    //
    // })

  }

  this.moveStemIntoNoteGroup = (noteGroupId) => {
    const beamStemId = "vf-stem_" + noteGroupId.split("-")[1];
    const beamStemElement = document.getElementById(beamStemId);
    const beamNoteGroupElement = document.getElementById(noteGroupId);

    if (beamStemElement && beamNoteGroupElement) {
      beamNoteGroupElement.appendChild(beamStemElement);
    }
  }

  this.resetCanvas = () => {
    const div = document.getElementById(this.svgElementID);
    const newDiv = document.createElement("div");
    newDiv.setAttribute("id", this.svgElementID);
    // newDiv.setAttribute("ondragend", "measureOnDrop(event)");
// newDiv.setAttribute("draggable", true);
    // newDiv.setAttribute("ondragenter", "drag(event)");

    div.replaceWith(newDiv);
  }
};
