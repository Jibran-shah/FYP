export const mediaContext = ({
  entity,
  usageType,
  namespace,
  ownerFrom = "user",
  ownerField = "id"
}) => {
  return (req, res, next) => {
    try {
      let owner = null;

      if (ownerFrom === "user") {
        owner = req.user?.[ownerField];
      } else if (ownerFrom === "params") {
        owner = req.params?.[ownerField];
      } else if (ownerFrom === "body") {
        owner = req.body?.[ownerField];
      }

      if (!owner) {
        return res.status(400).json({
          success: false,
          message: "Media context owner not found"
        });
      }

      req.mediaContext = {
        entity,
        usageType,
        namespace,
        owner,

        // 🔥 IMPORTANT ADDITIONS
        hasFile: !!req.media?.file,
        fileId: req.body?.fileId || null,

        timestamp: Date.now()
      };

      next();
    } catch (err) {
      next(err);
    }
  };
};


export const strictMediaContext = (config) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "user not signed in" });
    }

    return mediaContext(config)(req, res, next);
  };
};



export const parseMedia = (fieldName = "file", options = {}) => {
  const allowedMimeTypes = options.allowedMimeTypes || [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
  ];

  const maxSize = options.maxSize || 20 * 1024 * 1024;

  return (req, res, next) => {
    const file = req.file;

    // 🔥 normalize media object
    req.media = {
      file: null,
      fileId: req.body?.fileId || null
    };

    // 1. no file → OK (fallback to fileId allowed)
    if (!file) {
      return next();
    }

    // 2. strict field validation
    if (file.fieldname !== fieldName) {
      return res.status(400).json({
        success: false,
        message: `Invalid file field. Expected '${fieldName}'`
      });
    }

    // 3. size check
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: "File too large"
      });
    }

    // 4. mime validation
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type"
      });
    }

    // 5. attach normalized file
    req.media.file = {
      file,
      mimeType: file.mimetype,
      size: file.size,
      originalName: file.originalname,
      buffer: file.buffer
    };

    next();
  };
};



export const parseMultiMedia = (fields = []) => {
  return (req, res, next) => {
    req.media = {};

    for (const field of fields) {
      const file = req.files?.[field];

      if (!file || file.length === 0) {
        req.media[field] = null;
        continue;
      }

      const f = file[0]; // single per field

      req.media[field] = {
        file: f,
        mimeType: f.mimetype,
        size: f.size,
        originalName: f.originalname,
        buffer: f.buffer
      };
    }

    next();
  };
};