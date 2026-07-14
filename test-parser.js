const mammoth = require("mammoth");

function parseTextData(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let currentWeek = 1;
    let posts = [];
    let currentPost = null;
    let captureMode = null; 

        const dayRegex = /(lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)/i;
        
        const postStartRegex = /^[\s\*\-]*(?:POST|ASSET|CONTENUTO)\s*\d+(?:[\s:\.\-]|$)/i;
        const weekRegex = /^[\s\*\-]*(?:SETTIMANA|WEEK)\s+(\d+)/i;
        const visualRegex = /^[\s\*\-]*(?:visual(?: brief| concept)?|grafica|immagine|struttura riprese)/i;
        const copyRegex = /^[\s\*\-]*(?:copy|testo(?: del post)?|caption)/i;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            const weekMatch = line.match(weekRegex);
            if (weekMatch) {
                currentWeek = parseInt(weekMatch[1]);
                continue;
            }

            if (line.match(postStartRegex)) {
                if (currentPost) posts.push(currentPost); 
                
                let dayMatch = line.match(dayRegex);
                let dayName = dayMatch ? dayMatch[0].toUpperCase() : "DATA DA DEFINIRE";
                
                currentPost = {
                    week: currentWeek,
                    day: dayName,
                    channels: ['LinkedIn', 'Instagram', 'Facebook'],
                    format: "N/D",
                    rubrica: "Rubrica",
                    visual: "",
                    copy: ""
                };
                captureMode = null;
            }

            if (!currentPost) continue;

            if (line.match(/^[\s\*\-]*format[o]?[\s:\.\*\-]/i)) { currentPost.format = line.replace(/^[\s\*\-]*format[o]?[\s:\.\*\-]+/i, '').replace(/\*/g, '').trim(); continue; }
            if (line.match(/^[\s\*\-]*(?:rubrica|tema da dare)[\s:\.\*\-]/i)) { currentPost.rubrica = line.replace(/^[\s\*\-]*(?:rubrica|tema da dare)[\s:\.\*\-]+/i, '').replace(/\*/g, '').trim(); continue; }
            if (line.match(/^[\s\*\-]*canali?[\s:\.\*\-]/i)) { 
                let c = line.replace(/^[\s\*\-]*canali?[\s:\.\*\-]+/i, '').replace(/\*/g, '').trim(); 
                currentPost.channels = c.split(/[,/|]+/).map(s => s.trim()).filter(s => s);
                continue; 
            }

            if (line.match(visualRegex)) {
                captureMode = 'visual';
                let inlineText = line.replace(visualRegex, '').replace(/^[\s:\.\-]+/, '').trim();
                // Assicuriamoci che non capti per sbaglio anche il "testo del post" se scritto di seguito male
                if (inlineText && !inlineText.match(copyRegex)) {
                    currentPost.visual += inlineText + "\n";
                }
                continue;
            }

            if (line.match(copyRegex)) {
                captureMode = 'copy';
                let inlineText = line.replace(copyRegex, '').replace(/^[\s:\.\-]+/, '').trim();
                if (inlineText && !line.toLowerCase().includes("hashtag fisso")) {
                    currentPost.copy += inlineText + "\n";
                }
                continue;
            }

            if (captureMode === 'visual') {
                if(!line.match(copyRegex)) currentPost.visual += line + "\n";
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
