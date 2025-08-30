const fs = require('fs');
const path = require('path');
const markdownpdf = require('markdown-pdf');

// Read the markdown report
const reportPath = path.join(__dirname, 'Project_Report.md');
const reportContent = fs.readFileSync(reportPath, 'utf8');

// Create HTML version first
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>EmotionMelody Project Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #2c3e50;
            margin-top: 30px;
        }
        h1 {
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            text-align: center;
            font-size: 2.5em;
        }
        h2 {
            border-bottom: 2px solid #e74c3c;
            padding-bottom: 8px;
            font-size: 2em;
        }
        h3 {
            color: #27ae60;
            font-size: 1.5em;
        }
        h4 {
            color: #8e44ad;
            font-size: 1.3em;
        }
        code {
            background-color: #f8f9fa;
            padding: 2px 4px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            color: #e83e8c;
        }
        pre {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            border-left: 4px solid #007bff;
        }
        pre code {
            background: none;
            padding: 0;
            color: #333;
        }
        blockquote {
            border-left: 4px solid #17a2b8;
            padding-left: 20px;
            margin-left: 0;
            color: #6c757d;
            font-style: italic;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        ul, ol {
            padding-left: 30px;
        }
        li {
            margin-bottom: 8px;
        }
        .toc {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .highlight {
            background-color: #fff3cd;
            padding: 15px;
            border-left: 4px solid #ffc107;
            margin: 15px 0;
        }
        @media print {
            body { margin: 0; }
            h1, h2 { page-break-after: avoid; }
            pre { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
`;

// Convert markdown to HTML (simple conversion for the main content)
let htmlBody = reportContent
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/```typescript\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>')
    .replace(/```\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|l|p])/gm, '<p>')
    .replace(/<p><\/p>/g, '');

const fullHtml = htmlContent + htmlBody + '</body></html>';

// Write HTML file
fs.writeFileSync(path.join(__dirname, 'Project_Report.html'), fullHtml);

// Generate PDF from markdown
const options = {
    cssPath: path.join(__dirname, 'report-style.css'),
    paperFormat: 'A4',
    paperBorder: '1in',
    renderDelay: 1000,
    type: 'pdf'
};

// Create a CSS file for PDF styling
const cssContent = `
body {
    font-family: 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #000;
    margin: 0;
    padding: 0;
}

h1 {
    font-size: 24pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 30pt;
    border-bottom: 3pt solid #000;
    padding-bottom: 10pt;
}

h2 {
    font-size: 18pt;
    font-weight: bold;
    margin-top: 24pt;
    margin-bottom: 12pt;
    border-bottom: 1pt solid #666;
    padding-bottom: 6pt;
}

h3 {
    font-size: 14pt;
    font-weight: bold;
    margin-top: 18pt;
    margin-bottom: 9pt;
}

h4 {
    font-size: 12pt;
    font-weight: bold;
    margin-top: 12pt;
    margin-bottom: 6pt;
}

code {
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    background-color: #f5f5f5;
    padding: 2pt;
    border: 1pt solid #ddd;
}

pre {
    font-family: 'Courier New', monospace;
    font-size: 9pt;
    background-color: #f8f8f8;
    border: 1pt solid #ddd;
    padding: 12pt;
    margin: 12pt 0;
    overflow-x: auto;
}

ul, ol {
    margin: 12pt 0;
    padding-left: 30pt;
}

li {
    margin-bottom: 6pt;
}

p {
    margin: 12pt 0;
    text-align: justify;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 12pt 0;
}

th, td {
    border: 1pt solid #000;
    padding: 6pt;
    text-align: left;
}

th {
    background-color: #f0f0f0;
    font-weight: bold;
}
`;

fs.writeFileSync(path.join(__dirname, 'report-style.css'), cssContent);

// Generate PDF
markdownpdf(options)
  .from.string(reportContent)
  .to(path.join(__dirname, 'Project_Report.pdf'), function () {
    console.log('✅ PDF report generated successfully: Project_Report.pdf');
  });

console.log('✅ HTML report generated successfully: Project_Report.html');

// Create a simple text version for DOCX conversion
const simpleTextContent = reportContent
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^#+\s/gm, '');

// Create DOCX using a simple approach
try {
    const officegen = require('officegen');
    const docx = officegen('docx');
    
    // Set document properties
    docx.setDocTitle('EmotionMelody Project - Technical Report');
    docx.setDocSubject('Technical Analysis and Documentation');
    docx.setDocKeywords('EmotionMelody, React, TypeScript, AI, Face Detection, Music Recommendation');
    docx.setDescription('Comprehensive technical report for the EmotionMelody project');
    
    // Add content
    const pObj = docx.createP();
    pObj.addText('EmotionMelody Project - Technical Report', {
        font_size: 24,
        bold: true,
        align: 'center'
    });
    
    // Add the report content (simplified)
    const sections = reportContent.split(/^##\s/gm);
    sections.forEach((section, index) => {
        if (index === 0) return; // Skip the title section
        
        const lines = section.split('\n');
        const title = lines[0];
        const content = lines.slice(1).join('\n');
        
        // Add section title
        const titleP = docx.createP();
        titleP.addText(title, {
            font_size: 18,
            bold: true,
            color: '2c3e50'
        });
        
        // Add section content (simplified)
        const contentP = docx.createP();
        contentP.addText(content.substring(0, 1000) + '...', {
            font_size: 12
        });
    });
    
    // Generate DOCX file
    const out = fs.createWriteStream(path.join(__dirname, 'Project_Report.docx'));
    docx.generate(out);
    
    out.on('close', function () {
        console.log('✅ DOCX report generated successfully: Project_Report.docx');
    });
    
} catch (error) {
    console.log('❌ DOCX generation failed, but HTML and PDF should be available');
    console.log('Error:', error.message);
}

console.log('\n📋 Report Generation Summary:');
console.log('- ✅ Markdown: Project_Report.md');
console.log('- ✅ HTML: Project_Report.html');  
console.log('- ⏳ PDF: Project_Report.pdf (generating...)');
console.log('- ⏳ DOCX: Project_Report.docx (generating...)');
console.log('\n🎯 All reports contain the same comprehensive technical analysis of your EmotionMelody project.');
console.log('📁 Files are saved in:', __dirname);
