const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

const DESIGN_SYSTEMS_DIR = path.join(__dirname, '../Design Systems');

const categories = [
  { id: 'componentes', label: 'Componentes' },
  { id: 'temas_claros', label: 'Temas Claros' },
  { id: 'temas_escuros', label: 'Temas Escuros' }
];

app.get('/api/projects', (req, res) => {
  const data = categories.map(cat => {
    const dirPath = path.join(DESIGN_SYSTEMS_DIR, cat.id);
    let projects = [];
    
    if (fs.existsSync(dirPath)) {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      projects = items
        .filter(item => item.isDirectory())
        .map(item => {
          const projectPath = path.join(dirPath, item.name);
          const hasIndex = fs.existsSync(path.join(projectPath, 'index.html'));
          
          let hasDesignSystem = false;
          let designSystemFile = '';
          if (fs.existsSync(path.join(projectPath, 'design-system.html'))) {
            hasDesignSystem = true;
            designSystemFile = 'design-system.html';
          } else if (fs.existsSync(path.join(projectPath, 'DesignSystem.html'))) {
            hasDesignSystem = true;
            designSystemFile = 'DesignSystem.html';
          }
          
          let previewFile = '';
          if (hasIndex) previewFile = 'index.html';
          else if (hasDesignSystem) previewFile = designSystemFile;
          
          return {
            name: item.name,
            url: previewFile ? `/preview/${cat.id}/${item.name}/${previewFile}` : '',
            indexUrl: hasIndex ? `/preview/${cat.id}/${item.name}/index.html` : '',
            designSystemUrl: hasDesignSystem ? `/preview/${cat.id}/${item.name}/${designSystemFile}` : '',
            hasIndex,
            hasDesignSystem
          };
        })
        .filter(p => p.hasIndex || p.hasDesignSystem); // Only include those with viewable files
    }
    return { ...cat, projects };
  });
  
  res.json(data);
});

// Serve Design Systems static files for preview
app.use('/preview', express.static(DESIGN_SYSTEMS_DIR));

// Serve the frontend
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Showcase Server is running at http://localhost:${PORT}`);
});
