import mammoth from 'mammoth';
import { asBlob } from 'html-docx-js-typescript';
import FileSaver from 'file-saver';

// Handle default export inconsistency in different environments for file-saver
const saveAs = FileSaver.saveAs || FileSaver;

/**
 * Reads the text content from a File object.
 * Supports .txt, .csv (as text), and .docx.
 */
export async function readFileContent(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'docx') {
    return readDocx(file);
  } else if (extension === 'txt' || extension === 'csv') {
    return readTextFile(file);
  } else {
    throw new Error('不支持的文件格式。请上传 .txt, .csv 或 .docx 文件。');
  }
}

async function readDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // Mammoth might be imported as a default object with properties
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("Error reading docx:", error);
    throw new Error("无法读取 Word 文件，请确保文件未损坏。");
  }
}

function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(new Error("读取文件失败"));
    reader.readAsText(file);
  });
}

/**
 * Exports HTML string content as a .docx file.
 */
export async function exportToDocx(htmlContent: string, filename: string) {
  // Wrap content in a standard HTML template for Word
  const fullHtml = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${filename}</title>
        <style>
          body { font-family: 'Calibri', 'SimSun', sans-serif; font-size: 11pt; line-height: 1.5; }
          h1 { font-size: 18pt; font-weight: bold; color: #2E2E2E; margin-bottom: 12pt; }
          h2 { font-size: 14pt; font-weight: bold; color: #4F46E5; margin-top: 18pt; margin-bottom: 6pt; }
          h3 { font-size: 12pt; font-weight: bold; color: #333333; margin-top: 12pt; margin-bottom: 4pt; }
          p { margin-bottom: 8pt; text-align: justify; }
          ul, ol { margin-bottom: 8pt; }
          li { margin-bottom: 4pt; }
          strong { font-weight: bold; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

  try {
    const blob = await asBlob(fullHtml);
    if (blob) {
      saveAs(blob as Blob, `${filename}.docx`);
    } else {
        throw new Error("生成 Blob 失败");
    }
  } catch (error) {
    console.error("Export docx error:", error);
    alert("导出 Word 文件失败，请重试。");
  }
}