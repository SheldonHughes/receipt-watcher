flowchart TD
A[Start App] --> B[Watch ScannerInbox Folder]
B --> C[New File Detected]
C --> D{File Fully Synced?}
D -->|No| D
D -->|Yes| E[Run OCR on File]
E --> F[Extract Text]
F --> G{Date Found?}
G -->|No| H[Move to Manual Review Folder]
G -->|Yes| I[Parse Date]
I --> J[Determine Month Folder]
J --> K{Folder Exists?}
K -->|No| L[Create Folder]
K -->|Yes| M[Move File]
L --> M
M --> N[Log Action]
N --> B

OneDrive/
└── ScannerInbox/
└── scanned_file.pdf (or .jpg/.png)
