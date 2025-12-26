const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['artwork', 'review', 'user'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reporterUid: { type: String, required: true },
    message: { type: String, default: '' },
    status: { type: String, enum: ['open', 'resolved', 'dismissed'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', ReportSchema);
