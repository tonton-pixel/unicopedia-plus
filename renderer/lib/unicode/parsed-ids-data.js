//
const fs = require ('fs');
const path = require ('path');
//
let unencoded = { };
//
let codePoints = { };
//
// Copy of https://babelstone.co.uk/CJK/IDS.TXT (consistent with the BabelStoneHanPUA.ttf font)
let lines = fs.readFileSync (path.join (__dirname, 'IDS', 'IDS.TXT'), { encoding: 'utf8' }).replace (/^\uFEFF/, "").split ("\r\n");
for (let line of lines)
{
    if (line)
    {
        if (line[0] === "#")
        {            
            let found = line.match (/^#\t(\{\d+\})\t(.*)\(([0-9A-Fa-f]{4}) (.)\)$/u);
            if (found)
            {
                let number = found[1];
                let comment = found[2].trim ();
                let codePoint = found[3];
                let character = found[4];
                if (String.fromCodePoint (parseInt (codePoint.replace ("U+", ""), 16)) !== character)
                {
                    console.log ("PUA code point and character mismatch:", codePoint, character);
                }
                unencoded[number] = { codePoint, character, comment };
            }
        }
        else
        {
            let fields = line.split ("\t");
            let codePoint = fields[0];
            let character = fields[1];
            if (String.fromCodePoint (parseInt (codePoint.replace ("U+", ""), 16)) !== character)
            {
                console.log ("Code point and character mismatch:", codePoint, character);
            }
            let data = { };
            let sequences = [ ];
            let strings = fields.slice (2);
            for (let string of strings)
            {
                if (string[0] === "*")
                {
                    data.notes = string.slice (1).trim ();
                }
                else
                {
                    let found = string.match (/\^?(.*)\$(?:\((.*)\))?/u);
                    if (found)
                    {
                        sequences.push
                        (
                            {
                                ids: found[1].replaceAll (/\{\d+\}/gu, number => unencoded[number].character),
                                source: found[2]
                            }
                        );
                    }
                }
            }
            data.sequences = sequences;
            codePoints[codePoint] = data;
        }
    }
}
//
let unencodedCharacters = { };
//
for (let value of Object.values (unencoded))
{
    unencodedCharacters[value.character] = value.comment;
}
//
module.exports = { codePoints, unencodedCharacters };
//
