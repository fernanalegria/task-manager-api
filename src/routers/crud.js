const HttpStatus = require("http-status-codes");
const express = require("express");

const badRequestErrors = ["ValidationError", "CastError"];

const createDocument = async (ModelClass, document, res) => {
  const instance = new ModelClass(document);
  try {
    const document = await instance.save();
    res.status(HttpStatus.CREATED).send(document);
  } catch (e) {
    res.status(HttpStatus.BAD_REQUEST).send({ error: e.message });
  }
};

const getAllDocuments = async (ModelClass, res) => {
  try {
    const allDocuments = await ModelClass.find({});
    res.status(HttpStatus.OK).send(allDocuments);
  } catch (e) {
    res.status(HttpStatus.SERVICE_UNAVAILABLE).send();
  }
};

const getDocumentById = async (ModelClass, id, res) => {
  try {
    const document = await ModelClass.findById(id);
    if (!document) {
      return res.status(HttpStatus.NOT_FOUND).send({
        error: `Document not found in collection ${ModelClass.collection.name}`
      });
    }
    res.status(HttpStatus.OK).send(document);
  } catch (e) {
    const statusCode = badRequestErrors.includes(e.name)
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.SERVICE_UNAVAILABLE;
    const error = e.errmsg ? e.errmsg : e.message;
    res.status(statusCode).send({ error });
  }
};

const updateDocument = async (
  ModelClass,
  id,
  updates,
  res,
  allowedUpdates = []
) => {
  if (allowedUpdates.length > 0) {
    const invalidUpdates = Object.keys(updates).filter(
      update => !allowedUpdates.includes(update)
    );
    if (invalidUpdates.length > 0) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ error: `Invalid updates: ${invalidUpdates}` });
    }
  }

  try {
    const document = await ModelClass.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });
    if (!document) {
      return res.status(HttpStatus.NOT_FOUND).send({
        error: `Document not found in collection ${ModelClass.collection.name}`
      });
    }
    res.status(HttpStatus.OK).send(document);
  } catch (e) {
    const statusCode = badRequestErrors.includes(e.name)
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.SERVICE_UNAVAILABLE;
    const error = e.errmsg ? e.errmsg : e.message;
    res.status(statusCode).send({ error });
  }
};

const deleteDocument = async (ModelClass, id, res) => {
  try {
    const document = await ModelClass.findByIdAndRemove(id);
    if (!document) {
      return res.status(HttpStatus.NOT_FOUND).send({
        error: `Document not found in collection ${ModelClass.collection.name}`
      });
    }
    res.status(HttpStatus.NO_CONTENT).send();
  } catch (e) {
    const statusCode = badRequestErrors.includes(e.name)
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.SERVICE_UNAVAILABLE;
    const error = e.errmsg ? e.errmsg : e.message;
    res.status(statusCode).send({ error });
  }
};

const getRouter = (ModelClass, methods, options = {}) => {
  const router = new express.Router();

  if (methods.create) {
    router.post("", (req, res) => {
      createDocument(ModelClass, req.body, res);
    });
  }

  if (methods.read) {
    router.get("", (_req, res) => {
      getAllDocuments(ModelClass, res);
    });

    router.get("/:id", (req, res) => {
      getDocumentById(ModelClass, req.params.id, res);
    });
  }

  if (methods.update) {
    router.patch("/:id", (req, res) => {
      updateDocument(
        ModelClass,
        req.params.id,
        req.body,
        res,
        options.allowedUpdates
      );
    });
  }

  if (methods.delete) {
    router.delete("/:id", (req, res) => {
      deleteDocument(ModelClass, req.params.id, res);
    });
  }

  return router;
};

module.exports = {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getRouter
};
