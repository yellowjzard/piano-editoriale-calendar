const mammoth = require("mammoth");

mammoth.extractRawText({path: "Piano Editoriale B2B Aprile 2026.docx"})
    .then(function(result){
        const text = result.value; 
        console.log(text);
    })
    .catch(function(error) {
        console.error(error);
    });
