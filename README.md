# PDF/DOCX Reader for Cursor IDE

A simple Python tool I built to help read PDF and DOCX files directly in Cursor IDE. I was tired of not being able to process documents in my AI workflows, so I created this tool to extract text content from PDFs and Word documents.

## What it does

- Reads PDF files (using pdfplumber and PyPDF2 as backup)
- Reads DOCX files (using python-docx)
- Extracts metadata like title, author, creation date
- Outputs in JSON or plain text format
- Handles errors gracefully
- Preserves document structure (pages/paragraphs)

## Setup

1. Clone this repo
2. Install the Python dependencies:

```bash
pip install -r requirements.txt
```

That's it! No complex setup needed.

## How to use it

Just run it with a PDF or DOCX file:

```bash
# Read a PDF (defaults to JSON output)
python pdf_docx_reader.py document.pdf

# Read a DOCX file
python pdf_docx_reader.py document.docx

# Get plain text instead of JSON
python pdf_docx_reader.py document.pdf --output-format text
```

You can also pipe the output to files or use it in scripts:

```bash
# Save to file
python pdf_docx_reader.py document.pdf > output.json

# Process multiple files
for file in *.pdf; do
    python pdf_docx_reader.py "$file" > "${file%.pdf}.txt"
done
```

### Options

- `file_path`: The PDF or DOCX file to read (required)
- `--output-format`: Choose `json` (default) or `text`
- `--help`: Show help
- `--version`: Show version

## Output Format

### JSON Output (Default)

```json
{
  "file_path": "/path/to/document.pdf",
  "file_type": "PDF",
  "pages": [
    {
      "page_number": 1,
      "text": "Page content here...",
      "char_count": 150
    }
  ],
  "full_text": "Complete document text...",
  "metadata": {
    "title": "Document Title",
    "author": "Author Name",
    "creation_date": "2024-01-01",
    "modification_date": "2024-01-02"
  },
  "page_count": 1
}
```

### Text Output

```
File: /path/to/document.pdf
Type: PDF
Pages: 1

Metadata:
  title: Document Title
  author: Author Name
  creation_date: 2024-01-01

Content:
Complete document text here...
```

## Using with Cursor IDE

I built this specifically for Cursor IDE, so it works great there. Just open the terminal in Cursor and run:

```bash
python pdf_docx_reader.py your_document.pdf
```

You can also create a simple wrapper script if you want:

```bash
#!/bin/bash
# pdf_reader.sh
python /path/to/pdf_docx_reader.py "$1" --output-format text
```

Or use it in your Python code:

```python
from pdf_docx_reader import FileReader

reader = FileReader()
data = reader.read_file("document.pdf")
print(data['full_text'])
```

## Troubleshooting

If something goes wrong:

1. **"PDF reading libraries not available"**
   - Run `pip install -r requirements.txt`

2. **"File is not a PDF/DOCX"**
   - Make sure the file has `.pdf` or `.docx` extension

3. **Empty text extraction**
   - Some PDFs are just images - you'll need OCR for those
   - Try the other PDF reader (it switches between pdfplumber and PyPDF2)

4. **Permission errors**
   - Make sure the file isn't locked by another app

## Dependencies

- `pdfplumber>=0.9.0` - Main PDF reader
- `PyPDF2>=3.0.0` - Backup PDF reader  
- `python-docx>=0.8.11` - DOCX reader

## Examples

Reading a research paper:
```bash
python pdf_docx_reader.py research_paper.pdf --output-format text
```

Batch processing:
```bash
for pdf in *.pdf; do
    echo "Processing: $pdf"
    python pdf_docx_reader.py "$pdf" > "${pdf%.pdf}.txt"
done
```

Get just the metadata:
```bash
python pdf_docx_reader.py document.pdf | jq '.metadata'
```

## License

MIT License - feel free to use it however you want.

## Contributing

Found a bug? Have an idea? Open an issue or send a PR. I'm always looking to improve this tool.
