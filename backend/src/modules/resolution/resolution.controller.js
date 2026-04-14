const resolutionService = require('./resolution.service');
const { success } = require('../../core/utils/buildApiResponse');

async function updateStatus(req, res) {
  const { id } = req.params;
  const { status, note } = req.body;
  const changedBy = req.user?.email || 'admin';

  const report = await resolutionService.updateStatus(id, status, note, changedBy);
  res.json(success(report, 'Report status updated'));
}

async function addNote(req, res) {
  const { id } = req.params;
  const { note } = req.body;
  const changedBy = req.user?.email || 'admin';

  const entry = await resolutionService.addNote(id, note, changedBy);
  res.json(success(entry, 'Note added'));
}

async function uploadResolutionImage(req, res) {
  const { id } = req.params;
  const caption = req.body.caption;

  const record = await resolutionService.uploadResolutionPhoto(id, req.file, caption);
  res.status(201).json(success(record, 'Resolution image uploaded'));
}

module.exports = { updateStatus, addNote, uploadResolutionImage };
