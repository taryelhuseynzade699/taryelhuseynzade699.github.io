const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = 'views.json';

app.use(cors());
app.use(express.json());

// Məlumatları fayldan oxu
let viewData = {};
if (fs.existsSync(DATA_FILE)) {
    viewData = JSON.parse(fs.readFileSync(DATA_FILE));
}

app.get('/api/views', (req, res) => {
    const pageId = req.query.pageId || 'home';
    
    // İzləmə sayını artır
    viewData[pageId] = (viewData[pageId] || 0) + 1;
    
    // Fayla qeyd et
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(viewData, null, 2));
        res.json({ views: viewData[pageId] });
    } catch (err) {
        res.status(500).json({ error: 'Məlumat saxlanıla bilmədi' });
    }
});

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda işləyir.`);
});