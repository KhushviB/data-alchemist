# Data Alchemist - AI-Powered Data Management Platform

Transform your messy CSV/XLSX files into intelligent, validated resource allocation systems with AI-powered validation, natural language search, and automated error correction.

## 🚀 Features

### Core Features
- **AI-Powered File Upload**: Intelligent header mapping and data structure detection
- **Interactive Data Grid**: Edit data inline with real-time validation
- **AI Validation Engine**: Automated error detection and correction suggestions
- **Natural Language Search**: Query your data using plain English
- **Business Rules Engine**: Create intelligent rules via UI or natural language
- **Multi-Format Export**: Export cleaned data in CSV, Excel, and JSON formats

### Advanced Features
- **Smart Data Parsing**: Handles messy spreadsheets with inconsistent formatting
- **Cross-Reference Validation**: Validates relationships between clients, workers, and tasks
- **AI-Powered Suggestions**: Intelligent recommendations for data optimization
- **Real-time Error Highlighting**: Visual feedback for validation issues
- **Business Rule Templates**: Pre-built rule templates for common scenarios

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Animations**: Framer Motion
- **Data Grid**: React Data Grid (editable)
- **File Processing**: Papa Parse for CSV, SheetJS for Excel
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd data-alchemist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install required dependencies manually** (due to version conflicts)
   ```bash
   npm install react-data-grid@7.0.0-beta.25
   npm install papaparse xlsx
   npm install framer-motion react-hot-toast
   npm install lucide-react
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage Guide

### 1. Upload Data
- Drag and drop CSV/XLSX files or click to browse
- AI automatically detects and maps headers
- Supports multiple file types (clients, workers, tasks)

### 2. View and Edit Data
- Interactive data grid with inline editing
- Real-time validation feedback
- Sort, filter, and search capabilities

### 3. AI Validation
- Automatic validation runs on data changes
- Cross-reference validation between datasets
- AI-powered error suggestions and corrections

### 4. Natural Language Search
- Search using plain English queries
- Examples:
  - "tasks with duration more than 1"
  - "workers with skill programming"
  - "clients with priority 5"

### 5. Business Rules
- Create rules using natural language or UI
- AI suggests rules based on data patterns
- Support for co-run, exclusive, capacity, and priority rules

### 6. Export Data
- Export in multiple formats (CSV, Excel, JSON)
- Include business rules and validation results
- Timestamped files for easy organization

## 📊 Sample Data

The application includes sample data in `sample-data.json` for testing:

- **3 Clients** with different priority levels and task requests
- **4 Workers** with various skills and availability
- **5 Tasks** with different durations and skill requirements

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_APP_NAME=Data Alchemist
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Customization
- Modify validation rules in `ValidationPanel.tsx`
- Add new business rule types in `BusinessRules.tsx`
- Customize export formats in `ExportPanel.tsx`

## 🧪 Testing

### Manual Testing
1. Upload sample CSV files
2. Test natural language search queries
3. Create and test business rules
4. Export data in different formats

### Sample Test Cases
- Upload files with missing headers
- Test validation with invalid data
- Create complex business rules
- Search with various natural language queries

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Deploy automatically on push to main branch
3. Environment variables are automatically configured

### Other Platforms
- **Netlify**: Build command: `npm run build`
- **Railway**: Automatic deployment from GitHub
- **Docker**: Use the provided Dockerfile

## 📈 Performance

- **File Upload**: Supports files up to 10MB
- **Data Grid**: Handles 10,000+ rows efficiently
- **Search**: Real-time search with debouncing
- **Validation**: Asynchronous validation with progress indicators

## 🎉 Acknowledgments

- Built with Next.js and React
- Styled with Tailwind CSS
- Icons from Lucide React
- File processing with Papa Parse and SheetJS

---

**Data Alchemist** - Transform your data with AI-powered intelligence! 🧪✨
