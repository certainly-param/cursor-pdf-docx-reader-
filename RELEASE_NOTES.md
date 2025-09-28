# PDF/DOCX Reader v1.0.0 Release

## What's New
- Initial release of PDF/DOCX Reader for Cursor IDE
- Read PDF and DOCX files directly in Cursor IDE
- Context menu integration for easy access
- Support for both JSON and text output formats
- Metadata extraction (title, author, creation date)
- Error handling and file validation

## Installation
1. Download the `pdf-docx-reader-1.0.0.vsix` file
2. Open Cursor IDE
3. Go to Extensions (Ctrl/Cmd + Shift + X)
4. Click the "..." menu and select "Install from VSIX..."
5. Select the downloaded file

## Usage
- Right-click on any PDF or DOCX file in the Explorer
- Select "Read PDF/DOCX File" from the context menu
- Or use the Command Palette (Ctrl/Cmd + Shift + P) and search for "PDF/DOCX Reader"

## Requirements
- Python 3.7+ with the following packages:
  - pdfplumber>=0.9.0
  - PyPDF2>=3.0.0
  - python-docx>=0.8.11

Install with: `pip install pdfplumber PyPDF2 python-docx`

## Features
- **PDF Support**: Extract text using pdfplumber (primary) and PyPDF2 (fallback)
- **DOCX Support**: Read Microsoft Word documents
- **Multiple Output Formats**: JSON for AI processing, text for human reading
- **Metadata Extraction**: Document properties and creation info
- **Error Handling**: Clear error messages and graceful failure handling
- **Batch Processing**: Process multiple files at once

## Changelog
- v1.0.0: Initial release
