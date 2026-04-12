const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB-yə qoşulma (MONGODB_URI-ni Render-də Environment Variable olaraq əlavə edin)
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("XƏTA: MONGODB_URI dəyişəni təyin edilməyib!");
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB-yə qoşuldu.'))
    .catch(err => console.error('MongoDB bağlantı xətası:', err));

// Baxış sayı üçün sxem (Schema)
const viewSchema = new mongoose.Schema({
    pageId: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 }
});

const View = mongoose.model('View', viewSchema);

app.get('/api/views', async (req, res) => {
    const pageId = req.query.pageId || 'home';
    
    try {
        // Əgər səhifə yoxdursa yaradır, varsa sayını 1 vahid artırır ($inc)
        const result = await View.findOneAndUpdate(
            { pageId: pageId },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        );
        
        res.json({ views: result.count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Məlumat saxlanıla bilmədi' });
    }
});

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda işləyir.`);
});