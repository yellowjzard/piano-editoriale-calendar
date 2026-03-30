const mammoth = require("mammoth");

function parseTextData(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let currentWeek = 1;
    let posts = [];
    let currentPost = null;
    let captureMode = null; 

    const dayRegex = /(lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)/i;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        const weekMatch = line.match(/SETTIMANA\s+(\d+)/i);
        if (weekMatch) {
            currentWeek = parseInt(weekMatch[1]);
            continue;
        }

        if (line.match(/^POST\s*\d+:/i)) {
            if (currentPost) posts.push(currentPost); 
            
            let dayMatch = line.match(dayRegex);
            let dayName = dayMatch ? dayMatch[0].toUpperCase() : "DATA DA DEFINIRE";
            
            currentPost = {
                week: currentWeek,
                day: dayName,
                channel: 'LinkedIn / Instagram / FB',
                format: "N/D",
                rubrica: "Rubrica",
                visual: "",
                copy: ""
            };
            captureMode = null;
        }

        if (!currentPost) continue;

        if (line.toLowerCase().startsWith("format:")) currentPost.format = line.replace(/format:/i, '').trim();
        if (line.toLowerCase().startsWith("rubrica:") || line.toLowerCase().startsWith("tema da dare:")) currentPost.rubrica = line.replace(/rubrica:|tema da dare:/i, '').trim();
        if (line.toLowerCase().startsWith("canale:") || line.toLowerCase().startsWith("canali:")) currentPost.channel = line.replace(/canale:|canali:/i, '').trim();

        if (line.toLowerCase().includes("visual brief") || line.toLowerCase().includes("struttura riprese")) {
            captureMode = 'visual';
            let splitIdx = line.indexOf(':');
            if (splitIdx !== -1) {
                let inlineText = line.substring(splitIdx + 1).trim();
                // Assicuriamoci che non capti per sbaglio anche il "testo del post" se scritto di seguito male
                if (inlineText && !inlineText.toLowerCase().includes("testo del post")) {
                    currentPost.visual += inlineText + "\n";
                }
            }
            continue;
        }

        if (line.toLowerCase().includes("testo del post") || line.toLowerCase().includes("caption")) {
            captureMode = 'copy';
            let splitIdx = line.indexOf(':');
            if (splitIdx !== -1) {
                let inlineText = line.substring(splitIdx + 1).trim();
                if (inlineText && !inlineText.toLowerCase().includes("hashtag fisso")) {
                    currentPost.copy += inlineText + "\n";
                }
            }
            continue;
        }

        if (captureMode === 'visual') {
            if(!line.toLowerCase().includes("testo del post")) currentPost.visual += line + "\n";
        } else if (captureMode === 'copy') {
            if(!line.toLowerCase().includes("hashtag fisso")) currentPost.copy += line + "\n";
        }
    }
    
    if (currentPost) posts.push(currentPost);

    return posts;
}

mammoth.extractRawText({path: "Piano Editoriale B2B Aprile 2026.docx"})
    .then(function(result){
        const text = result.value; 
        const posts = parseTextData(text);
        
        console.log("Found", posts.length, "posts.");
        let p7 = posts.find(p => p.visual.includes("Slide 1") || (p.copy && p.copy.includes("Non tutte le certificazioni")));
        if(p7) {
            console.log("\n--- TEST POST 7 COPY ---");
            console.log(p7.copy);
            console.log("------------------------\n");
        } else {
            console.log("Post 7 not found or empty.");
        }
    })
    .catch(function(error) {
        console.error(error);
    });
