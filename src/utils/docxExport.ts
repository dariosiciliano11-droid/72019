import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export async function exportToDocx(markdownContent: string, filename: string) {
  const lines = markdownContent.split('\n');
  const children: Paragraph[] = [];

  const DEFAULT_FONT = 'Aptos';
  const DEFAULT_SIZE = 24; // 12pt (measured in half-points)
  const LINE_SPACING = 360; // 1.5 lines (240 * 1.5)
  const BRAND_BLUE = '002b3d';
  let lastWasSignature = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Ignore empty lines and horizontal rules
    if (!trimmedLine || trimmedLine === '---') {
      continue;
    }

    // Handle Headings
    if (trimmedLine.startsWith('# ')) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: trimmedLine.replace('# ', ''),
          bold: true,
          size: 32, // 16pt
          font: DEFAULT_FONT,
          color: BRAND_BLUE,
        })],
        heading: HeadingLevel.HEADING_1,
        spacing: { line: LINE_SPACING, before: 200, after: 0 },
        alignment: AlignmentType.CENTER,
      }));
    } else if (trimmedLine.startsWith('## ')) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: trimmedLine.replace('## ', ''),
          bold: true,
          size: 28, // 14pt
          font: DEFAULT_FONT,
          color: BRAND_BLUE,
        })],
        heading: HeadingLevel.HEADING_2,
        spacing: { line: LINE_SPACING, before: 150, after: 0 },
        alignment: AlignmentType.LEFT,
      }));
    } else if (trimmedLine.startsWith('### ')) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: trimmedLine.replace('### ', ''),
          bold: true,
          size: 24, // 12pt
          font: DEFAULT_FONT,
          color: BRAND_BLUE,
        })],
        heading: HeadingLevel.HEADING_3,
        spacing: { line: LINE_SPACING, before: 100, after: 0 },
        alignment: AlignmentType.LEFT,
      }));
    } 
    // Handle Lists
    else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: trimmedLine.substring(2),
          size: DEFAULT_SIZE,
          font: DEFAULT_FONT,
        })],
        bullet: { level: 0 },
        spacing: { line: LINE_SPACING, after: 0 },
        alignment: AlignmentType.JUSTIFIED,
      }));
    }
    // Handle Bold (Basic implementation)
    else {
      const parts = trimmedLine.split(/(\*\*.*?\*\*)/g);
      const textRuns = parts.map(part => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return new TextRun({
            text: part.slice(2, -2),
            bold: true,
            size: DEFAULT_SIZE,
            font: DEFAULT_FONT,
          });
        }
        return new TextRun({
          text: part,
          size: DEFAULT_SIZE,
          font: DEFAULT_FONT,
        });
      });

      const isSignature = trimmedLine.toLowerCase().startsWith('il presidente') || 
                          trimmedLine.toLowerCase().startsWith('il segretario');
      
      const spacingBefore = (isSignature && !lastWasSignature) ? 800 : 0;
      lastWasSignature = isSignature;

      children.push(new Paragraph({
        children: textRuns,
        spacing: { 
          line: LINE_SPACING, 
          after: 0,
          before: spacingBefore
        },
        alignment: isSignature ? AlignmentType.LEFT : AlignmentType.JUSTIFIED,
      }));
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            size: DEFAULT_SIZE,
            font: DEFAULT_FONT,
          },
          paragraph: {
            alignment: AlignmentType.JUSTIFIED,
            spacing: { line: LINE_SPACING },
          },
        },
      },
    },
    sections: [{
      properties: {},
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}
