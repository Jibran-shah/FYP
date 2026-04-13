import { BadRequestError } from "../../../errors/Http.error.js";
import { 
  getAllMediaFiles as getAllMediaFilesService,
  deleteMediaFile as deleteMediaFileService,
  bulkMediaDeleteFiles as bulkDeleteMediaFilesService,
  getMediaFileById as getMediaFileByIdService,
  createMediaFile as createMediaFileService 
} from "./files.service.js";

// ------------------------
// CREATE (Upload file)
export const createMediaFile = async (req, res) => {

  const mediaFile = await createMediaFileService({
    file : req.media?.file || null,
    uploadedBy: req.user?._id
  });

  return res.status(201).json({
    success: true,
    data:mediaFile,
  });
};

// ------------------------
// READ ALL
// ------------------------
export const getAllMediaFiles = async (req, res) => {
  const filters = req.query;
  const { data, pagination } = await getAllMediaFilesService(filters);

  return res.status(200).json({ success:true, data ,pagination });
};

// ------------------------
// READ ONE
// ------------------------
export const getMediaFileById = async (req, res) => {
  const { id } = req.params;

  const mediaFile = await getMediaFileByIdService(id);

  return res.status(200).json({ success:true, data : mediaFile });
};

// ------------------------
// DELETE (single)
// ------------------------
export const deleteMediaFile = async (req, res) => {
  const { id } = req.params;
  await deleteMediaFileService(id, req.user?._id);
  return res.sendStatus(204)
};

// ------------------------
// BULK DELETE
// ------------------------
export const bulkDeleteMediaFiles = async (req, res) => {
  const { ids } = req.body;

  const data = await bulkDeleteMediaFilesService(ids, req.user?._id);

  return res.status(200).json({
    success:true,
    data:data
  });
};