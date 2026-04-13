const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware tənzimləmələri
app.use(cors()); // GitHub Pages-dən gələn sorğulara icazə vermək üçün
app.use(express.json());

// MongoDB-yə qoşulma
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB bağlantısı uğurludur'))
    .catch(err => console.error('MongoDB bağlantı xətası:', err));

// Verilənlər bazası sxemi (Schema)
const pageSchema = new mongoose.Schema({
    pageId: { type: String, required: true, unique: true },
    views: { type: Number, default: 0 }
});

const Page = mongoose.model('Page', pageSchema);

// Baxış sayını artıran və qaytaran API Endpoint
app.post('/api/views', async (req, res) => {
    const { pageId, increment } = req.body;

    if (!pageId) {
        return res.status(400).json({ error: 'pageId tələb olunur' });
    }

    try {
        // Əgər increment true-dursa 1 vahid artır, deyilsə sadəcə mövcud sayı gətir
        const update = increment ? { $inc: { views: 1 } } : {};
        
        const page = await Page.findOneAndUpdate(
            { pageId: pageId },
            update,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ views: page.views });
    } catch (err) {
        res.status(500).json({ error: 'Server xətası baş verdi' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda işləyir`));