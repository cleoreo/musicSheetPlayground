var musicSheetJson = {
  type: "single", // piano, guitar tab
  bpm: 180,
  keySignature: "C",
  measuresArray: [
    {
      clef: false,
      //time signature
      beatsPerMeasure: 4,
      beatType: 4,
      notesArray: [
        // duration: 1|2|4|8|16|32
        {
          noteName: ["C", "E", "F"],
          octave: 4,
          duration: 4,
        },
        {
          noteName: ["D"],
          octave: 4,
          duration: 4,
        },
        {
          noteName: ["A"],
          octave: 4,
          duration: 8,
        },
        {
          noteName: ["D"],
          octave: 4,
          duration: 8,
        },
        {
          noteName: ["A"],
          octave: 4,
          duration: 8,
        },
        {
          noteName: ["D"],
          octave: 4,
          duration: 8,
        }
      ]
    },
    {
      clef: false,
      //time signature
      beatsPerMeasure: 4,
      beatType: 4,
      notesArray: [
        // duration: 1|2|4|8|16|32
        {
          noteName: ["A", "D", "E"],
          octave: 4,
          duration: 4,
        },
        {
          noteName: ["F"],
          octave: 4,
          duration: 4,
        },
        {
          noteName: ["D"],
          octave: 4,
          duration: 4,
        },
        {
          noteName: ["G"],
          octave: 4,
          duration: 4,
        }
      ]
    },
    {
      clef: false,
      //time signature
      beatsPerMeasure: 4,
      beatType: 4,
      notesArray: [
        {
          noteName: ["D"],
          octave: 4,
          duration: 4,
        },
        {
          noteName: ["G"],
          octave: 4,
          duration: 4,
          dot: true,
        }
      ]
    }
  ],
};
