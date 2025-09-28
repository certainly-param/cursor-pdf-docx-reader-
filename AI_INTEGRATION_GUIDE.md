# AI Agent Integration Guide

This guide explains how AI agents in Cursor IDE can use the PDF/DOCX Reader extension to process documents.

## 🤖 How AI Agents Connect with the Extension

### Method 1: Direct Python Script Execution
AI agents can execute the Python script directly:

```python
import subprocess
import json
import os

def read_document_for_ai(file_path):
    """Read a PDF or DOCX file and return structured data for AI processing."""
    try:
        # Execute the PDF reader script
        result = subprocess.run([
            'python', 'pdf_docx_reader.py', file_path, '--output-format', 'json'
        ], capture_output=True, text=True, cwd=os.path.dirname(__file__))
        
        if result.returncode == 0:
            data = json.loads(result.stdout)
            return {
                'success': True,
                'content': data['full_text'],
                'metadata': data['metadata'],
                'file_type': data['file_type'],
                'page_count': data.get('page_count', 0),
                'paragraph_count': data.get('paragraph_count', 0)
            }
        else:
            return {'success': False, 'error': result.stderr}
    except Exception as e:
        return {'success': False, 'error': str(e)}

# Usage example
document_data = read_document_for_ai('research_paper.pdf')
if document_data['success']:
    print(f"Document content: {document_data['content'][:200]}...")
    print(f"Author: {document_data['metadata'].get('author', 'Unknown')}")
```

### Method 2: Extension Commands
AI agents can trigger extension commands programmatically:

```typescript
// In a TypeScript/JavaScript context
import * as vscode from 'vscode';

async function readDocumentViaExtension(filePath: string) {
    try {
        // Call the AI-specific command
        const result = await vscode.commands.executeCommand(
            'pdfDocxReader.readFileForAI', 
            filePath
        );
        return result;
    } catch (error) {
        console.error('Extension command failed:', error);
        return null;
    }
}

// Get document summary
async function getDocumentSummary(filePath: string) {
    const summary = await vscode.commands.executeCommand(
        'pdfDocxReader.getDocumentSummary', 
        filePath
    );
    return summary;
}
```

### Method 3: File System Integration
The extension automatically detects PDF/DOCX files in the workspace:

```python
import os
import glob

def find_and_process_documents(workspace_path):
    """Find all PDF/DOCX files in workspace and process them."""
    documents = []
    
    # Find all PDF and DOCX files
    pdf_files = glob.glob(os.path.join(workspace_path, '**/*.pdf'), recursive=True)
    docx_files = glob.glob(os.path.join(workspace_path, '**/*.docx'), recursive=True)
    
    all_files = pdf_files + docx_files
    
    for file_path in all_files:
        print(f"Processing: {file_path}")
        result = read_document_for_ai(file_path)
        if result['success']:
            documents.append({
                'file': file_path,
                'content': result['content'],
                'metadata': result['metadata']
            })
    
    return documents
```

## 🔧 AI-Specific Features

### 1. Structured Data Output
The extension provides AI-optimized JSON output:

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
  "page_count": 5,
  "pages": [
    {
      "page_number": 1,
      "text": "Page 1 content...",
      "char_count": 1500
    }
  ]
}
```

### 2. Document Summarization
Get quick document summaries:

```python
def get_document_summary(file_path):
    """Get a summary of the document without full content."""
    result = subprocess.run([
        'python', 'pdf_docx_reader.py', file_path, '--output-format', 'json'
    ], capture_output=True, text=True)
    
    if result.returncode == 0:
        data = json.loads(result.stdout)
        return {
            'file_name': os.path.basename(file_path),
            'type': data['file_type'],
            'size': len(data['full_text']),
            'pages': data.get('page_count', 0),
            'author': data['metadata'].get('author', 'Unknown'),
            'title': data['metadata'].get('title', 'Untitled')
        }
    return None
```

### 3. Batch Processing
Process multiple documents efficiently:

```python
def process_multiple_documents(file_paths):
    """Process multiple documents and return structured results."""
    results = []
    
    for file_path in file_paths:
        print(f"Processing {file_path}...")
        result = read_document_for_ai(file_path)
        results.append({
            'file': file_path,
            'success': result['success'],
            'data': result if result['success'] else None,
            'error': result.get('error') if not result['success'] else None
        })
    
    return results
```

## 🎯 Common AI Use Cases

### 1. Document Analysis
```python
def analyze_document(file_path):
    """Analyze a document and extract key information."""
    data = read_document_for_ai(file_path)
    if not data['success']:
        return None
    
    content = data['content']
    metadata = data['metadata']
    
    analysis = {
        'word_count': len(content.split()),
        'char_count': len(content),
        'title': metadata.get('title', 'Untitled'),
        'author': metadata.get('author', 'Unknown'),
        'creation_date': metadata.get('creation_date', 'Unknown'),
        'first_paragraph': content.split('\n\n')[0] if content else '',
        'key_topics': extract_key_topics(content)  # Your AI analysis here
    }
    
    return analysis
```

### 2. Content Extraction
```python
def extract_specific_content(file_path, search_terms):
    """Extract content related to specific terms."""
    data = read_document_for_ai(file_path)
    if not data['success']:
        return []
    
    content = data['content']
    relevant_sections = []
    
    for term in search_terms:
        if term.lower() in content.lower():
            # Find context around the term
            start = content.lower().find(term.lower())
            context = content[max(0, start-100):start+200]
            relevant_sections.append({
                'term': term,
                'context': context
            })
    
    return relevant_sections
```

### 3. Document Comparison
```python
def compare_documents(file1, file2):
    """Compare two documents and find similarities/differences."""
    doc1 = read_document_for_ai(file1)
    doc2 = read_document_for_ai(file2)
    
    if not (doc1['success'] and doc2['success']):
        return None
    
    comparison = {
        'file1': {
            'name': os.path.basename(file1),
            'word_count': len(doc1['content'].split()),
            'author': doc1['metadata'].get('author', 'Unknown')
        },
        'file2': {
            'name': os.path.basename(file2),
            'word_count': len(doc2['content'].split()),
            'author': doc2['metadata'].get('author', 'Unknown')
        },
        'similarity': calculate_similarity(doc1['content'], doc2['content'])
    }
    
    return comparison
```

## 🚀 Quick Start for AI Agents

1. **Install the extension** in Cursor IDE
2. **Install Python dependencies**:
   ```bash
   pip install pdfplumber PyPDF2 python-docx
   ```
3. **Use the Python script directly**:
   ```python
   from pdf_docx_reader import FileReader
   
   reader = FileReader()
   data = reader.read_file('document.pdf')
   print(data['full_text'])
   ```

## 🔍 Error Handling

The extension provides comprehensive error handling:

```python
def safe_read_document(file_path):
    """Safely read a document with error handling."""
    try:
        result = read_document_for_ai(file_path)
        if result['success']:
            return result
        else:
            print(f"Error reading {file_path}: {result['error']}")
            return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None
```

## 📝 Best Practices

1. **Always check for success** before using the data
2. **Handle errors gracefully** - some PDFs might be corrupted
3. **Use appropriate output format** - JSON for AI processing, text for display
4. **Process large documents in chunks** if memory is a concern
5. **Cache results** for frequently accessed documents

This integration makes it easy for AI agents to process documents in Cursor IDE! 🤖📄
