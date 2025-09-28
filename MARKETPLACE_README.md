# PDF/DOCX Reader

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://marketplace.visualstudio.com/items?itemName=padg9912.pdf-docx-reader)
[![Downloads](https://img.shields.io/badge/downloads-0-red.svg)](https://marketplace.visualstudio.com/items?itemName=padg9912.pdf-docx-reader)
[![Rating](https://img.shields.io/badge/rating-0.0/5-yellow.svg)](https://marketplace.visualstudio.com/items?itemName=padg9912.pdf-docx-reader)

Read PDF and DOCX files directly in VS Code/Cursor IDE. Extract text content, metadata, and integrate with AI workflows.

## Features

- 📄 **PDF Support** - Extract text from PDF files using pdfplumber and PyPDF2
- 📝 **DOCX Support** - Read Microsoft Word documents with python-docx
- 🤖 **AI Integration** - Perfect for AI agents and automated workflows
- 📊 **Metadata Extraction** - Get document properties, author, creation date
- 🔄 **Multiple Formats** - JSON for AI processing, text for human reading
- ⚡ **Context Menu** - Right-click on PDF/DOCX files to read them
- 🎯 **Command Palette** - Quick access via Ctrl/Cmd + Shift + P
- 📦 **Batch Processing** - Process multiple files at once

## Quick Start

1. **Install the extension** from the marketplace
2. **Install Python dependencies**:
   ```bash
   pip install pdfplumber PyPDF2 python-docx
   ```
3. **Right-click** on any PDF or DOCX file → "Read PDF/DOCX File"

## Usage

### Context Menu
Right-click on any PDF or DOCX file in the Explorer and select "Read PDF/DOCX File"

### Command Palette
- Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
- Search for "PDF/DOCX Reader"
- Choose your preferred command

### AI Integration
Perfect for AI agents and automated workflows:

```python
from pdf_docx_reader import FileReader

reader = FileReader()
data = reader.read_file("document.pdf")
print(data['full_text'])  # Ready for AI processing
```

## Commands

- `PDF/DOCX Reader: Read PDF/DOCX File` - Read file with default format
- `PDF/DOCX Reader: Read PDF/DOCX as Text` - Read as formatted text
- `PDF/DOCX Reader: Read PDF/DOCX as JSON` - Read as JSON for AI processing
- `PDF/DOCX Reader: Batch Process PDF/DOCX Files` - Process multiple files
- `PDF/DOCX Reader: Read File for AI Processing` - AI-optimized reading
- `PDF/DOCX Reader: Get Document Summary` - Quick document overview

## Output Formats

### JSON (Default - AI Optimized)
```json
{
  "file_path": "/path/to/document.pdf",
  "file_type": "PDF",
  "full_text": "Complete document text...",
  "metadata": {
    "title": "Document Title",
    "author": "Author Name",
    "creation_date": "2024-01-01"
  },
  "page_count": 5
}
```

### Text (Human Readable)
```
File: document.pdf
Type: PDF
Pages: 5

Metadata:
  title: Document Title
  author: Author Name

Content:
Complete document text...
```

## Requirements

- **Python 3.7+** with the following packages:
  - `pdfplumber>=0.9.0`
  - `PyPDF2>=3.0.0`
  - `python-docx>=0.8.11`

Install with: `pip install pdfplumber PyPDF2 python-docx`

## Configuration

The extension provides several configuration options:

- `pdfDocxReader.pythonPath` - Path to Python executable (default: "python")
- `pdfDocxReader.outputFormat` - Default output format (default: "json")
- `pdfDocxReader.showMetadata` - Show document metadata (default: true)
- `pdfDocxReader.maxFileSize` - Maximum file size in MB (default: 50)

## Troubleshooting

### Common Issues

1. **"Python not found" error**
   - Ensure Python is installed and in your PATH
   - Update the `pdfDocxReader.pythonPath` setting

2. **"Module not found" errors**
   - Install required Python packages: `pip install pdfplumber PyPDF2 python-docx`

3. **Empty text extraction**
   - Some PDFs are scanned images - you'll need OCR for those
   - The extension tries multiple PDF readers automatically

## Examples

### Reading a Research Paper
```bash
python pdf_docx_reader.py research_paper.pdf --output-format text
```

### Batch Processing
```bash
for pdf in *.pdf; do
    python pdf_docx_reader.py "$pdf" > "${pdf%.pdf}.txt"
done
```

### AI Integration
```python
import subprocess
import json

result = subprocess.run([
    'python', 'pdf_docx_reader.py', 'document.pdf', '--output-format', 'json'
], capture_output=True, text=True)

data = json.loads(result.stdout)
content = data['full_text']  # Ready for AI processing
```

## Contributing

Found a bug? Have an idea? Open an issue or send a PR!

- [GitHub Repository](https://github.com/padg9912/cursor-pdf-docx-reader-)
- [Report Issues](https://github.com/padg9912/cursor-pdf-docx-reader-/issues)

## License

MIT License - feel free to use it however you want.

## Changelog

### v1.0.0
- Initial release
- PDF and DOCX file reading support
- AI integration features
- Context menu integration
- Command palette support
- Batch processing capabilities
- Metadata extraction
- Multiple output formats

---

**Made with ❤️ for the VS Code/Cursor IDE community**
